import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, CalendarPlus, MapPin, Share } from "lucide-react";
import { formatDate, formatTime } from "@/lib/format-utils";
import { useToast } from "@/hooks/use-toast";
import { ShareMenu } from "@/components/ui/share-menu";
import { CategoryBadge } from "@/components/ui/category-badge";

export default function EventDetailPage() {
  const [, params] = useRoute("/events/:id");
  const eventId = params?.id ? parseInt(params.id) : 0;
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const { toast } = useToast();

  // Fetch event details
  const { data: event, isLoading, error } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId,
  });

  // Set page title
  useEffect(() => {
    if (event) {
      document.title = `${event.title} | EventExtract`;
    } else {
      document.title = "Event Details | EventExtract";
    }
    
    return () => {
      document.title = "EventExtract";
    };
  }, [event]);

  // Add event to calendar
  const addToCalendar = () => {
    if (!event) return;
    
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
    
    toast({
      title: "Calendar link created",
      description: "The event will open in Google Calendar."
    });
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

  // Handle download of event details
  const handleDownload = () => {
    if (!event) return;

    // Create a text file with event details
    const eventDetails = `
      Event: ${event.title}
      Date: ${formatDate(event.date)}
      Time: ${formatTime(event.startTime)} - ${formatTime(event.endTime)}
      Location: ${event.venue}, ${event.address}
      Fee: ${event.fee || 'Free'}
      Registration: ${event.registrationLink || 'N/A'}
      Contact: ${event.contactName1 || ''} ${event.contactPhone1 || ''}
      Organization: ${event.organization || ''}
      ${event.notes ? `Notes: ${event.notes}` : ''}
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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <Link href="/events">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Events
            </Button>
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8 animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="h-96 bg-gray-300 rounded-lg"></div>
            </div>
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <Link href="/events">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Events
            </Button>
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-6">
            The event you're looking for might have been removed or doesn't exist.
          </p>
          <Link href="/events">
            <Button>Browse All Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/events">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Events
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDownload}>
            Download Details
          </Button>
          <div className="relative">
            <Button onClick={() => setIsShareMenuOpen(!isShareMenuOpen)} variant="outline">
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
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
            <CategoryBadge category={event.category} />
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <img 
                src={event.imageData || getEventImage(event.category)} 
                alt={`${event.title} flyer`} 
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
            
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Date & Time</h3>
                <p className="text-gray-900">{formatDate(event.date)}</p>
                <p className="text-gray-900">{formatTime(event.startTime)} - {formatTime(event.endTime)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Location</h3>
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
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Categories</h3>
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
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Registration</h3>
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
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Contact Information</h3>
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
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Organization</h3>
                  <p className="text-gray-900">{event.organization}</p>
                </div>
              )}
              
              {event.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Additional Information</h3>
                  <p className="text-gray-600">{event.notes}</p>
                </div>
              )}
              
              <div className="pt-4">
                <Button onClick={addToCalendar} className="w-full sm:w-auto">
                  <CalendarPlus className="h-4 w-4 mr-2" /> Add to Calendar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
