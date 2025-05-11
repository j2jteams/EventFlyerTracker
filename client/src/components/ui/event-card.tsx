import { Calendar, MapPin, Tag, ChevronRight, Share2, Download } from 'lucide-react';
import { Card, CardContent } from './card';
import { Button } from './button';
import { ShareMenu } from './share-menu';
import { formatDate, formatTime } from '@/lib/format-utils';
import { Event } from '@shared/schema';
import { CategoryBadge } from './category-badge';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Link } from 'wouter';

interface EventCardProps {
  event: Event;
  onViewDetails: (event: Event) => void;
}

export function EventCard({ event, onViewDetails }: EventCardProps) {
  const { toast } = useToast();
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

  const handleShare = () => {
    setIsShareMenuOpen(true);
  };

  const handleDownload = () => {
    // Create a text file with event details
    const eventDetails = `
      Event: ${event.title}
      Date: ${formatDate(event.date)}
      Time: ${formatTime(event.startTime)} - ${formatTime(event.endTime)}
      Location: ${event.venue}, ${event.address}
      Fee: ${event.fee || 'Free'}
      Registration: ${event.registrationLink || 'N/A'}
      Contact: ${event.contactName1 || ''} ${event.contactPhone1 || ''}
    `;

    const blob = new Blob([eventDetails.trim()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Event details downloaded",
      description: "The event details have been downloaded as a text file.",
    });
  };

  // Get a stock photo based on event category
  const getEventImage = (category: string) => {
    const sportImages = [
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
      "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400"
    ];
    
    const culturalImages = [
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
      "https://images.unsplash.com/photo-1516450360452-9312f5463805?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400"
    ];
    
    const otherImages = [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400"
    ];
    
    if (category.toLowerCase() === 'sports') {
      return sportImages[Math.floor(Math.random() * sportImages.length)];
    } else if (category.toLowerCase() === 'cultural') {
      return culturalImages[Math.floor(Math.random() * culturalImages.length)];
    } else {
      return otherImages[Math.floor(Math.random() * otherImages.length)];
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition duration-200 ease-in-out">
      <div className="h-48 bg-gray-200 relative overflow-hidden">
        <img 
          src={event.imageData || getEventImage(event.category)}
          alt={`${event.title} flyer`} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <CategoryBadge category={event.category} />
        </div>
      </div>
      <CardContent className="p-4">
        <h4 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h4>
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{formatDate(event.date)} • {formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
        </div>
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{event.venue}, {event.address.split(',')[1] || ''}</span>
        </div>
        <div className="flex items-center text-gray-600 text-sm mb-4">
          <Tag className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{event.fee || 'Free'}</span>
        </div>
        <div className="flex justify-between items-center">
          <Button 
            variant="link" 
            className="p-0 h-auto text-primary font-medium text-sm"
            onClick={() => onViewDetails(event)}
          >
            View Details
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 relative"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              {isShareMenuOpen && (
                <ShareMenu 
                  eventId={event.id}
                  eventTitle={event.title} 
                  onClose={() => setIsShareMenuOpen(false)}
                />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
