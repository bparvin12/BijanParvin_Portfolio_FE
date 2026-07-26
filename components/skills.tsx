'use client';

import { motion } from 'framer-motion';
import React from 'react';

import { categorizedSkillsData } from '@/lib/data';
import { useSectionInView } from '@/lib/hooks';

import SectionHeading from './section-heading';

const categories = Object.entries(categorizedSkillsData);

export default function Skills() {
  const { ref } = useSectionInView('Skills');

  return (
    <section
      id="skills"
      ref={ref}
      className="mb-28 max-w-[53rem] scroll-mt-28 text-center sm:mb-40"
    >
      <SectionHeading>My skills</SectionHeading>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map(([category, skills], catIndex) => (
          <motion.div
            key={category}
            className="rounded-xl border border-policeBlue/20 bg-policeBlue/5 p-5 dark:border-white/10 dark:bg-white/5"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: catIndex * 0.1 }}
          >
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand dark:text-brand-400">
              {category}
            </h3>
            <ul className="flex flex-wrap gap-2">
              {skills.map((skill, skillIndex) => (
                <motion.li
                  key={skill}
                  className="group relative rounded-lg bg-policeBlue px-3 py-1.5 text-sm text-tan dark:bg-white/10 dark:text-white/80"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: catIndex * 0.1 + skillIndex * 0.03,
                  }}
                >
                  {skill}
                  <span className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-gradient-to-r from-brand to-policeBlue transition-all duration-300 group-hover:w-full" />
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
