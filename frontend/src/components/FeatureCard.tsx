import React, { type ReactNode } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
  return (
    <div className="group relative bg-white flex flex-col items-start p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ring-1 ring-black/5 hover:ring-primary/20">
      {icon && (
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
          {icon}
        </div>
      )}
      <h3 className="mb-3 text-xl font-semibold leading-7 text-textMain">
        {title}
      </h3>
      <p className="text-base leading-7 text-secondary">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;
