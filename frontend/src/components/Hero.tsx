import React from 'react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <section className="relative w-full bg-background overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold tracking-tight text-textMain sm:text-6xl max-w-3xl">
          Hire specialized talent <span className="text-primary italic">for your next event</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-secondary max-w-2xl">
          Gigso connects you with top-tier professionals ready to make your events unforgettable. Whether it's catering, photography, or entertainment, find the perfect fit seamlessly.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            to="/role-selection"
            className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 hover:scale-105 transition-all duration-300 shadow-[0_4px_14px_0_rgba(106,106,47,0.39)]"
          >
            Get Started
          </Link>
          <a href="#" className="text-sm font-semibold leading-6 text-textMain hover:text-primary transition-colors">
            Learn more <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
      
      {/* Decorative background gradients */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-secondary to-primary opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'}}
        />
      </div>
    </section>
  );
};

export default Hero;
