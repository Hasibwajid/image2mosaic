
import React from 'react';
import { Loader2 } from 'lucide-react';

interface ImagePreviewProps {
  imageUrl: string | null;
  isProcessing: boolean;
  title: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl, isProcessing, title }) => {
  return (
    <div className="relative border rounded-lg overflow-hidden bg-background shadow-sm">
      <div className="p-2 bg-muted/30 border-b">
        <h3 className="text-sm font-medium text-center">{title}</h3>
      </div>
      
      <div className="relative h-[300px]">
        {isProcessing ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5">
            <div className="loading-spinner" />
          </div>
        ) : imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-contain bg-white/80"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/80">
            <p className="text-muted-foreground text-sm">No preview available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePreview;
