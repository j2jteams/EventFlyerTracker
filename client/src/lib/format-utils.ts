export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateStr;
  }
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  
  try {
    // Parse hours and minutes
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    // Convert to 12-hour format
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    // Format the time
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeStr;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check if file is too large (> 5MB)
    if (file.size > 5 * 1024 * 1024) {
      // Create a canvas to resize the image
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        const maxDimension = 1000; // Maximum dimension
        
        if (width > height && width > maxDimension) {
          height = Math.round(height * (maxDimension / width));
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round(width * (maxDimension / height));
          height = maxDimension;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw resized image to canvas and get as base64
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const resizedBase64 = canvas.toDataURL('image/jpeg', 0.7); // Lower quality
          
          resolve(resizedBase64);
          
          // Clean up
          URL.revokeObjectURL(img.src);
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Error loading image for resizing'));
      };
      
      // Load the image from file
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
    } else {
      // Standard conversion for smaller files
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    }
  });
}
