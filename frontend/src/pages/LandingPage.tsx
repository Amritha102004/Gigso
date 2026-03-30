import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import FeatureCard from '../components/FeatureCard';
import Footer from '../components/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col pt-12">
      {/* Navbar Placeholder space, could be added later */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5 flex items-center gap-2">
              <span className="text-2xl font-bold text-primary tracking-tight">Gigso</span>
            </a>
          </div>
          <div className="flex flex-1 justify-end">
            <Link to="/role-selection" className="text-sm font-semibold leading-6 text-textMain hover:text-primary transition-colors">
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <Hero />

        {/* Features Section */}
        <section className="py-24 sm:py-32 bg-white relative">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center text-center">
              <h2 className="text-base font-semibold leading-7 text-primary">Why Choose Us</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-textMain sm:text-4xl">
                Everything you need to run your event safely
              </p>
              <p className="mt-6 text-lg leading-8 text-secondary">
                Simplify the way you find, hire, and manage professionals. Experience peace of mind with our vetted freelancers and secure payment gateway.
              </p>
            </div>

            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                <FeatureCard
                  title="Verified Professionals"
                  description="We strictly screen and verify every freelancer on the platform to guarantee quality and reliability for your event."
                  icon={(
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                    </svg>
                  )}
                />
                <FeatureCard
                  title="Secure Payments"
                  description="Your payments are held securely in escrow until the gig is completed to your satisfaction."
                  icon={(
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  )}
                />
                <FeatureCard
                  title="Instant Matching"
                  description="Get matched with the perfect talent in minutes, saving you hours of searching and screening."
                  icon={(
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  )}
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 sm:py-32 bg-background/50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center text-center mb-16">
              <h2 className="text-base font-semibold leading-7 text-primary">Simple Process</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-textMain sm:text-4xl">
                Get Started in Three Steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto position-relative">
              {/* Process Step 1 */}
              <div className="relative text-center">
                <div className="w-16 h-16 rounded-full bg-white text-primary mx-auto flex items-center justify-center shadow-lg border-2 border-primary/20 text-2xl font-bold mb-6 z-10 relative">
                  1
                </div>
                <h3 className="text-xl font-semibold text-textMain mb-3">Sign Up</h3>
                <p className="text-secondary text-base">Create your free account instantly and set up your profile.</p>
              </div>

              {/* Process Step 2 */}
              <div className="relative text-center">
                <div className="w-16 h-16 rounded-full bg-white text-primary mx-auto flex items-center justify-center shadow-lg border-2 border-primary/20 text-2xl font-bold mb-6 z-10 relative">
                  2
                </div>
                <h3 className="text-xl font-semibold text-textMain mb-3">Choose Role</h3>
                <p className="text-secondary text-base">Decide whether you want to hire talents or look for exciting gig opportunities.</p>
              </div>

              {/* Process Step 3 */}
              <div className="relative text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-white mx-auto flex items-center justify-center shadow-lg shadow-primary/30 border-2 border-primary/20 text-2xl font-bold mb-6 z-10 relative">
                  3
                </div>
                <h3 className="text-xl font-semibold text-textMain mb-3">Start Connecting</h3>
                <p className="text-secondary text-base">Browse profiles, send proposals, or get hired. Everything in one place!</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
