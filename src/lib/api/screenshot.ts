/**
 * API wrapper for screenshot processing
 */

export interface ProcessScreenshotResponse {
  day: string;
  minutes: number;
  time: number; // hours (for backward compatibility)
  found: boolean;
  metadata: {
    scale_min_per_px: number;
    max_val_y: number;
  };
  error?: string;
}

export interface ProcessScreenshotError {
  error: string;
  details?: string;
  stderr?: string;
}

/**
 * Process a screenshot to extract screen time for a specific day
 * @param imageFile - The screenshot image file
 * @param targetDay - Hebrew day name (e.g., "ראשון", "שני")
 * @returns Promise with processing result
 */
export async function processScreenshot(
  imageFile: File,
  targetDay: string
): Promise<ProcessScreenshotResponse> {
  console.log('[Client] Starting screenshot processing', {
    fileName: imageFile.name,
    fileSize: imageFile.size,
    targetDay
  });

  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('targetDay', targetDay);

  console.log('[Client] Sending request to API...');
  const startTime = Date.now();

  try {
    const response = await fetch('/api/process-screenshot', {
      method: 'POST',
      body: formData,
    });

    const elapsed = Date.now() - startTime;
    console.log(`[Client] API response received (${elapsed}ms)`, {
      status: response.status,
      statusText: response.statusText
    });

    if (!response.ok) {
      const errorData: ProcessScreenshotError = await response.json();
      console.error('[Client] API error:', errorData);
      throw new Error(errorData.error || `API error: ${response.statusText}`);
    }

    const result: ProcessScreenshotResponse = await response.json();
    console.log('[Client] Processing result:', result);
    
    return result;
  } catch (error: any) {
    console.error('[Client] Request failed:', error);
    throw error;
  }
}

