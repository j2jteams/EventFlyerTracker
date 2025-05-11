import { events, type Event, type InsertEvent } from "@shared/schema";

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
    const createdAt = new Date().toISOString();
    
    const event: Event = { 
      ...eventData, 
      id,
      createdAt
    };
    
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
      ...eventData,
      id // Ensure ID doesn't change
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
