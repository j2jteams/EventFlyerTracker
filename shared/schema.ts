import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  venue: text("venue").notNull(),
  address: text("address").notNull(),
  fee: text("fee"),
  registrationDeadline: text("registration_deadline"),
  registrationLink: text("registration_link"),
  categories: json("categories").notNull().$type<string[]>(),
  contactName1: text("contact_name1"),
  contactPhone1: text("contact_phone1"),
  contactName2: text("contact_name2"),
  contactTitle2: text("contact_title2"),
  organization: text("organization"),
  notes: text("notes"),
  category: text("category").notNull(),
  imageData: text("image_data"),
  extractedText: text("extracted_text"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
