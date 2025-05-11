import { events, type Event, type InsertEvent } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  getEvent(id: number): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: number): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private events: Map<number, Event>;
  private currentEventId: number;

  constructor() {
    this.events = new Map();
    this.currentEventId = 1;
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async createEvent(eventData: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    
    // Creating a timestamp for createdAt
    const createdAt = new Date();
    
    // Handle undefined optional fields with explicit typing for each field
    const sanitizedData = {
      title: eventData.title,
      date: eventData.date,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      venue: eventData.venue,
      address: eventData.address,
      fee: eventData.fee || null,
      registrationDeadline: eventData.registrationDeadline || null,
      registrationLink: eventData.registrationLink || null,
      categories: Array.isArray(eventData.categories) ? eventData.categories : [], 
      contactName1: eventData.contactName1 || null,
      contactPhone1: eventData.contactPhone1 || null,
      contactName2: eventData.contactName2 || null,
      contactTitle2: eventData.contactTitle2 || null,
      organization: eventData.organization || null,
      notes: eventData.notes || null,
      category: eventData.category,
      imageData: eventData.imageData || null,
      extractedText: eventData.extractedText || null,
    };
    
    const event: Event = { 
      ...sanitizedData, 
      id,
      createdAt
    };
    
    console.log('Creating event with ID:', id);
    
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event> {
    const existingEvent = this.events.get(id);
    
    if (!existingEvent) {
      throw new Error(`Event with ID ${id} not found`);
    }
    
    const updatedEvent: Event = {
      ...existingEvent,
      ...eventData
    };
    
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<void> {
    if (!this.events.has(id)) {
      throw new Error(`Event with ID ${id} not found`);
    }
    
    this.events.delete(id);
  }
}

// Export singleton instance
export const storage = new MemStorage();
