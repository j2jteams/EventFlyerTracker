import { useEffect, useRef } from 'react';
import { Card } from './card';
import { Button } from './button';
import { Copy, Mail, Facebook, Twitter, Linkedin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareMenuProps {
  eventId: number;
  eventTitle: string;
  onClose: () => void;
}

export function ShareMenu({ eventId, eventTitle, onClose }: ShareMenuProps) {
  const { toast } = useToast();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const eventUrl = `${window.location.origin}/events/${eventId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(eventUrl).then(() => {
      toast({
        title: "Link copied!",
        description: "Event link has been copied to clipboard",
      });
      onClose();
    });
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(eventTitle);
    const body = encodeURIComponent(`Check out this event: ${eventTitle}\n${eventUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
    onClose();
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`);
    onClose();
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this event: ${eventTitle}`)}&url=${encodeURIComponent(eventUrl)}`);
    onClose();
  };

  const shareToLinkedin = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`);
    onClose();
  };

  return (
    <Card ref={menuRef} className="absolute right-0 top-8 z-50 w-56 p-2 shadow-lg">
      <div className="space-y-1">
        <Button variant="ghost" className="w-full justify-start text-sm" onClick={copyToClipboard}>
          <Copy className="h-4 w-4 mr-2" />
          Copy link
        </Button>
        <Button variant="ghost" className="w-full justify-start text-sm" onClick={shareViaEmail}>
          <Mail className="h-4 w-4 mr-2" />
          Email
        </Button>
        <Button variant="ghost" className="w-full justify-start text-sm" onClick={shareToFacebook}>
          <Facebook className="h-4 w-4 mr-2" />
          Facebook
        </Button>
        <Button variant="ghost" className="w-full justify-start text-sm" onClick={shareToTwitter}>
          <Twitter className="h-4 w-4 mr-2" />
          Twitter
        </Button>
        <Button variant="ghost" className="w-full justify-start text-sm" onClick={shareToLinkedin}>
          <Linkedin className="h-4 w-4 mr-2" />
          LinkedIn
        </Button>
      </div>
    </Card>
  );
}
