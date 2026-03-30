import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoleSelection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-20 px-6 sm:px-12 relative overflow-hidden">
      {/* Decorative background gradients (matching Landing Page) */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-secondary to-primary opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'}} />
      </div>

      {/* Header Logo */}
      <div className="mb-16">
        <span className="text-3xl font-bold text-primary tracking-tight">Gigso</span>
      </div>

      <div className="text-center mb-16 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-textMain sm:text-5xl mb-4">
          Welcome to Gigso
        </h1>
        <p className="text-lg text-secondary">
          Whether you're looking for work or looking for talent,<br className="hidden sm:block"/> we've got you covered.
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl z-10">
        
        {/* Worker Card */}
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col group border border-gray-100 hover:border-primary/30">
          <div className="h-64 overflow-hidden bg-gray-100 w-full relative">
            {/* Placeholder Image for Worker */}
            <img 
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Person typing on laptop" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="p-8 md:p-10 flex flex-col flex-1 bg-gradient-to-b from-white to-gray-50/50">
            <h3 className="text-2xl font-bold text-textMain mb-4">I want to find gigs</h3>
            <p className="text-secondary leading-relaxed mb-10 flex-1">
              Browse local opportunities, apply with your portfolio, and get paid for your skills.
            </p>
            <div className="flex items-center justify-between w-full mt-auto">
              <span className="text-sm font-semibold text-secondary group-hover:text-primary transition-colors flex items-center">
                Join as a Worker <span aria-hidden="true" className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </span>
              <button
                onClick={() => navigate('/signup?role=worker')}
                className="bg-primary hover:bg-opacity-90 text-white rounded-xl px-6 py-3 font-semibold shadow-md shadow-primary/20 transition-all hover:scale-105"
              >
                Select Worker
              </button>
            </div>
          </div>
        </div>

        {/* Owner Card */}
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col group border border-gray-100 hover:border-primary/30">
          <div className="h-64 overflow-hidden bg-gray-100 w-full relative">
            {/* Placeholder Image for Owner */}
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="People meeting in office" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="p-8 md:p-10 flex flex-col flex-1 bg-gradient-to-b from-white to-gray-50/50">
            <h3 className="text-2xl font-bold text-textMain mb-4">I want to hire talent</h3>
            <p className="text-secondary leading-relaxed mb-10 flex-1">
              Post a gig, review applications, and find the perfect person for your project.
            </p>
            <div className="flex items-center justify-between w-full mt-auto">
              <span className="text-sm font-semibold text-secondary group-hover:text-primary transition-colors flex items-center">
                Join as an Owner <span aria-hidden="true" className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </span>
              <button
                onClick={() => navigate('/signup?role=owner')}
                className="bg-primary hover:bg-opacity-90 text-white rounded-xl px-6 py-3 font-semibold shadow-md shadow-primary/20 transition-all hover:scale-105"
              >
                Select Owner
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <div className="mt-20 flex flex-col items-center w-full z-10">
        <p className="text-sm text-secondary mb-6">
          Already have an account? <a href="#" className="font-semibold text-primary hover:underline">Log in</a>
        </p>
        <div className="flex items-center justify-center space-x-4 sm:space-x-8 text-xs text-gray-400 max-w-md text-center">
          <span>Secure payments</span>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span>Verified professionals</span>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span>24/7 Support</span>
        </div>
        <p className="mt-12 text-[11px] uppercase tracking-widest text-gray-400">
          &copy; {new Date().getFullYear()} Gigso Global Inc.
        </p>
      </div>

    </div>
  );
};

export default RoleSelection;
