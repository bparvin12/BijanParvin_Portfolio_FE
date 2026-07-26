'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';
import { HiDownload } from 'react-icons/hi';

import SocialLinks from '@/components/social-links';
import { useSectionInView } from '@/lib/hooks';

const titleWords = [
  'Senior',
  'Software',
  'Engineer',
  '&',
  'Technical',
  'Leader',
];

export default function Intro() {
  const { ref } = useSectionInView('Home', 0.5);

  const currentYear = new Date().getFullYear();

  return (
    <section
      ref={ref}
      id="home"
      className="mb-28 max-w-[50rem] scroll-mt-[100rem] sm:mb-0"
    >
      <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-12">
        {/* Left: text content */}
        <div className="flex-1 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              <span className="font-light text-brand/30">{'{ '}</span>
              Bijan Parvin
              <span className="font-light text-brand/30">{' }'}</span>
            </h1>

            <div className="mt-3 flex flex-wrap justify-center gap-x-2 text-lg font-medium text-policeBlue/80 dark:text-gray-300 md:justify-start">
              {titleWords.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="mt-6 space-y-3 text-base !leading-[1.6]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <p>
              <span className="font-bold">{currentYear - 2019}+ years</span> of
              professional experience building enterprise platforms.
            </p>
            <p>
              I architect and deliver{' '}
              <span className="underline decoration-brand/50">
                scalable eCommerce solutions
              </span>
              , lead engineering teams, and bridge the gap between{' '}
              <span className="underline decoration-brand/50">
                technical depth
              </span>{' '}
              and{' '}
              <span className="underline decoration-brand/50">
                business impact
              </span>
              .
            </p>
          </motion.div>

          <motion.div
            className="mt-6 flex flex-col items-center gap-3 text-base font-medium sm:flex-row md:items-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <a
              className="borderBlack group flex cursor-pointer items-center gap-2 rounded-full bg-policeBlue px-7 py-3 text-tan outline-none transition hover:scale-105 focus:scale-105 active:scale-100 dark:bg-white/10 dark:text-white"
              href="/Bijan_Parvin_Resume_Software_Engineer.pdf"
              download
            >
              Software Engineering CV{' '}
              <HiDownload className="opacity-60 transition group-hover:translate-y-1" />
            </a>
            <a
              className="borderBlack group flex cursor-pointer items-center gap-2 rounded-full bg-policeBlue px-7 py-3 text-tan outline-none transition hover:scale-105 focus:scale-105 active:scale-100 dark:bg-white/10 dark:text-white"
              href="/Bijan_Parvin_Resume_Solutions_Engineer_Tech_Sales.pdf"
              download
            >
              Solutions Engineering CV{' '}
              <HiDownload className="opacity-60 transition group-hover:translate-y-1" />
            </a>
          </motion.div>

          <motion.div
            className="mt-4 flex justify-center md:justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <SocialLinks />
          </motion.div>
        </div>

        {/* Right: profile image with animated gradient border */}
        <motion.div
          className="order-first shrink-0 md:order-last"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'tween', duration: 0.4 }}
        >
          <div className="gradient-border rounded-full p-1">
            <Image
              src="/profile_pic.jpeg"
              alt="Bijan Parvin Profile Picture"
              width="256"
              height="256"
              quality="95"
              priority
              className="size-48 rounded-full object-cover sm:size-56 md:size-64"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
