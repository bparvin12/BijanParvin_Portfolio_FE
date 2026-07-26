import React from 'react';

type SectionHeadingProps = {
  children: React.ReactNode;
};

export default function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <div className="mb-8 text-center">
      <h2 className="font-heading text-4xl font-bold capitalize tracking-tight text-white">
        {children}
      </h2>
      <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-brand to-policeBlue" />
    </div>
  );
}
