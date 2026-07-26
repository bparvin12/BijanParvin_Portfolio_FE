'use client';

import React from 'react';
import { BsLinkedin } from 'react-icons/bs';
import { FaGithubSquare } from 'react-icons/fa';
import { FaSquareGitlab } from 'react-icons/fa6';

const socials = [
  {
    href: 'https://www.linkedin.com/in/bparvin12/',
    icon: <BsLinkedin />,
    label: 'LinkedIn',
  },
  {
    href: 'https://gitlab.com/bparvin12',
    icon: <FaSquareGitlab />,
    label: 'GitLab',
    large: true,
  },
  {
    href: 'https://github.com/bparvin12',
    icon: <FaGithubSquare />,
    label: 'GitHub',
    large: true,
  },
];

export default function SocialLinks() {
  return (
    <div className="flex flex-row items-center gap-2 text-lg font-medium">
      {socials.map((social) => (
        <a
          key={social.href}
          className={`borderBlack flex cursor-pointer items-center gap-2 rounded-full bg-policeBlue p-4 text-tan transition hover:scale-[1.15] focus:scale-[1.15] active:scale-105 dark:bg-white/10 dark:text-white ${
            social.large ? 'text-[1.35rem]' : ''
          }`}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.label}
        >
          {social.icon}
        </a>
      ))}
    </div>
  );
}
