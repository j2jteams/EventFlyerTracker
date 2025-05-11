import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertEventSchema, InsertEvent } from '@shared/schema';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'wouter';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Extend the schema to add validation
const extendedEventSchema = insertEventSchema.extend({
  title: z.string().min(3, { message: "Event title must be at least 3 characters" }),
  date: z.string().min(1, { message: "Date is required" }),
  startTime: z.string().min(1, { message: "Start time is required" }),
  endTime: z.string().min(1, { message: "End time is required" }),
  venue: z.string().min(1, { message: "Venue is required" }),
  address: z.string().min(1, { message: "Address is required" }),
});

interface EventFormProps {
  initialData: Partial<InsertEvent>;
  extractedText?: string;
  imageData?: string;
}

export function EventForm({ initialData, extractedText, imageData }: EventFormProps) {
  const { toast } = useToast();
  const [, navigate] = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InsertEvent>({
    resolver: zodResolver(extendedEventSchema),
    defaultValues: {
      title: initialData.title || '',
      date: initialData.date || '',
      startTime: initialData.startTime || '',
      endTime: initialData.endTime || '',
      venue: initialData.venue || '',
      address: initialData.address || '',
      fee: initialData.fee || '',
      registrationDeadline: initialData.registrationDeadline || '',
      registrationLink: initialData.registrationLink || '',
      categories: initialData.categories || [],
      contactName1: initialData.contactName1 || '',
      contactPhone1: initialData.contactPhone1 || '',
      contactName2: initialData.contactName2 || '',
      contactTitle2: initialData.contactTitle2 || '',
      organization: initialData.organization || '',
      notes: initialData.notes || '',
      category: initialData.category || 'Sports',
      imageData: imageData || '',
      extractedText: extractedText || '',
    },
  });

  const onSubmit = async (data: InsertEvent) => {
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('POST', '/api/events', data);
      const result = await response.json();
      
      toast({
        title: "Success!",
        description: "Event has been saved successfully.",
      });
      
      // Redirect to the events list page
      navigate('/events');
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Error",
        description: "Failed to save event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonCategorySuggestions = [
    "Men's Doubles Pro (Level 4 & 5)",
    "Men's Doubles (below Level 4)",
    "Women's Doubles",
    "Mixed Doubles",
    "Sr. Jr. League (Junior age < 14)",
    "Recreational Doubles",
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter event title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter venue name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter venue address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Fee</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. $30 per Team" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="registrationDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="registrationLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Link</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://example.com/register" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Category</FormLabel>
                  <FormControl>
                    <select 
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    >
                      <option value="Sports">Sports</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Education">Education</option>
                      <option value="Fundraising">Fundraising</option>
                      <option value="Other">Other</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Categories</Label>
              <div className="space-y-2">
                <Controller
                  control={form.control}
                  name="categories"
                  render={({ field }) => (
                    <>
                      {commonCategorySuggestions.map((category, index) => (
                        <div key={index} className="flex items-center">
                          <Checkbox
                            id={`category-${index}`}
                            checked={field.value?.includes(category)}
                            onCheckedChange={(checked) => {
                              const newCategories = checked
                                ? [...(field.value || []), category]
                                : (field.value || []).filter((c) => c !== category);
                              field.onChange(newCategories);
                            }}
                          />
                          <Label htmlFor={`category-${index}`} className="ml-2 text-sm text-gray-700">
                            {category}
                          </Label>
                        </div>
                      ))}
                    </>
                  )}
                />
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="contactName1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Primary contact person" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contactPhone1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Phone number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contactName2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secondary Contact Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Secondary contact person" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contactTitle2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secondary Contact Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Event Coordinator" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Organizing body or company" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Any additional information about the event"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate('/events')}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Event'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
