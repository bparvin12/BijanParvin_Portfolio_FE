import React from 'react';
import { FaGithubSquare } from 'react-icons/fa';

type ProjectProps = {
  title: string;
  description: string;
  tags: string[];
  link: string;
};

export default function FunProject({
  title,
  description,
  tags,
  link,
}: ProjectProps) {
  return (
    <div className="flex w-full flex-col justify-end rounded-lg border border-black/5 bg-gray-100 p-4 transition hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 sm:w-72">
      <div className="text-xl sm:basis-16">{title}</div>
      <div className="sm:max-w-3/4 my-2 w-full border-t-2" />
      <div className="my-2 text-sm">{description}</div>
      <ul className="flex flex-wrap items-end justify-end gap-2 sm:mt-auto">
        {tags.map((tag, index) => (
          <li
            className="rounded-full bg-black/[0.7] px-3 py-1 text-[0.7rem] uppercase tracking-wider text-white dark:text-white/70"
            key={index}
          >
            {tag}
          </li>
        ))}
      </ul>
      <div className="flex w-full justify-end">
        <a
          className="borderBlack my-2 flex w-min cursor-pointer items-center rounded-full bg-white p-4 text-[1.35rem] text-gray-700 transition hover:scale-[1.15] hover:text-gray-950 focus:scale-[1.15] active:scale-105 dark:bg-white/10 dark:text-white/60"
          href={link}
          target="_blank"
        >
          <FaGithubSquare />
        </a>
      </div>
    </div>
  );
}
