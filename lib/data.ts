import type { StaticImageData } from 'next/image';
import React from 'react';
import { FaReact } from 'react-icons/fa';
import { LuGraduationCap } from 'react-icons/lu';

import brownBenefits from '@/public/brownbenefits.png';
import metagenicsFrHomepage from '@/public/metagenics_fr_homepage.png';
import jpMetagenics from '@/public/metagenics_jp.png';
import metagenicsHomepage from '@/public/metagenics-homepage.png';
import plmc from '@/public/plmc.png';
import portalMeta from '@/public/portal_metagenics.png';

export type ProjectData = {
  title: string;
  description: string;
  tags: string[];
  imageUrl: StaticImageData;
  projectUrl: string;
  decommissioned?: boolean;
};

export const links = [
  {
    name: 'Home',
    hash: '#home',
  },
  {
    name: 'About',
    hash: '#about',
  },
  {
    name: 'Experience',
    hash: '#experience',
  },
  {
    name: 'Skills',
    hash: '#skills',
  },
  {
    name: 'Projects',
    hash: '#projects',
  },
  {
    name: 'Contact',
    hash: '#contact',
  },
] as const;

export const experiencesData = [
  {
    title: 'Senior Software Engineer, Tech Lead',
    location: 'Metagenics, Inc.',
    description:
      'Progressed from intern to tech lead over 7+ years, owning architecture and delivery of a multi-region eCommerce platform (React/Next.js, Apollo Federation, commercetools, AWS). Led a payment processor migration from CyberSource to Adyen, architected an AI-powered customer support chatbot with AWS Bedrock, and drove adoption of MACH architecture. Reduced deployment overhead by 40% through CI/CD and infrastructure improvements. Mentor engineers, lead cross-functional collaboration with product, design, and QA, and evaluate build-vs-buy decisions for third-party integrations.',
    icon: React.createElement(FaReact),
    date: 'May 2019 - Present',
  },
  {
    title: 'Web Developer (Client Engagement)',
    location: 'Brown Benefits Insurance Services',
    description:
      'Engaged directly with the client to gather requirements, design, and deliver a responsive marketing website. Ensured WCAG accessibility compliance and cross-browser compatibility. Managed the full project lifecycle from discovery through launch.',
    icon: React.createElement(FaReact),
    date: 'Oct 2023 - Dec 2023',
  },
  {
    title: 'Continuing Education, Full-Stack Software Development',
    location: 'University of California, Irvine',
    description:
      "Polished my skills in both front-end and back-end technologies. Through hands-on projects and rigorous training, I've refined the ability to craft scalable and user-centric web applications, ready to contribute innovative solutions to the ever-evolving technology industry.",
    icon: React.createElement(LuGraduationCap),
    date: '2019',
  },
  {
    title: 'B.S. in Chemistry and Biochemistry',
    location: 'California State University, Fullerton',
    description:
      'I honed my analytical skills and passion for STEM fields. Equipped with a solid foundation, I was eager to apply my knowledge to real-world challenges.',
    icon: React.createElement(LuGraduationCap),
    date: '2018',
  },
] as const;

export const projectsData = [
  {
    title: 'metagenics.com',
    description:
      'Led the Frontend development and ongoing FullStack engineering of Metagenics’ global eCommerce platform. Focused on building scalable, high-performance features that deliver a personalized practitioner and patient experience.',
    tags: [
      'React',
      'Next.js',
      'Vercel',
      'TypeScript',
      'HTML/CSS',
      'Contentful CMS',
      'Commercetools',
      'Apollo GraphQL',
      'Axios',
      'React Testing Library',
      'ESLint',
      'AWS Services',
      'Cloudflare',
      'Datadog',
      'Cybersource Payment Processor',
      'Ordergroove Subscriptions',
      'GTM & GA',
      'OneTrust Cookie Consent',
    ],
    imageUrl: metagenicsHomepage,
    projectUrl: 'https://www.metagenics.com',
  },
  {
    title: 'metagenics.fr',
    description:
      'Spearheaded the frontend development and maintenance of the Metagenics.fr eCommerce website, focusing on high performance, accessibility, and scalability.',
    tags: [
      'React',
      'Next.js',
      'Vercel',
      'HTML/CSS',
      'TypeScript',
      'JavaScript',
      'Contentful CMS',
      'commerceTools',
      'AWS Services',
      'Cloudflare',
      'New Relic',
      'Data Dog',
      'Axios',
      'GraphQL',
      'Apollo',
      'React Testing Library',
      'ESLint',
      'Adyen Payment Processor',
    ],
    imageUrl: metagenicsFrHomepage,
    projectUrl: 'https://metagenics.fr',
  },
  {
    title: 'metagenics.co.jp',
    description:
      'Metagenics Japanese eCommerce website, focusing on performance, user experience, and scalability.',
    tags: [
      'React',
      'Next.js',
      'Vercel',
      'HTML/CSS',
      'TypeScript',
      'JavaScript',
      'Contentful CMS',
      'commerceTools',
      'AWS Services',
      'Cloudflare',
      'New Relic',
      'Axios',
      'GraphQL',
      'Apollo',
      'React Testing Library',
      'ESLint',
      'CyberSource Payment Processor',
    ],
    imageUrl: jpMetagenics,
    projectUrl: 'https://www.metagenics.co.jp',
  },
  {
    title: 'brownbenefits.com',
    description:
      'Developed and customized the brownbenefits.com landing page on Wix, focusing on branding requirements, visual appeal, and user experience',
    tags: [
      'Wix',
      'HTML/CSS',
      'Cross-browser Compatibility',
      'Accessibility Standards',
    ],
    imageUrl: brownBenefits,
    projectUrl: 'https://www.brownbenefits.com',
  },
  {
    title: 'portal.metagenics.com',
    description:
      'Led the frontend development and deployment efforts for the portal.metagenics.com website, a marketing platform sponsored by Metagenics, focusing on user engagement, performance, and search engine optimization (SEO).',
    tags: [
      'React',
      'Next.js',
      'Vercel',
      'Tailwind',
      'TypeScript',
      'Google Analytics',
      'OneTrust Cookie Consent',
      'next-seo',
      'next-sitemap',
    ],
    imageUrl: portalMeta,
    projectUrl: 'https://portal.metagenics.com/hcp-landing-page',
    decommissioned: true,
  },
  {
    title: 'plmc.com',
    description:
      'Developed and deployed the plmc.com website, a marketing platform sponsored by Metagenics, focusing on user engagement, performance, and search engine optimization (SEO).',
    tags: [
      'React',
      'Next.js',
      'Vercel',
      'JavaScript',
      'HTML/CSS',
      'Contentful CMS',
      'Google Analytics',
      'next-seo',
      'next-sitemap',
    ],
    imageUrl: plmc,
    projectUrl: 'https://www.plmc.com',
    decommissioned: true,
  },
] satisfies ProjectData[];

export const personalProjectsData = [
  {
    title: 'InvestorIQ',
    description:
      'AI-powered real estate investment analysis platform. Score US markets, underwrite deals across five strategies (buy-and-hold, BRRRR, fix-and-flip, house-hacking, short-term rental), and get plain-English AI guidance backed by real financial calculations from Census, HUD, FRED, FEMA, and Zillow data.',
    tags: [
      'React',
      'Next.js',
      'TypeScript',
      'Tailwind',
      'Vercel',
      'AI / LLM',
      'REST APIs',
    ],
    link: 'https://github.com/bparvin12/real-estate-investment-ai',
    websiteLink: 'https://real-estate-investment-ai.vercel.app/',
  },
  {
    title: 'Sports Betting Odds',
    description:
      'Sports Betting Odds and Spreads for all in-season sports. NFL, NHL, NBA, etc.',
    tags: [
      'React',
      'Next.js',
      'Vercel',
      'HTML/CSS',
      'TypeScript',
      'Tailwind',
      'Odds API',
      'SSR',
      'SSG',
    ],
    link: 'https://github.com/bparvin12/sports-betting-odds',
    websiteLink: 'https://sports-betting-odds.vercel.app/',
  },
  {
    title: 'Portfolio',
    description:
      'Responsive portfolio for displaying professional and personal experience',
    tags: ['React', 'Next.js', 'Vercel', 'HTML/CSS', 'TypeScript', 'Tailwind'],
    link: 'https://github.com/bparvin12/BijanParvin_Portfolio_FE',
  },
  {
    title: 'Next.js Marketing Template',
    description:
      'Template for creating clean/modern marketing websites and landing pages',
    tags: ['React', 'Next.js', 'Vercel', 'HTML/CSS', 'TypeScript', 'Tailwind'],
    link: 'https://github.com/bparvin12/metagenics-marketing-pages-nam',
  },
  {
    title: 'Next.js 14 Code Share Project',
    description: 'Next.js Project ~ App Router Practice',
    tags: ['React', 'Next.js', 'Vercel', 'Prisma', 'TypeScript', 'Tailwind'],
    link: 'https://github.com/bparvin12/nextjs-14-code-share-tutorial',
  },
  {
    title: 'Next.js 14 Corporation Project',
    description: 'Next.js Project v14 ~ App Router Practice',
    tags: ['React', 'Next.js', 'Vercel', 'ESLint', 'TypeScript', 'Tailwind'],
    link: 'https://github.com/bparvin12/nextjs-14-corporation-tutorial',
  },
  {
    title: 'Next.js 14 Foodies App',
    description: 'Next.js Project v14 ~ Food Dashboard',
    tags: ['React', 'Next.js', 'Vercel', 'ESLint', 'JavaScript', 'SQLite'],
    link: 'https://github.com/bparvin12/nextjs-14-course-foodies-app',
  },
  {
    title: 'TypeScript Course',
    description: 'TypeScript Course and Practice from Udemy',
    tags: ['TypeScript', 'React'],
    link: 'https://github.com/bparvin12/typescript-course',
  },
  {
    title: 'Turbo Repo Next.js',
    description: 'Understanding turbo repos with Next.js and React',
    tags: ['TypeScript', 'React', 'Next.js', 'turbo repo'],
    link: 'https://github.com/bparvin12/turborepo-next-basic',
  },
  {
    title: 'Next.js Dashboard App Router',
    description: 'Practicing with Next.js App Router and version 14',
    tags: ['TypeScript', 'React', 'Next.js', 'App Router'],
    link: 'https://github.com/bparvin12/nextjs-dashboard-app-router-tutorial',
  },
  {
    title: 'Glebhan',
    description:
      'Wedding website built with React.js, custom CSS, and Bootstrap',
    tags: ['JavaScript', 'React', 'Bootstrap', 'HTML/CSS'],
    link: 'https://github.com/bparvin12/Glebhan',
  },
];

export const skillsData = [
  'TypeScript',
  'JavaScript',
  'React',
  'Next.js',
  'Node.js',
  'HTML',
  'CSS',
  'Tailwind',
  'GraphQL',
  'Apollo Federation',
  'REST APIs',
  'AWS (Lambda, S3, DynamoDB)',
  'CI/CD',
  'Serverless',
  'Vercel',
  'Cloudflare',
  'Git',
  'commercetools',
  'Contentful CMS',
  'MACH Architecture',
  'Storybook',
  'React Testing Library',
  'Datadog',
  'Framer Motion',
  'Prisma',
  'Technical Leadership',
  'Mentoring',
  'Solutions Architecture',
  'Vendor Evaluation',
  'Technical Documentation',
  'Cross-functional Collaboration',
  'AI / LLM Integration',
  'Agile / Scrum',
  'Figma',
  'Jira',
  'Confluence',
] as const;
