import { InsertEvent } from '@shared/schema';

interface ExtractedData extends Partial<InsertEvent> {}

export function parseEventText(text: string): ExtractedData {
  const extractedData: ExtractedData = {
    categories: [],
    category: 'Sports', // Default category
  };

  // Extract title
  const titleMatch = text.match(/^\s*([A-Z][A-Za-z\s]+(?:LEAGUE|Tournament|Festival|Conference|Gala|Event|Championship|Competition|Concert))/m);
  if (titleMatch) {
    extractedData.title = titleMatch[1].trim();
  } else {
    // Try to find any reasonable title-like text
    const titleAlternateMatch = text.match(/([A-Z][A-Za-z\s]{2,}(?:League|Tournament|Festival|Conference|Gala|Event|Championship|Competition|Concert))/i);
    if (titleAlternateMatch) {
      extractedData.title = titleAlternateMatch[1].trim();
    }
  }

  // Extract date
  const dateMatch = text.match(/(?:on|date|saturday|sunday|monday|tuesday|wednesday|thursday|friday)[:\s]*(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[.\s]+([0-9]{1,2})(?:[,.\s]+([0-9]{4}))?/i);
  if (dateMatch) {
    const month = dateMatch[1];
    const day = dateMatch[2];
    const year = dateMatch[3] || new Date().getFullYear().toString();
    
    const monthMap: { [key: string]: string } = {
      'jan': '01', 'january': '01',
      'feb': '02', 'february': '02',
      'mar': '03', 'march': '03',
      'apr': '04', 'april': '04',
      'may': '05',
      'jun': '06', 'june': '06',
      'jul': '07', 'july': '07',
      'aug': '08', 'august': '08',
      'sep': '09', 'september': '09',
      'oct': '10', 'october': '10',
      'nov': '11', 'november': '11',
      'dec': '12', 'december': '12'
    };
    
    const monthNumber = monthMap[month.toLowerCase()];
    if (monthNumber) {
      const formattedDay = day.padStart(2, '0');
      extractedData.date = `${year}-${monthNumber}-${formattedDay}`;
    }
  } else {
    // Try a different date format: MM/DD/YYYY or DD/MM/YYYY
    const dateFormatMatch = text.match(/([0-9]{1,2})[\/\-]([0-9]{1,2})[\/\-]([0-9]{2,4})/);
    if (dateFormatMatch) {
      const part1 = dateFormatMatch[1];
      const part2 = dateFormatMatch[2];
      let year = dateFormatMatch[3];
      
      // Normalize year
      if (year.length === 2) {
        const currentYear = new Date().getFullYear().toString();
        const century = currentYear.substring(0, 2);
        year = century + year;
      }
      
      // Determine if it's MM/DD or DD/MM
      // For simplicity, assume MM/DD format for US-based events
      const month = part1.padStart(2, '0');
      const day = part2.padStart(2, '0');
      
      extractedData.date = `${year}-${month}-${day}`;
    }
  }

  // Extract time
  const timeMatch = text.match(/([0-9]{1,2}:[0-9]{2})\s*(am|pm|AM|PM)?(?:\s*-\s*|\s+to\s+)([0-9]{1,2}:[0-9]{2})\s*(am|pm|AM|PM)?/i);
  if (timeMatch) {
    let startTime = timeMatch[1];
    const startAmPm = timeMatch[2]?.toLowerCase() || 'am';
    let endTime = timeMatch[3];
    const endAmPm = timeMatch[4]?.toLowerCase() || 'pm';
    
    // Convert to 24-hour format
    extractedData.startTime = convertTo24HourFormat(startTime, startAmPm);
    extractedData.endTime = convertTo24HourFormat(endTime, endAmPm);
  } else {
    // Try to match just a start time
    const startTimeMatch = text.match(/(?:start|begin|from)[:\s]*([0-9]{1,2}:[0-9]{2})\s*(am|pm|AM|PM)?/i);
    if (startTimeMatch) {
      const startTime = startTimeMatch[1];
      const amPm = startTimeMatch[2]?.toLowerCase() || 'am';
      extractedData.startTime = convertTo24HourFormat(startTime, amPm);
      
      // Assume a default duration of 2 hours if no end time is provided
      const [hours, minutes] = extractedData.startTime.split(':').map(Number);
      const endHours = (hours + 2) % 24;
      extractedData.endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }

  // Extract venue
  const venueMatch = text.match(/(?:venue|location|place)[:\s]*([^\n,]+)(?:,|$)/i);
  if (venueMatch) {
    extractedData.venue = venueMatch[1].trim();
  }

  // Extract address
  const addressMatch = text.match(/(?:address|location|place)[:\s]*(?:[^,\n]+),?\s*([A-Za-z0-9\s,.]+(?:[A-Za-z]+,\s*[A-Z]{2}\s*[0-9]{5}))/i);
  if (addressMatch) {
    extractedData.address = addressMatch[1].trim();
  } else {
    // Look for zipcode pattern
    const zipcodeMatch = text.match(/([A-Za-z0-9\s,.]+(?:[A-Za-z]+,\s*[A-Z]{2}\s*[0-9]{5}))/i);
    if (zipcodeMatch) {
      extractedData.address = zipcodeMatch[1].trim();
    }
  }

  // Extract registration fee
  const feeMatch = text.match(/(?:fee|cost|price|entry)[:\s]*\$?([0-9]+)(?:\s*per\s+([a-z]+))?/i);
  if (feeMatch) {
    const amount = feeMatch[1];
    const unit = feeMatch[2] || 'person';
    extractedData.fee = `$${amount} per ${unit}`;
  }

  // Extract registration deadline
  const deadlineMatch = text.match(/(?:deadline|last date|register by)[:\s]*(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[.\s]+([0-9]{1,2})(?:[,.\s]+([0-9]{4}))?/i);
  if (deadlineMatch) {
    const month = deadlineMatch[1];
    const day = deadlineMatch[2];
    const year = deadlineMatch[3] || new Date().getFullYear().toString();
    
    const monthMap: { [key: string]: string } = {
      'jan': '01', 'january': '01',
      'feb': '02', 'february': '02',
      'mar': '03', 'march': '03',
      'apr': '04', 'april': '04',
      'may': '05',
      'jun': '06', 'june': '06',
      'jul': '07', 'july': '07',
      'aug': '08', 'august': '08',
      'sep': '09', 'september': '09',
      'oct': '10', 'october': '10',
      'nov': '11', 'november': '11',
      'dec': '12', 'december': '12'
    };
    
    const monthNumber = monthMap[month.toLowerCase()];
    if (monthNumber) {
      const formattedDay = day.padStart(2, '0');
      extractedData.registrationDeadline = `${year}-${monthNumber}-${formattedDay}`;
    }
  }

  // Extract registration link
  const linkMatch = text.match(/(?:register|registration)[^:]*:?\s*(https?:\/\/[^\s]+)/i);
  if (linkMatch) {
    extractedData.registrationLink = linkMatch[1].trim();
  } else {
    // Try to find any URL
    const urlMatch = text.match(/(https?:\/\/[^\s]+)/i);
    if (urlMatch) {
      extractedData.registrationLink = urlMatch[1].trim();
    }
  }

  // Extract contact information
  const contactMatch = text.match(/(?:contact|info|details)[^:]*:?\s*([A-Za-z\s]+)(?:[,:\s]+|\()([0-9()\-\s\.+]+)/i);
  if (contactMatch) {
    extractedData.contactName1 = contactMatch[1].trim();
    extractedData.contactPhone1 = contactMatch[2].trim();
  } else {
    // Look for phone number pattern
    const phoneMatch = text.match(/([0-9]{3}[\s\-\.]?[0-9]{3}[\s\-\.]?[0-9]{4})/);
    if (phoneMatch) {
      extractedData.contactPhone1 = phoneMatch[1].trim();
      
      // Try to find a name before the phone number
      const nameBeforePhone = text.substring(0, text.indexOf(phoneMatch[1])).match(/([A-Z][A-Za-z\s]{2,})[,\s]*$/);
      if (nameBeforePhone) {
        extractedData.contactName1 = nameBeforePhone[1].trim();
      }
    }
  }

  // Extract organization
  const orgMatch = text.match(/(?:organized by|presented by|host(?:ed)? by)[:\s]*([A-Za-z\s]+)/i);
  if (orgMatch) {
    extractedData.organization = orgMatch[1].trim();
  } else if (text.includes('Association') || text.includes('Foundation') || text.includes('Society') || text.includes('Club')) {
    const orgNameMatch = text.match(/([A-Z][A-Za-z\s]+(?:Association|Foundation|Society|Club))/);
    if (orgNameMatch) {
      extractedData.organization = orgNameMatch[1].trim();
    }
  }

  // Extract categories or event types
  const categoryKeywords = [
    "men's doubles", "women's doubles", "mixed doubles", "singles", 
    "junior", "senior", "pro", "amateur", "recreational", "league",
    "tournament", "championship", "competition"
  ];
  
  const foundCategories = new Set<string>();
  
  categoryKeywords.forEach(keyword => {
    const regex = new RegExp(`${keyword}[\\s,]*(?:level)?[\\s:]*(\\d+)?(?:[\\s&]+(\\d+))?`, 'gi');
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      let category = match[0].trim();
      
      // Clean up the category
      category = category.replace(/,$/, '').trim();
      category = category.charAt(0).toUpperCase() + category.slice(1);
      
      foundCategories.add(category);
    }
  });
  
  extractedData.categories = Array.from(foundCategories);

  // Determine the main category
  if (text.toLowerCase().includes('pickleball') || 
      text.toLowerCase().includes('tennis') ||
      text.toLowerCase().includes('basketball') ||
      text.toLowerCase().includes('soccer') ||
      text.toLowerCase().includes('tournament') ||
      extractedData.categories.some(cat => cat.toLowerCase().includes('doubles') || cat.toLowerCase().includes('singles'))) {
    extractedData.category = 'Sports';
  } else if (text.toLowerCase().includes('music') || 
             text.toLowerCase().includes('dance') ||
             text.toLowerCase().includes('art') ||
             text.toLowerCase().includes('exhibition') ||
             text.toLowerCase().includes('cultural')) {
    extractedData.category = 'Cultural';
  } else if (text.toLowerCase().includes('charity') || 
             text.toLowerCase().includes('fundraiser') ||
             text.toLowerCase().includes('donation') ||
             text.toLowerCase().includes('benefit')) {
    extractedData.category = 'Fundraising';
  } else if (text.toLowerCase().includes('class') || 
             text.toLowerCase().includes('workshop') ||
             text.toLowerCase().includes('seminar') ||
             text.toLowerCase().includes('education')) {
    extractedData.category = 'Education';
  }

  // Extract notes
  const sponsorMatch = text.match(/(?:sponsor|presented by)[:\s]*([A-Za-z\s]+)/i);
  if (sponsorMatch) {
    extractedData.notes = `Sponsor: ${sponsorMatch[1].trim()}`;
  }

  return extractedData;
}

// Helper function to convert time to 24-hour format
function convertTo24HourFormat(time: string, amPm: string): string {
  let [hours, minutes] = time.split(':').map(Number);
  
  if (amPm === 'pm' && hours < 12) {
    hours += 12;
  } else if (amPm === 'am' && hours === 12) {
    hours = 0;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
