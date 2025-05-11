import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";
import { insertEventSchema } from "@shared/schema";
import { createInsertSchema } from "drizzle-zod";
import path from "path";

// Define multer file interface for request
declare module 'express-serve-static-core' {
  interface Request {
    file?: Express.Multer.File;
  }
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept only images
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'));
    }
  }
});

// Helper function to validate request body against schema
function validateRequestBody<T>(schema: z.ZodType<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    throw new Error(`Validation error: ${error instanceof Error ? error.message : 'Unknown validation error'}`);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // GET all events
  app.get('/api/events', async (_req: Request, res: Response) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch events' });
    }
  });

  // GET recent events (limited to 3)
  app.get('/api/events/recent', async (_req: Request, res: Response) => {
    try {
      const events = await storage.getAllEvents();
      // Sort by date (most recent first) and limit to 3
      const recentEvents = events
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);
      res.json(recentEvents);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch recent events' });
    }
  });

  // GET event by ID
  app.get('/api/events/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      res.json(event);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch event' });
    }
  });

  // POST new event
  app.post('/api/events', async (req: Request, res: Response) => {
    try {
      const eventData = validateRequestBody(insertEventSchema, req.body);
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create event' });
    }
  });

  // POST upload event flyer
  app.post('/api/upload', upload.single('flyer'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // This endpoint just handles the file upload
      // The OCR processing is done client-side with Tesseract.js
      res.status(200).json({
        message: 'File uploaded successfully',
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to upload file' });
    }
  });

  // UPDATE event by ID
  app.patch('/api/events/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const existingEvent = await storage.getEvent(id);
      if (!existingEvent) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Validate the update data
      const updateData = validateRequestBody(insertEventSchema.partial(), req.body);
      
      const updatedEvent = await storage.updateEvent(id, updateData);
      res.json(updatedEvent);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to update event' });
    }
  });

  // DELETE event by ID
  app.delete('/api/events/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      await storage.deleteEvent(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete event' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
