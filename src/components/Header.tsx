
import React from 'react';
import { Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-primary/90 to-mosaic-darkPurple/90 py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-8 w-8 text-white" />
          <h1 className="text-2xl md:text-3xl font-bold text-white">Image2Mosaic</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hidden md:inline text-white opacity-80">Transform images into beautiful mosaics</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
