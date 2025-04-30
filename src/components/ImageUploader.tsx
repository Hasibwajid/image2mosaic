
import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface ImageUploaderProps {
  onImageUpload: (file: File, imageUrl: string) => void;
  label: string;
  accept?: string;
  className?: string;
  children?: React.ReactNode;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUpload, 
  label, 
  accept = "image/png, image/jpeg, image/svg+xml, image/webp", 
  className = "",
  children
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result as string;
      setPreview(imageUrl);
      onImageUpload(file, imageUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        aria-label={label}
      />
      
      <div 
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          flex flex-col items-center justify-center p-6
          border-2 border-dashed rounded-lg
          transition-colors duration-200
          cursor-pointer
          ${isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'}
          ${preview ? 'bg-background' : 'bg-muted/30'}
        `}
      >
        {preview ? (
          <div className="relative w-full">
            <img 
              src={preview} 
              alt="Uploaded preview" 
              className="mx-auto max-h-48 object-contain rounded" 
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : children ? (
          children
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm font-medium mb-1">{label}</p>
            <p className="text-xs text-muted-foreground">Click or drag and drop</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
