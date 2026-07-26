# Terraform Patterns & Infrastructure

This document defines Terraform conventions for GECOM components deployed via MACH Composer.

---

## Component Terraform Structure

Each deployable component lives at `apps/generic/<component>/terraform/` and follows this structure:

```
terraform/
├── main.tf              # Provider config, backend, data sources
├── variables.tf         # Input variables (MACH-injected + custom)
├── outputs.tf           # Outputs consumed by other components
├── locals.tf            # Computed values, naming conventions
├── iam.tf               # IAM roles, policies, instance profiles
├── ecs.tf               # ECS Fargate task/service (if applicable)
├── credential-store.tf  # AWS Secrets Manager secrets
├── *.tf                 # Additional resources by domain
```

---

## MACH Composer Integration

### Injected Variables

When a component lists integrations in MACH Composer `components.yml`, variables are automatically injected:

| Integration     | Injected Variables                                         |
| --------------- | ---------------------------------------------------------- |
| `aws`           | `aws_account_id`, `aws_region`                             |
| `commercetools` | `ct_project_key`, `ct_api_url`, `ct_auth_url`, `ct_stores` |

**CRITICAL**: The Terraform module MUST declare these in `variables.tf` or `terraform validate` will fail:

```hcl
# ✅ REQUIRED when using `- commercetools` integration
variable "ct_project_key" { type = string }
variable "ct_api_url" { type = string }
variable "ct_auth_url" { type = string }
variable "ct_stores" {
  type    = map(string)
  default = {}
}
```

### Common Variables

All MACH components receive:

```hcl
variable "site" { type = string }           # e.g., "dev", "qa", "staging"
variable "environment" { type = string }     # e.g., "development"
variable "secrets" {
  type      = map(string)
  default   = {}
  sensitive = true
}
```

---

## for_each: Static Keys at Plan Time (CRITICAL)

**The most common Terraform error in GECOM.** The `for_each` meta-argument requires ALL MAP KEYS to be known at plan time. Values can be unknown (computed at apply), but keys CANNOT.

### ❌ WRONG: Filtering on unknown values makes keys unknown

```hcl
locals {
  all_secrets = {
    OPENAI_API_KEY   = lookup(var.secrets, "openai_api_key", "")
    CT_CLIENT_ID     = commercetools_api_client.chatbot.id      # unknown at plan
    CT_CLIENT_SECRET = commercetools_api_client.chatbot.secret   # unknown at plan
  }
  # This filter creates an UNKNOWN key set because CT values aren't known yet
  filtered = { for k, v in local.all_secrets : k => v if v != "" }
}

resource "aws_secretsmanager_secret" "x" {
  for_each = local.filtered  # 💥 Error: Invalid for_each argument
}
```

### ✅ CORRECT: Separate static-key maps, merge after filtering

```hcl
locals {
  # MACH-passed secrets — values known at plan time (from var.secrets)
  mach_secrets = {
    OPENAI_API_KEY = lookup(var.secrets, "openai_api_key", "")
  }

  # Terraform-managed secrets — values unknown at plan, but KEYS are always known
  terraform_secrets = {
    CT_CLIENT_ID     = commercetools_api_client.chatbot.id
    CT_CLIENT_SECRET = commercetools_api_client.chatbot.secret
  }

  # Safe merge: filter MACH (keys known) + always include Terraform (keys known)
  managed_values = merge(
    { for k, v in local.mach_secrets : k => v if v != "" },
    local.terraform_secrets  # Never filtered — always 2 keys
  )
}
```

**Rule**: If ANY value in the map comes from a resource created during apply, put it in a separate map that is NEVER filtered.

**Ref**: [Terraform for_each Limitations](https://developer.hashicorp.com/terraform/language/meta-arguments/for_each#limitations-on-values-used-in-for_each)

---

## Resource Naming Convention

```hcl
locals {
  component_name = "chatbot-ai"
  secret_prefix  = "${var.site}-${local.component_name}"
  common_tags = {
    Site        = var.site
    Component   = local.component_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
```

- **Secrets Manager**: `${site}-${component}/${SECRET-NAME}-secret-${random_hex}`
- **Lambda functions**: `${site}-${component}-${function-name}`
- **ECS services**: `${site}-${component}`
- **S3 buckets**: `leap-${site}-${component}-${purpose}-${env}`
- **CloudWatch log groups**: `/ecs/${site}-${component}` or `/aws/lambda/${function-name}`

---

## Secrets Manager Pattern

### Two-Category Approach

Always separate secrets by source:

```hcl
# Category 1: MACH-passed secrets (from MACH Composer secrets: block)
locals {
  mach_secrets = {
    OPENAI_API_KEY = lookup(var.secrets, "openai_api_key", "")
    NEO4J_PASSWORD = lookup(var.secrets, "neo4j_password", "")
  }
}

# Category 2: Terraform-managed secrets (from Terraform resources)
locals {
  terraform_secrets = {
    CT_CLIENT_ID     = commercetools_api_client.main.id
    CT_CLIENT_SECRET = commercetools_api_client.main.secret
  }
}
```

### Adding a New Secret

1. Decide category: MACH-passed (add to `var.secrets` in MACH Composer) or Terraform-managed (from a TF resource)
2. Add to appropriate `locals` map in `credential-store.tf`
3. Add `aws_secretsmanager_secret` + `aws_secretsmanager_secret_version` resources
4. Reference ARN in ECS task definition (`secrets` block) or Lambda environment
5. Update MACH Composer `secrets:` block if MACH-passed

---

## KMS Key Patterns

### When to Use KMS

| Resource               | KMS Required       | Pattern                                   |
| ---------------------- | ------------------ | ----------------------------------------- |
| Secrets Manager        | Yes (always)       | `kms_key_id = local.kms_secretsmanager`   |
| S3 buckets             | Yes (data at rest) | `server_side_encryption_configuration`    |
| Kinesis streams        | Optional           | Use `aws/kinesis` managed key as fallback |
| SFTP (Transfer Family) | Yes (auth)         | Explicit KMS key ARN                      |
| DynamoDB               | Yes (if sensitive) | `server_side_encryption` block            |

### Fallback Pattern for Missing KMS

```hcl
# If a specific KMS key isn't available, use AWS managed key
locals {
  kms_kinesis = try(
    data.aws_kms_alias.kinesis.target_key_arn,
    "alias/aws/kinesis"  # Fallback to AWS managed key
  )
}
```

---

## Inline Lambda Python in Terraform

For small Lambdas (<4096 chars), use inline Python in `archive_file`:

```hcl
data "archive_file" "lambda_zip" {
  type        = "zip"
  output_path = "${path.module}/.terraform/tmp/lambda.zip"

  source {
    filename = "lambda_function.py"
    content  = <<-PYTHON
import json
import boto3

def handler(event, context):
    # Lambda logic here
    return {"statusCode": 200}
    PYTHON
  }
}
```

**Rules for inline Python**:

- Keep under 200 lines (larger → separate file + S3 upload)
- Use `<<-PYTHON` heredoc (preserves indentation)
- Test the Python logic locally before embedding
- Strip HTML with `re.sub(r'<[^>]+>', '', text)` (no external deps)

---

## CODEOWNERS

All `*.tf` files in gecom-apps are owned by `@Metagenics/valtech-devops` in CODEOWNERS. Their approval is required for any Terraform changes.

---

## Pre-PR Terraform Validation (MANDATORY)

Before creating any PR that modifies `.tf` files:

```bash
# Option 1: Local validation via MACH Composer (preferred)
cd /path/to/gecom-mach-composer
mach-composer generate -f "./development/main.yml"
cd deployments/main/leap-dev
terraform init
terraform validate

# Option 2: Basic syntax check (minimum)
cd apps/generic/<component>/terraform
terraform fmt -check
terraform validate  # May need init first
```

This catches:

- Missing variable declarations
- for_each unknown key errors
- Provider compatibility issues
- Syntax errors

**Running locally takes seconds. A failed CI/CD cycle wastes 20-40 minutes.**

---

## Common Terraform Errors

| Error                                    | Root Cause                                    | Fix                                        |
| ---------------------------------------- | --------------------------------------------- | ------------------------------------------ |
| `Invalid for_each argument`              | Map keys derived from unknown resources       | Separate static-key and dynamic-value maps |
| `Reference to undeclared input variable` | Missing MACH-injected variable                | Add to `variables.tf`                      |
| `Error: Duplicate resource`              | Tag blocks defined twice                      | Merge into single `tags` block             |
| `Provider produced inconsistent result`  | Provider version mismatch                     | Pin provider versions                      |
| `S3 Bucket Object NotFound`              | Used `git tag` instead of `gh release create` | Create proper GitHub release               |

---

## Confluence References

- [GECOM WoW](https://catalina.atlassian.net/wiki/spaces/NEA/pages/2826436632) — Master WoW
- [Release WoW](https://catalina.atlassian.net/wiki/spaces/NEA/pages/2831220779) — Version tagging, MACH flow
- [Development WoW](https://catalina.atlassian.net/wiki/spaces/NEA/pages/2826207304) — Infrastructure patterns

---

**Last Updated**: 2026-03-24
**Applies To**: All GECOM components with Terraform (`apps/generic/*/terraform/`)
