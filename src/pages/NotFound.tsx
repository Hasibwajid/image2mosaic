
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PuzzleIcon, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

const NotFound: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="text-center max-w-md">
        <div className="bg-primary/10 rounded-full p-6 inline-flex mb-6">
          <PuzzleIcon className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-foreground">Page Not Found</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Oops! The mosaic piece you're looking for is missing from our canvas.
        </p>
        <Button asChild size="lg">
          <a href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Mosaic Artisan
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
