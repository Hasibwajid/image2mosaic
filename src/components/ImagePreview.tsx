
import React, { useState } from 'react';
import { Loader2, ImageOff } from 'lucide-react';

interface ImagePreviewProps {
  imageUrl: string | null;
  isProcessing: boolean;
  title: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl, isProcessing, title }) => {
  const [hasError, setHasError] = useState(false);
  
  // Reset error state when image URL changes
  React.useEffect(() => {
    setHasError(false);
  }, [imageUrl]);

  return (
    <div className="relative border rounded-lg overflow-hidden bg-background shadow-sm">
      <div className="p-2 bg-muted/30 border-b">
        <h3 className="text-sm font-medium text-center">{title}</h3>
      </div>
      
      <div className="relative h-[300px]">
        {isProcessing ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : imageUrl && !hasError ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-contain bg-white/80"
            onError={() => {
              console.error(`Failed to load image: ${imageUrl}`);
              setHasError(true);
            }}
          />
        ) : imageUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-white/80">
            <ImageOff className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">Failed to load preview</p>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-white/80">
            <ImageOff className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">No preview available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePreview;
