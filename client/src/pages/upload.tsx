import { useState } from "react";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { EventForm } from "@/components/event-form";
import { Card, CardContent } from "@/components/ui/card";
import { useOcr } from "@/hooks/use-ocr";
import { parseEventText } from "@/lib/event-parser";
import { fileToBase64 } from "@/lib/format-utils";
import { InsertEvent } from "@shared/schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [extractedData, setExtractedData] = useState<Partial<InsertEvent>>({});
  const [showExtractedDetails, setShowExtractedDetails] = useState(false);
  const { processImage, progress, isProcessing, error } = useOcr();

  const handleFileDrop = async (uploadedFile: File) => {
    setFile(uploadedFile);
    
    try {
      // Convert file to base64 for preview
      const base64Data = await fileToBase64(uploadedFile);
      setImageData(base64Data);
      
      // Process the image with OCR
      const text = await processImage(uploadedFile);
      
      if (text && text.trim()) {
        setExtractedText(text);
        
        // Parse the extracted text
        const parsedData = parseEventText(text);
        setExtractedData(parsedData);
        
        // Show the extracted details section
        setShowExtractedDetails(true);
      } else {
        // Handle case where no text was extracted
        console.warn("No text could be extracted from the image");
      }
    } catch (err) {
      console.error("Error processing file:", err);
      // Keep the extracted details section hidden if there was an error
      setShowExtractedDetails(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Upload Event Flyer</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Upload your event flyers and our system will automatically extract all the important details. No more manual data entry!
        </p>
      </section>

      {/* Upload Section */}
      <Card className="mb-12 overflow-hidden">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Event Flyer</h2>
          
          <FileDropzone 
            onFileDrop={handleFileDrop} 
            isProcessing={isProcessing}
            progress={progress}
          />

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Extracted Details Section */}
      {showExtractedDetails && (
        <Card className="mb-12 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Extracted Event Details</h2>
            </div>

            <EventForm 
              initialData={extractedData} 
              extractedText={extractedText}
              imageData={imageData || undefined}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
