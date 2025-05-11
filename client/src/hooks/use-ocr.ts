import { useState, useCallback } from 'react';
import * as Tesseract from 'tesseract.js';

interface UseOcrReturn {
  processImage: (imageFile: File) => Promise<string>;
  progress: number;
  isProcessing: boolean;
  error: string | null;
}

export function useOcr(): UseOcrReturn {
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processImage = useCallback(async (imageFile: File): Promise<string> => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Support for different image formats
      if (!imageFile.type.startsWith('image/')) {
        throw new Error('File format not supported. Please upload an image file.');
      }

      // Use the file object directly
      const result = await Tesseract.recognize(
        imageFile,
        'eng'
      );
      
      // Set progress to 100% when done
      setProgress(100);
      setIsProcessing(false);
      return result.data.text || '';
    } catch (err) {
      console.error('OCR processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process the image. Please try again.');
      setIsProcessing(false);
      return '';
    }
  }, []);

  return { processImage, progress, isProcessing, error };
}
