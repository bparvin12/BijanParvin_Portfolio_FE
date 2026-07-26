'use client';

import { motion } from 'framer-motion';
import React from 'react';
import { CgWebsite } from 'react-icons/cg';
import { FaGithubSquare } from 'react-icons/fa';

type ProjectProps = {
  title: string;
  description: string;
  tags: string[];
  link: string;
  websiteLink?: string;
  index: number;
};

export default function FunProject({
  title,
  description,
  tags,
  link,
  websiteLink,
  index,
}: ProjectProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileTap={{ scale: 0.98 }}
      className="flex h-full flex-col rounded-lg border border-policeBlue bg-policeBlue p-4 transition hover:bg-policeBlue/90 dark:border-black/5 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
    >
      <h3 className="font-heading text-lg font-bold text-tan">{title}</h3>
      <div className="my-2 h-0.5 w-12 bg-gradient-to-r from-brand to-policeBlue" />
      <p className="my-2 text-sm text-white dark:text-white/70">
        {description}
      </p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {tags.map((tag, tagIndex) => (
          <li
            className="rounded-full bg-black/[0.7] px-2.5 py-0.5 text-[0.65rem] uppercase tracking-wider text-white dark:text-white/70"
            key={tagIndex}
          >
            {tag}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex gap-2 pt-4">
        <a
          className="borderBlack flex items-center rounded-full bg-tan p-3 text-xl text-policeBlue transition hover:scale-[1.15] focus:scale-[1.15] active:scale-105 dark:bg-white/10 dark:text-white/60"
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${title} GitHub repository`}
        >
          <FaGithubSquare />
        </a>
        {websiteLink && (
          <a
            className="borderBlack flex items-center rounded-full bg-tan p-3 text-xl text-policeBlue transition hover:scale-[1.15] focus:scale-[1.15] active:scale-105 dark:bg-white/10 dark:text-white/60"
            href={websiteLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${title} live website`}
          >
            <CgWebsite />
          </a>
        )}
      </div>
    </motion.div>
  );
}
