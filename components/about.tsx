'use client';

import { motion } from 'framer-motion';
import React from 'react';

import { useSectionInView } from '@/lib/hooks';

import SectionHeading from './section-heading';

export default function About() {
  const { ref } = useSectionInView('About');

  return (
    <motion.section
      ref={ref}
      className="mb-28 max-w-[45rem] scroll-mt-28 text-center leading-8 sm:mb-40"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.175 }}
      id="about"
    >
      <SectionHeading>About me</SectionHeading>
      <p className="mb-3">
        After graduating with a B.S. degree in{' '}
        <span className="font-medium">Chemistry and Biochemistry</span> at{' '}
        <span className="underline">CSU Fullerton</span>, I decided to pursue my
        passion for programming. I enrolled in a continuing education and coding
        bootcamp at <span className="underline">UC Irvine</span> and earned{' '}
        <span className="font-medium">
          full-stack web development certifications
        </span>
        . <span className="italic">My favorite part of programming</span> is the
        problem-solving aspect. I <span className="underline">love</span> the
        feeling of finally figuring out a solution to a problem. My core stack
        is{' '}
        <span className="font-medium">
          React, Next.js, TypeScript, and Node.js
        </span>
        , but I work across the full stack — from{' '}
        <span className="font-medium">cloud infrastructure and APIs</span> to{' '}
        <span className="font-medium">CI/CD pipelines and architecture</span>.
      </p>

      <p className="mb-3">
        Beyond writing code, I enjoy{' '}
        <span className="italic">
          evaluating technologies, translating technical concepts for
          stakeholders, and driving build-vs-buy decisions
        </span>
        . I thrive at the intersection of engineering and business — whether
        that&apos;s leading a payment platform migration, architecting an
        AI-powered solution, or mentoring engineers on the team. Above all, I am
        a <span className="italic">supportive</span> and{' '}
        <span className="italic">enthusiastic team player</span> dedicated to{' '}
        sharing knowledge with my teammates, what I like to call,{' '}
        <span className="font-medium">&quot;spreading the love.&quot;</span>
      </p>

      <p>
        <span className="italic">When I&apos;m not coding</span>, I enjoy
        traveling or being active with my friends and family just as much as I
        enjoy playing video games or having a movie night in! During the winter,
        you can find me at the nearest snowboarding resort, and during the
        summer, most likely in a national park or playing soccer, pickleball,
        you name it!
      </p>
    </motion.section>
  );
}
