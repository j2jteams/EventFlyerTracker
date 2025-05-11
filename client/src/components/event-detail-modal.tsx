import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Event } from '@shared/schema';
import { formatDate, formatTime } from '@/lib/format-utils';
import { MapPin, CalendarPlus, Share } from 'lucide-react';
import { useState } from 'react';
import { ShareMenu } from './ui/share-menu';

interface EventDetailModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailModal({ event, isOpen, onClose }: EventDetailModalProps) {
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

  if (!event) return null;

  const addToCalendar = () => {
    const startDate = new Date(event.date);
    const [startHours, startMinutes] = event.startTime.split(':').map(Number);
    startDate.setHours(startHours, startMinutes);
    
    const endDate = new Date(event.date);
    const [endHours, endMinutes] = event.endTime.split(':').map(Number);
    endDate.setHours(endHours, endMinutes);
    
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(`
      ${event.notes ? event.notes + '\n\n' : ''}
      ${event.organization ? 'Organized by: ' + event.organization + '\n' : ''}
      ${event.contactName1 ? 'Contact: ' + event.contactName1 + (event.contactPhone1 ? ' (' + event.contactPhone1 + ')' : '') : ''}
    `.trim());
    const location = encodeURIComponent(`${event.venue}, ${event.address}`);
    
    // Format dates for Google Calendar
    const formatDateForCalendar = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const startDateFormatted = formatDateForCalendar(startDate);
    const endDateFormatted = formatDateForCalendar(endDate);
    
    // Google Calendar link
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateFormatted}/${endDateFormatted}&details=${details}&location=${location}&sf=true&output=xml`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  // Get a stock photo based on event category
  const getEventImage = (category: string) => {
    const sportImages = [
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=1000",
      "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=1000"
    ];
    
    const culturalImages = [
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=1000",
      "https://images.unsplash.com/photo-1516450360452-9312f5463805?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=1000"
    ];
    
    const otherImages = [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=1000",
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=1000"
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{event.title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          <div className="md:col-span-1">
            <img 
              src={event.imageData || getEventImage(event.category)} 
              alt={`${event.title} flyer`} 
              className="w-full h-auto rounded-lg shadow-md"
            />
          </div>
          
          <div className="md:col-span-2 space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Date & Time</h4>
              <p className="text-gray-900">{formatDate(event.date)}</p>
              <p className="text-gray-900">{formatTime(event.startTime)} - {formatTime(event.endTime)}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Location</h4>
              <p className="text-gray-900">{event.venue}</p>
              <p className="text-gray-900">{event.address}</p>
              <div className="mt-2">
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${event.venue}, ${event.address}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-700 text-sm font-medium flex items-center"
                >
                  <MapPin className="h-4 w-4 mr-1" /> View on Map
                </a>
              </div>
            </div>
            
            {event.categories && event.categories.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {event.categories.map((category, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Registration</h4>
              {event.fee && <p className="text-gray-900">Entry Fee: {event.fee}</p>}
              {event.registrationDeadline && (
                <p className="text-gray-900">Registration Deadline: {formatDate(event.registrationDeadline)}</p>
              )}
              {event.registrationLink && (
                <div className="mt-3">
                  <a 
                    href={event.registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Register Now
                  </a>
                </div>
              )}
            </div>
            
            {(event.contactName1 || event.contactName2) && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Contact Information</h4>
                {event.contactName1 && (
                  <p className="text-gray-900">
                    {event.contactName1}
                    {event.contactPhone1 && `: ${event.contactPhone1}`}
                  </p>
                )}
                {event.contactName2 && (
                  <p className="text-gray-900">
                    {event.contactName2}
                    {event.contactTitle2 && `, ${event.contactTitle2}`}
                  </p>
                )}
              </div>
            )}
            
            {event.organization && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Organization</h4>
                <p className="text-gray-900">{event.organization}</p>
              </div>
            )}
            
            {event.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Additional Information</h4>
                <p className="text-gray-600">{event.notes}</p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="px-6 py-4 bg-gray-50 border-t space-x-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={addToCalendar}>
            <CalendarPlus className="h-4 w-4 mr-2" /> Add to Calendar
          </Button>
          <div className="relative">
            <Button onClick={() => setIsShareMenuOpen(!isShareMenuOpen)} variant="secondary">
              <Share className="h-4 w-4 mr-2" /> Share
            </Button>
            {isShareMenuOpen && (
              <ShareMenu 
                eventId={event.id}
                eventTitle={event.title} 
                onClose={() => setIsShareMenuOpen(false)}
              />
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
