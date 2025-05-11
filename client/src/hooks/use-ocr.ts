import { useState, useCallback } from 'react';
import { createWorker, type Worker, type LoggerMessage } from 'tesseract.js';

interface OcrResult {
  text: string;
  progress: number;
}

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

    let worker: Worker | null = null;

    try {
      // Support for different image formats
      if (!imageFile.type.startsWith('image/')) {
        throw new Error('File format not supported. Please upload an image file.');
      }

      worker = await createWorker({
        logger: (m: LoggerMessage) => {
          if (m.status === 'recognizing text') {
            setProgress(m.progress * 100);
          }
        },
      });

      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      const imageUrl = URL.createObjectURL(imageFile);
      
      try {
        const { data } = await worker.recognize(imageUrl);
        
        URL.revokeObjectURL(imageUrl);
        if (worker) await worker.terminate();
        
        setProgress(100);
        setIsProcessing(false);
        return data.text;
      } catch (recognizeError) {
        URL.revokeObjectURL(imageUrl);
        if (worker) await worker.terminate();
        throw new Error('Image recognition failed. Please try a different image.');
      }
      
    } catch (err) {
      console.error('OCR processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process the image. Please try again.');
      if (worker) await worker.terminate();
      setIsProcessing(false);
      return '';
    }
  }, []);

  return { processImage, progress, isProcessing, error };
}
