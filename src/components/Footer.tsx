
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-background border-t py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Image2Mosaic
        </p>
        <p className="text-sm text-muted-foreground">
          Created for laser cutting projects
        </p>
      </div>
    </footer>
  );
};

export default Footer;
