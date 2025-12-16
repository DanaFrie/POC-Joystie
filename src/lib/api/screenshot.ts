/**
 * API wrapper for screenshot processing
 * Uses Firebase Function to process screenshots
 */

import { getFunctionsInstance } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('Client');

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
 * Convert a File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Process a screenshot to extract screen time for a specific day
 * Calls Firebase Function directly
 * @param imageFile - The screenshot image file
 * @param targetDay - Hebrew day name (e.g., "ראשון", "שני")
 * @returns Promise with processing result
 */
export async function processScreenshot(
  imageFile: File,
  targetDay: string
): Promise<ProcessScreenshotResponse> {
  logger.log('Starting screenshot processing', {
    fileName: imageFile.name,
    fileSize: imageFile.size,
    targetDay
  });

  const startTime = Date.now();

  try {
    // Convert image file to base64
    logger.log('Converting image to base64...');
    const imageData = await fileToBase64(imageFile);
    logger.log('Image converted, base64 length:', imageData.length);

    // Get Firebase Functions instance
    logger.log('Initializing Firebase Functions...');
    const functions = await getFunctionsInstance();
    
    // Get the callable function
    const processScreenshotFn = httpsCallable<{
      imageData: string;
      targetDay: string;
    }, ProcessScreenshotResponse>(functions, 'processScreenshot');

    // Call the Firebase Function with timeout
    logger.log('Calling Firebase Function: processScreenshot');
    
    // Add timeout to prevent hanging (60 seconds max)
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Screenshot processing timeout after 60 seconds')), 60000)
    );
    
    const functionPromise = processScreenshotFn({
      imageData,
      targetDay,
    });
    
    const result = await Promise.race([functionPromise, timeoutPromise]);

    const elapsed = Date.now() - startTime;
    logger.log(`Firebase Function response received (${elapsed}ms)`, {
      result: result.data
    });

    // Check if the function call was successful
    if (result.data.error) {
      throw new Error(result.data.error);
    }

    // Convert the result to match the expected format
    const minutes = result.data.minutes || 0;
    const response: ProcessScreenshotResponse = {
      day: result.data.day || targetDay,
      minutes: minutes,
      time: minutes / 60, // Convert minutes to hours
      found: result.data.found || false,
      metadata: result.data.metadata || {
        scale_min_per_px: 0,
        max_val_y: 0,
      },
      error: result.data.error,
    };

    logger.log('Processing result:', response);
    
    return response;
  } catch (error: any) {
    logger.error('Firebase Function call failed:', error);
    
    // Handle Firebase Function errors
    if (error.code) {
      // Firebase Function error
      throw new Error(
        error.message || 
        `Firebase Function error: ${error.code}`
      );
    }
    
    throw error;
  }
}

