import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 mt-24">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 sm:py-16 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Branding */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">Gigso</span>
          </div>
          
          {/* Links */}
          <nav className="-mb-6 flex space-x-8" aria-label="Footer">
            <div className="pb-6">
              <a href="#" className="text-sm leading-6 text-secondary hover:text-primary transition-colors">
                Privacy Policy
              </a>
            </div>
            <div className="pb-6">
              <a href="#" className="text-sm leading-6 text-secondary hover:text-primary transition-colors">
                Terms of Service
              </a>
            </div>
            <div className="pb-6">
              <a href="#" className="text-sm leading-6 text-secondary hover:text-primary transition-colors">
                Support
              </a>
            </div>
            <div className="pb-6">
              <a href="#" className="text-sm leading-6 text-secondary hover:text-primary transition-colors">
                About Us
              </a>
            </div>
          </nav>
          
          {/* Copyright */}
          <p className="min-[400px]:mt-6 text-center text-xs leading-5 text-gray-400">
            &copy; {new Date().getFullYear()} Gigso Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
