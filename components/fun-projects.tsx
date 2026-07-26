'use client';

import React from 'react';

import { personalProjectsData } from '@/lib/data';
import { useSectionInView } from '@/lib/hooks';

import FunProject from './fun-project';
import SectionHeading from './section-heading';

export default function FunProjects() {
  const { ref } = useSectionInView('Projects', 0.5);

  return (
    <section ref={ref} className="mb-28 scroll-mt-28">
      <SectionHeading>Learning and Personal Projects</SectionHeading>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {personalProjectsData.map(
          ({ title, description, tags, link, websiteLink }, index) => (
            <React.Fragment key={index}>
              <FunProject
                title={title}
                description={description}
                tags={tags}
                link={link}
                websiteLink={websiteLink}
                index={index}
              />
            </React.Fragment>
          ),
        )}
      </div>
    </section>
  );
}
