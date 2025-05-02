from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
import cv2
import numpy as np
from skimage.segmentation import slic, find_boundaries
from skimage.measure import label
from skimage.color import rgb2lab
from skimage.filters import gaussian
import base64
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://image2mosaic.vercel.app", "http://localhost:8080"],  # Your frontend’s origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

def detect_main_lines(image, mask, manual_lines_image, stroke_width, gradient_sensitivity, smoothing_sigma):
    if manual_lines_image is not None:
        resized_lines = cv2.resize(manual_lines_image, (image.shape[1], image.shape[0]))
        _, binary_lines = cv2.threshold(resized_lines, 127, 255, cv2.THRESH_BINARY)
        kernel = np.ones((3, 3), np.uint8)
        dilated_lines = cv2.dilate(binary_lines, kernel, iterations=stroke_width)
        return dilated_lines * mask.astype(np.uint8)
    
    lab = cv2.cvtColor(image[:, :, :3], cv2.COLOR_BGR2LAB)
    l_channel = lab[:, :, 0]
    blurred = cv2.GaussianBlur(l_channel, (5, 5), 0)
    edges = cv2.Canny(blurred, gradient_sensitivity, gradient_sensitivity * 2)
    edges = edges * mask.astype(np.uint8)
    kernel = np.ones((3, 3), np.uint8)
    dilated_edges = cv2.dilate(edges, kernel, iterations=stroke_width)
    if smoothing_sigma > 0:
        dilated_edges = gaussian(dilated_edges, sigma=smoothing_sigma)
        dilated_edges = (dilated_edges > 0.1).astype(np.uint8) * 255
    return dilated_edges

def generate_tiles(image, mask, main_lines, tile_size, compactness, preserve_colors, smoothing_sigma):
    num_segments = int((np.sum(mask) / (tile_size ** 2)))
    num_segments = max(num_segments, 10)
    rgb_image = cv2.cvtColor(image[:, :, :3], cv2.COLOR_BGR2RGB)
    labels = slic(rgb_image, n_segments=num_segments, compactness=compactness, mask=mask, 
                  start_label=1, sigma=smoothing_sigma, enforce_connectivity=True)
    
    main_lines_bin = (main_lines > 0) & mask
    new_label = np.max(labels) + 1
    
    for label_val in np.unique(labels):
        if label_val == 0:
            continue
        label_mask = (labels == label_val)
        intersection = label_mask & main_lines_bin
        if np.sum(intersection) > 5:
            temp_mask = label_mask & ~main_lines_bin
            component_labels, num_components = label(temp_mask, return_num=True, connectivity=1)
            if num_components > 1:
                for component in range(1, num_components + 1):
                    component_mask = (component_labels == component)
                    if np.sum(component_mask) > 10:
                        labels[component_mask] = new_label
                        new_label += 1
    
    mosaic = np.zeros_like(image)
    if preserve_colors:
        for label_val in np.unique(labels):
            if label_val == 0:
                continue
            label_mask = (labels == label_val)
            mosaic[label_mask] = image[label_mask]
    else:
        for label_val in np.unique(labels):
            if label_val == 0:
                continue
            label_mask = (labels == label_val)
            if np.any(label_mask):
                mean_color = np.mean(image[label_mask], axis=0).astype(np.uint8)
                mosaic[label_mask] = mean_color
    
    boundaries = find_boundaries(labels, mode='thick')
    outlines = np.zeros(image.shape[:2], dtype=np.uint8)
    combined_boundaries = boundaries | main_lines_bin
    outlines[combined_boundaries] = 255
    return mosaic, outlines

@app.post("/process_mosaic")
async def process_mosaic(
    image: UploadFile = File(...),
    manual_lines: UploadFile = File(None),
    tile_size: int = Form(20),
    compactness: int = Form(10),
    outline_thickness: float = Form(1.0),
    stroke_width: int = Form(0),
    line_threshold: int = Form(50),
    smoothing_sigma: float = Form(0.0),
    gradient_sensitivity: int = Form(20),
    preserve_colors: bool = Form(True)
):
    try:
        # Read image
        image_data = await image.read()
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)
        
        # Read manual lines if provided
        manual_lines_img = None
        if manual_lines:
            manual_lines_data = await manual_lines.read()
            manual_lines_nparr = np.frombuffer(manual_lines_data, np.uint8)
            manual_lines_img = cv2.imdecode(manual_lines_nparr, cv2.IMREAD_GRAYSCALE)
        
        # Handle alpha channel
        has_alpha = len(img.shape) > 2 and img.shape[2] == 4
        if has_alpha:
            alpha = img[:, :, 3]
            rgb_image = img[:, :, :3].copy()
            mask = alpha > 128
        else:
            alpha = np.ones(img.shape[:2], dtype=np.uint8) * 255
            rgb_image = img.copy()
            mask = np.ones(img.shape[:2], dtype=bool)
        
        # Detect main lines
        main_lines = detect_main_lines(rgb_image, mask, manual_lines_img, stroke_width, gradient_sensitivity, smoothing_sigma)
        
        # Generate tiles
        mosaic, outlines = generate_tiles(img, mask, main_lines, tile_size, compactness, preserve_colors, smoothing_sigma)
        
        # Apply outline thickness
        if outline_thickness > 1.0:
            kernel_size = max(3, int(outline_thickness * 2 + 1))
            if kernel_size % 2 == 0:
                kernel_size += 1
            kernel = np.ones((kernel_size, kernel_size), np.uint8)
            outlines = cv2.dilate(outlines, kernel, iterations=1)
        
        # Create mosaic with outlines
        mosaic_with_outlines = mosaic.copy()
        for i in range(3):
            channel = mosaic_with_outlines[:, :, i]
            channel[outlines == 255] = 0
            mosaic_with_outlines[:, :, i] = channel
        if has_alpha:
            mosaic_with_outlines = np.dstack((mosaic_with_outlines[:, :, :3], alpha))
        
        # Encode images
        _, mosaic_encoded = cv2.imencode('.png', mosaic_with_outlines)
        _, outlines_encoded = cv2.imencode('.png', outlines)
        
        # Return base64 encoded images
        return JSONResponse({
            "mosaic": base64.b64encode(mosaic_encoded).decode('utf-8'),
            "outlines": base64.b64encode(outlines_encoded).decode('utf-8')
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)