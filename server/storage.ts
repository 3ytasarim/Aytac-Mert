import {
  users,
  courses,
  enrollments,
  contacts,
  type User,
  type UpsertUser,
  type Course,
  type InsertCourse,
  type Enrollment,
  type InsertEnrollment,
  type Contact,
  type InsertContact,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createRegisteredUser(userData: {
    firstName: string;
    email: string;
    phone: string;
    tcNumber: string;
    password: string;
    role: string;
  }): Promise<User>;
  
  // Course operations
  getAllCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course>;
  
  // Enrollment operations
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  getUserEnrollments(userId: string): Promise<(Enrollment & { course: Course })[]>;
  getEnrollment(userId: string, courseId: string): Promise<Enrollment | undefined>;
  updateEnrollmentProgress(id: string, progress: number): Promise<Enrollment>;
  getAllEnrollments(): Promise<(Enrollment & { user: User; course: Course })[]>;
  
  // Contact operations
  createContact(contact: InsertContact): Promise<Contact>;
  getAllContacts(): Promise<Contact[]>;
  updateContactStatus(id: string, status: string): Promise<Contact>;
  
  // Admin operations
  getDashboardStats(): Promise<{
    totalStudents: number;
    activeCourses: number;
    totalEnrollments: number;
    recentContacts: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createRegisteredUser(userData: {
    firstName: string;
    email: string;
    phone: string;
    tcNumber: string;
    password: string;
    role: string;
  }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  // Course operations
  async getAllCourses(): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.isActive, true));
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db
      .insert(courses)
      .values(course)
      .returning();
    return newCourse;
  }

  async updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set({ ...course, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  // Enrollment operations
  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [newEnrollment] = await db
      .insert(enrollments)
      .values(enrollment)
      .returning();
    return newEnrollment;
  }

  async getUserEnrollments(userId: string): Promise<(Enrollment & { course: Course })[]> {
    const results = await db
      .select({
        // Enrollment fields
        id: enrollments.id,
        userId: enrollments.userId,
        courseId: enrollments.courseId,
        status: enrollments.status,
        progress: enrollments.progress,
        enrolledAt: enrollments.enrolledAt,
        completedAt: enrollments.completedAt,
        // Course fields
        course: {
          id: courses.id,
          title: courses.title,
          description: courses.description,
          price: courses.price,
          imageUrl: courses.imageUrl,
          isActive: courses.isActive,
          createdAt: courses.createdAt,
          updatedAt: courses.updatedAt,
        }
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.userId, userId));
    
    return results as (Enrollment & { course: Course })[];
  }

  async getEnrollment(userId: string, courseId: string): Promise<Enrollment | undefined> {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)));
    return enrollment;
  }

  async updateEnrollmentProgress(id: string, progress: number): Promise<Enrollment> {
    const [updatedEnrollment] = await db
      .update(enrollments)
      .set({ progress })
      .where(eq(enrollments.id, id))
      .returning();
    return updatedEnrollment;
  }

  async getAllEnrollments(): Promise<(Enrollment & { user: User; course: Course })[]> {
    const results = await db
      .select({
        // Enrollment fields
        id: enrollments.id,
        userId: enrollments.userId,
        courseId: enrollments.courseId,
        status: enrollments.status,
        progress: enrollments.progress,
        enrolledAt: enrollments.enrolledAt,
        completedAt: enrollments.completedAt,
        // User fields
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          role: users.role,
          phone: users.phone,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
        // Course fields
        course: {
          id: courses.id,
          title: courses.title,
          description: courses.description,
          price: courses.price,
          imageUrl: courses.imageUrl,
          isActive: courses.isActive,
          createdAt: courses.createdAt,
          updatedAt: courses.updatedAt,
        }
      })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.userId, users.id))
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .orderBy(desc(enrollments.enrolledAt));
    
    return results as (Enrollment & { user: User; course: Course })[];
  }

  // Contact operations
  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db
      .insert(contacts)
      .values(contact)
      .returning();
    return newContact;
  }

  async getAllContacts(): Promise<Contact[]> {
    return await db
      .select()
      .from(contacts)
      .orderBy(desc(contacts.createdAt));
  }

  async updateContactStatus(id: string, status: string): Promise<Contact> {
    const [updatedContact] = await db
      .update(contacts)
      .set({ status })
      .where(eq(contacts.id, id))
      .returning();
    return updatedContact;
  }

  // Admin operations
  async getDashboardStats(): Promise<{
    totalStudents: number;
    activeCourses: number;
    totalEnrollments: number;
    recentContacts: number;
  }> {
    const [totalStudents] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, "student"));

    const [activeCourses] = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(eq(courses.isActive, true));

    const [totalEnrollments] = await db
      .select({ count: sql<number>`count(*)` })
      .from(enrollments);

    const [recentContacts] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contacts)
      .where(eq(contacts.status, "new"));

    return {
      totalStudents: totalStudents.count,
      activeCourses: activeCourses.count,
      totalEnrollments: totalEnrollments.count,
      recentContacts: recentContacts.count,
    };
  }
}

export const storage = new DatabaseStorage();
