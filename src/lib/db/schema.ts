import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

// Task 19: Projects table
export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  path: text("path"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  settings: text("settings"), // JSON blob for project-specific settings
});

// Task 20: Sprints table
export const sprints = pgTable("sprints", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: text("status", { enum: ["planned", "active", "completed"] }).notNull(),
  createdAt: timestamp("created_at").notNull(),
  completedAt: timestamp("completed_at"),
});

// Task 21: Tasks table
export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  sprintId: text("sprint_id")
    .notNull()
    .references(() => sprints.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: ["todo", "in_progress", "done"] }).notNull(),
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").notNull(),
  completedAt: timestamp("completed_at"),
});

// Task 22: Documents table
export const documents = pgTable("documents", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  content: text("content").notNull(),
  docType: text("doc_type", { enum: ["brief", "prd", "tad", "other"] }),
  folder: text("folder"), // planning, building, shipping
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Task 23: Conversations table
export const conversations = pgTable("conversations", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  title: text("title"),
  modelId: text("model_id"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Task 23: Messages table
export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

// Task 24: Secrets table
export const secrets = pgTable("secrets", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  encryptedValue: text("encrypted_value").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Task 24: Settings table (app-wide singleton)
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(), // JSON-encoded value
  updatedAt: timestamp("updated_at").notNull(),
});

// Type exports for use throughout the app
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Sprint = typeof sprints.$inferSelect;
export type NewSprint = typeof sprints.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type Secret = typeof secrets.$inferSelect;
export type NewSecret = typeof secrets.$inferInsert;

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;

// Integrations table for connectors
export const integrations = pgTable("integrations", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // github, openai, anthropic, ollama, vercel, neon, telegram
  name: text("name").notNull(),
  config: text("config"), // JSON string for credentials/settings
  connected: integer("connected").default(0),
  lastChecked: timestamp("last_checked"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Changelog table for project history
export const changelog = pgTable("changelog", {
  id: text("id").primaryKey(),
  projectId: text("project_id").references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  content: text("content"),
  type: text("type"), // sprint_complete, deploy, milestone, manual
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Integration = typeof integrations.$inferSelect;
export type NewIntegration = typeof integrations.$inferInsert;

export type Changelog = typeof changelog.$inferSelect;
export type NewChangelog = typeof changelog.$inferInsert;

// Media table for images and file uploads
export const media = pgTable("media", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(), // bytes
  data: text("data").notNull(), // base64 encoded
  createdAt: timestamp("created_at").defaultNow(),
});

export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
