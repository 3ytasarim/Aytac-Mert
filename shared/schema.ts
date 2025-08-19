import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("student"), // student or admin
  phone: varchar("phone"),
  tcNumber: varchar("tc_number"), // T.C. Kimlik No
  password: varchar("password"), // Şifre
  passwordConfirm: varchar("password_confirm"), // Şifre Tekrarı
  birthDate: varchar("birth_date"), // Doğrulama (Captcha equivalent)
  termsAccepted: boolean("terms_accepted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in kuruş (25000000 = 25.000₺)
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const enrollments = pgTable("enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  status: varchar("status").notNull().default("pending"), // pending, active, completed
  progress: integer("progress").default(0), // 0-100
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: varchar("full_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  message: text("message").notNull(),
  status: varchar("status").default("new"), // new, responded
  createdAt: timestamp("created_at").defaultNow(),
});

// Lessons table for course chapters/videos
export const lessons = pgTable("lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  videoEmbedCode: text("video_embed_code").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  enrollments: many(enrollments),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  enrollments: many(enrollments),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
  }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrolledAt: true,
  completedAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  status: true,
  createdAt: true,
});

// Registration schema for the popup form
export const registrationSchema = createInsertSchema(users).pick({
  firstName: true,
  tcNumber: true,
  email: true,
  phone: true,
  password: true,
  passwordConfirm: true,
  birthDate: true,
  termsAccepted: true,
}).extend({
  firstName: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  tcNumber: z.string().length(11, "T.C. Kimlik No 11 haneli olmalıdır"),
  email: z.string().email("Geçerli bir email adresi giriniz"),
  phone: z.string().min(10, "Telefon numarası en az 10 haneli olmalıdır"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  passwordConfirm: z.string().min(6, "Şifre tekrarı en az 6 karakter olmalıdır"),
  birthDate: z.string().min(1, "Doğrulama alanı gereklidir"),
  termsAccepted: z.boolean().refine((val) => val === true, "Gizlilik sözleşmesini kabul etmelisiniz"),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Şifreler eşleşmiyor",
  path: ["passwordConfirm"],
});

// Password reset schemas
export const requestPasswordResetSchema = z.object({
  email: z.string().email("Geçerli bir email adresi giriniz"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token gereklidir"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  confirmPassword: z.string().min(6, "Şifre tekrarı en az 6 karakter olmalıdır"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type Registration = z.infer<typeof registrationSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type RequestPasswordReset = z.infer<typeof requestPasswordResetSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
