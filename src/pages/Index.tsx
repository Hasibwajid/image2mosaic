
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Wand2, Pencil, FileImage, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ImageUploader from '@/components/ImageUploader';
import ParameterSlider from '@/components/ParameterSlider';
import ImagePreview from '@/components/ImagePreview';
import Canvas from '@/components/Canvas';
import { processMosaic, MosaicParameters, MosaicResult } from '@/utils/mosaicProcessor';

const Index: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('upload');
  
  // Image states
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [manualLinesImageUrl, setManualLinesImageUrl] = useState<string | null>(null);
  const [drawnLinesImageUrl, setDrawnLinesImageUrl] = useState<string | null>(null);
  
  // Result states
  const [mosaicResult, setMosaicResult] = useState<MosaicResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Parameter states
  const [parameters, setParameters] = useState<MosaicParameters>({
    tileSize: 20,
    compactness: 10,
    outlineThickness: 1,
    strokeWidth: 1,
    lineThreshold: 50,
    smoothingSigma: 0,
    gradientSensitivity: 20,
    preserveColors: true
  });
  
  const handleParameterChange = (
    param: keyof MosaicParameters,
    value: number | boolean
  ) => {
    setParameters((prev) => ({
      ...prev,
      [param]: value,
    }));
  };
  
  const handleImageUpload = (file: File, imageUrl: string) => {
    setOriginalImage(file);
    setOriginalImageUrl(imageUrl);
    
    // Reset results when a new image is uploaded
    setMosaicResult(null);
  };
  
  const handleManualLinesUpload = (_: File, imageUrl: string) => {
    setManualLinesImageUrl(imageUrl);
  };
  
  const handleDrawingComplete = (dataURL: string) => {
    setDrawnLinesImageUrl(dataURL);
    toast({
      title: "Drawing Saved",
      description: "Your manual line drawing has been saved."
    });
  };
  
  const processMosaicImage = async () => {
    if (!originalImageUrl) {
      toast({
        title: "No Image Selected",
        description: "Please upload an image to process.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Use drawn lines if available, otherwise use uploaded manual lines
      const linesUrl = drawnLinesImageUrl || manualLinesImageUrl;
      
      const result = await processMosaic(
        originalImageUrl,
        linesUrl,
        parameters
      );
      
      setMosaicResult(result);
      toast({
        title: "Processing Complete",
        description: "Your mosaic has been generated successfully."
      });
    } catch (error) {
      console.error("Error processing mosaic:", error);
      toast({
        title: "Processing Failed",
        description: "An error occurred while generating the mosaic.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="overflow-hidden">
              <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upload">
                    <FileImage className="h-4 w-4 mr-2" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="draw" disabled={!originalImageUrl}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Draw Lines
                  </TabsTrigger>
                  <TabsTrigger value="settings" disabled={!originalImageUrl}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Settings
                  </TabsTrigger>
                </TabsList>
                
                <CardContent className="p-4">
                  <TabsContent value="upload" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Upload Original Image</Label>
                      <ImageUploader 
                        onImageUpload={handleImageUpload}
                        label="Upload Image"
                        className="aspect-video" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Upload Manual Lines (Optional)</Label>
                      <ImageUploader 
                        onImageUpload={handleManualLinesUpload}
                        label="Upload Lines"
                        className="aspect-video" 
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="draw">
                    <div className="space-y-4">
                      <Label>Draw Manual Lines</Label>
                      <p className="text-sm text-muted-foreground">
                        Draw lines to guide the mosaic pattern. Areas with lines will be preserved as outlines.
                      </p>
                      <div className="flex justify-center">
                        <Canvas 
                          width={300}
                          height={200}
                          onDrawingComplete={handleDrawingComplete}
                          imageUrl={originalImageUrl || undefined}
                          isActive={activeTab === 'draw'}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="settings" className="space-y-4">
                    <ParameterSlider
                      label="Tile Size"
                      value={parameters.tileSize}
                      onChange={(value) => handleParameterChange('tileSize', value)}
                      min={5}
                      max={100}
                      step={1}
                      tooltip="Controls the size of mosaic tiles. Smaller values create more detailed mosaics."
                    />
                    
                    <ParameterSlider
                      label="Compactness"
                      value={parameters.compactness}
                      onChange={(value) => handleParameterChange('compactness', value)}
                      min={1}
                      max={100}
                      step={1}
                      tooltip="Controls the shape regularity of tiles. Higher values create more evenly shaped tiles."
                    />
                    
                    <ParameterSlider
                      label="Outline Thickness"
                      value={parameters.outlineThickness}
                      onChange={(value) => handleParameterChange('outlineThickness', value)}
                      min={0.1}
                      max={5.0}
                      step={0.1}
                      tooltip="Controls the thickness of tile outlines for laser cutting."
                    />
                    
                    <ParameterSlider
                      label="Stroke Width"
                      value={parameters.strokeWidth}
                      onChange={(value) => handleParameterChange('strokeWidth', value)}
                      min={1}
                      max={5}
                      step={1}
                      tooltip="Controls the thickness of detected edges and manual lines."
                    />
                    
                    <ParameterSlider
                      label="Line Threshold"
                      value={parameters.lineThreshold}
                      onChange={(value) => handleParameterChange('lineThreshold', value)}
                      min={10}
                      max={200}
                      step={5}
                      tooltip="Controls the sensitivity of line detection. Lower values detect more lines."
                    />
                    
                    <ParameterSlider
                      label="Edge Smoothing"
                      value={parameters.smoothingSigma}
                      onChange={(value) => handleParameterChange('smoothingSigma', value)}
                      min={0}
                      max={5}
                      step={0.1}
                      tooltip="Applies smoothing to edges. Higher values create smoother outlines."
                    />
                    
                    <ParameterSlider
                      label="Gradient Sensitivity"
                      value={parameters.gradientSensitivity}
                      onChange={(value) => handleParameterChange('gradientSensitivity', value)}
                      min={5}
                      max={50}
                      step={1}
                      tooltip="Controls sensitivity to color gradients. Lower values are more sensitive."
                    />
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="preserve-colors">Preserve Original Colors</Label>
                      <Switch 
                        id="preserve-colors"
                        checked={parameters.preserveColors}
                        onCheckedChange={(checked) => handleParameterChange('preserveColors', checked)}
                      />
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
            
            <div className="flex justify-center">
              <Button 
                onClick={processMosaicImage} 
                disabled={!originalImageUrl || isProcessing}
                className="px-8"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Mosaic
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Right Column - Previews */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Image Preview */}
              <ImagePreview 
                imageUrl={originalImageUrl} 
                isProcessing={false}
                title="Original Image" 
              />
              
              {/* Manual Lines Preview */}
              <ImagePreview 
                imageUrl={drawnLinesImageUrl || manualLinesImageUrl} 
                isProcessing={false}
                title="Manual Lines" 
              />
              
              {/* Mosaic Preview */}
              <ImagePreview 
                imageUrl={mosaicResult?.mosaicImageUrl || null} 
                isProcessing={isProcessing}
                title="Generated Mosaic" 
              />
              
              {/* Outlines Preview */}
              <ImagePreview 
                imageUrl={mosaicResult?.outlineImageUrl || null} 
                isProcessing={isProcessing}
                title="Outlines for Laser Cutting" 
              />
            </div>
            
            {/* Download Buttons */}
            {mosaicResult && (
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  onClick={() => downloadImage(mosaicResult.mosaicImageUrl, 'mosaic.png')}
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Mosaic
                </Button>
                <Button
                  onClick={() => downloadImage(mosaicResult.outlineImageUrl, 'outlines.png')}
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Outlines
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
