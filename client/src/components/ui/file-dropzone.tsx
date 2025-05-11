import { useState, useRef } from 'react';
import { Button } from './button';
import { UploadCloud } from 'lucide-react';

interface FileDropzoneProps {
  onFileDrop: (file: File) => void;
  isProcessing?: boolean;
  progress?: number;
}

export function FileDropzone({ onFileDrop, isProcessing = false, progress = 0 }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcessFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndProcessFile(file);
    }
  };

  const validateAndProcessFile = (file: File) => {
    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file. Currently only image formats are supported.');
      return;
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB. Please upload a smaller file.');
      return;
    }

    onFileDrop(file);
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center bg-gray-50 file-dropzone ${isDragging ? 'border-primary dragging' : 'border-gray-300'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <div className="space-y-4">
          <UploadCloud className="h-10 w-10 mx-auto text-gray-400" />
          <div className="text-gray-600">
            <p className="font-medium">Drag and drop your flyer image here</p>
            <p className="text-sm">or</p>
          </div>
          <Button
            variant="default"
            className="mx-auto"
            disabled={isProcessing}
          >
            Browse Files
          </Button>
          <input 
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept="image/*"
          />
          <p className="text-xs text-gray-500">Supported formats: JPG, PNG, GIF (max 10MB)</p>
        </div>
      </div>

      {isProcessing && (
        <div className="mt-6">
          <div className="flex items-center justify-center space-x-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-600">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
}
