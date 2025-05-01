export interface MosaicParameters {
  tileSize: number;
  compactness: number;
  outlineThickness: number;
  strokeWidth: number;
  lineThreshold: number;
  smoothingSigma: number;
  gradientSensitivity: number;
  preserveColors: boolean;
}

export interface MosaicResult {
  mosaicImageUrl: string;
  outlineImageUrl: string;
}

export const processMosaic = async (
  originalImageUrl: string,
  manualLinesUrl: string | null,
  parameters: MosaicParameters
): Promise<MosaicResult> => {
  const formData = new FormData();
  
  // Convert image URLs to blobs
  const originalImageBlob = await (await fetch(originalImageUrl)).blob();
  formData.append('image', originalImageBlob, 'image.png');
  
  if (manualLinesUrl) {
    const manualLinesBlob = await (await fetch(manualLinesUrl)).blob();
    formData.append('manual_lines', manualLinesBlob, 'lines.png');
  }
  
  // Append parameters
  formData.append('tile_size', parameters.tileSize.toString());
  formData.append('compactness', parameters.compactness.toString());
  formData.append('outline_thickness', parameters.outlineThickness.toString());
  formData.append('stroke_width', parameters.strokeWidth.toString());
  formData.append('line_threshold', parameters.lineThreshold.toString());
  formData.append('smoothing_sigma', parameters.smoothingSigma.toString());
  formData.append('gradient_sensitivity', parameters.gradientSensitivity.toString());
  formData.append('preserve_colors', parameters.preserveColors.toString());
  
  const response = await fetch('http://localhost:8000/process_mosaic', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to process mosaic');
  }
  
  const data = await response.json();
  
  // Convert base64 to data URLs
  const mosaicImageUrl = `data:image/png;base64,${data.mosaic}`;
  const outlineImageUrl = `data:image/png;base64,${data.outlines}`;
  
  return { mosaicImageUrl, outlineImageUrl };
};