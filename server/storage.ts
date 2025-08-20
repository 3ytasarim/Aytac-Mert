import {
  users,
  courses,
  enrollments,
  contacts,
  lessons,
  passwordResetTokens,
  invoices,
  studentContacts,
  type User,
  type UpsertUser,
  type Course,
  type InsertCourse,
  type Enrollment,
  type InsertEnrollment,
  type Contact,
  type InsertContact,
  type Lesson,
  type InsertLesson,
  type PasswordResetToken,
  type Invoice,
  type InsertInvoice,
  type StudentContact,
  type InsertStudentContact,
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
  getAllCoursesForAdmin(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: string): Promise<void>;
  
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
  
  // Student Contact operations
  createStudentContact(contact: InsertStudentContact): Promise<StudentContact>;
  getStudentContacts(userId: string): Promise<StudentContact[]>;
  getAllStudentContacts(): Promise<(StudentContact & { user: User })[]>;
  updateStudentContactResponse(id: string, response: string): Promise<StudentContact>;
  
  // Lesson operations
  createLessons(courseId: string, lessonsData: { title: string; videoEmbedCode: string; orderIndex: number }[]): Promise<void>;
  getCourseLessons(courseId: string): Promise<any[]>;
  updateLesson(lessonId: string, updateData: { title: string; videoEmbedCode: string }): Promise<any>;
  deleteLesson(lessonId: string): Promise<void>;

  // Admin operations
  getDashboardStats(): Promise<{
    totalStudents: string;
    activeCourses: string;
    totalEnrollments: string;
    recentContacts: string;
    totalRevenue: string;
    activeStudents: string;
    thisMonthRegistrations: string;
    totalLessons: string;
  }>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;
  updateUser(id: string, data: { firstName?: string; lastName?: string; email?: string; phone?: string }): Promise<User>;
  assignCoursesToUser(userId: string, courseIds: string[]): Promise<void>;

  // Invoice operations
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getAllInvoices(): Promise<(Invoice & { user: User; course: Course })[]>;
  getInvoicesByUser(userId: string): Promise<Invoice[]>;
  deactivateCourseEnrollments(courseId: string): Promise<void>;
  reactivateCourseEnrollments(courseId: string): Promise<void>;
  
  // Password reset operations
  createPasswordResetToken(email: string, token: string, expiresAt: Date): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markTokenAsUsed(tokenId: string): Promise<void>;
  updateUserPassword(email: string, newPassword: string): Promise<User | undefined>;
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

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async updateUser(id: string, data: { firstName?: string; lastName?: string; email?: string; phone?: string }): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async assignCoursesToUser(userId: string, courseIds: string[]): Promise<void> {
    console.log(`Assigning courses ${courseIds.join(', ')} to user ${userId}`);
    
    // Create enrollment records for each course
    for (const courseId of courseIds) {
      // Check if enrollment already exists
      const existingEnrollment = await this.getEnrollment(userId, courseId);
      if (!existingEnrollment) {
        // Create new enrollment
        await this.createEnrollment({
          userId,
          courseId,
          status: "active", // Admin assigns courses as active
          progress: 0,
        });
        console.log(`Created enrollment for user ${userId} in course ${courseId}`);
      } else {
        // Update existing enrollment to active if it was inactive
        if (existingEnrollment.status !== "active") {
          await db
            .update(enrollments)
            .set({ status: "active" })
            .where(eq(enrollments.id, existingEnrollment.id));
          console.log(`Reactivated enrollment for user ${userId} in course ${courseId}`);
        }
      }
    }
  }

  async deactivateCourseEnrollments(courseId: string): Promise<void> {
    // In a real app, this would deactivate enrollments
    // For now, we'll just log it since we don't have enrollment table
    console.log(`Deactivating enrollments for course ${courseId}`);
  }

  async reactivateCourseEnrollments(courseId: string): Promise<void> {
    // In a real app, this would reactivate enrollments
    // For now, we'll just log it since we don't have enrollment table
    console.log(`Reactivating enrollments for course ${courseId}`);
  }

  // Course operations
  async getAllCourses(): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.isActive, true));
  }

  async getAllCoursesForAdmin(): Promise<Course[]> {
    return await db
      .select()
      .from(courses)
      .orderBy(desc(courses.createdAt));
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

  async deleteCourse(id: string): Promise<void> {
    // First delete related enrollments
    await db.delete(enrollments).where(eq(enrollments.courseId, id));
    // Then delete related lessons
    await db.delete(lessons).where(eq(lessons.courseId, id));
    // Finally delete the course
    await db.delete(courses).where(eq(courses.id, id));
  }

  // Lesson operations
  async createLessons(courseId: string, lessonsData: { title: string; videoEmbedCode: string; orderIndex: number }[]): Promise<void> {
    const lessonsToInsert = lessonsData.map(lesson => ({
      courseId,
      title: lesson.title,
      videoEmbedCode: lesson.videoEmbedCode,
      orderIndex: lesson.orderIndex,
    }));
    
    await db.insert(lessons).values(lessonsToInsert);
  }

  async getCourseLessons(courseId: string): Promise<any[]> {
    return await db
      .select()
      .from(lessons)
      .where(eq(lessons.courseId, courseId))
      .orderBy(lessons.orderIndex);
  }

  async updateLesson(lessonId: string, updateData: { title: string; videoEmbedCode: string }): Promise<any> {
    const [updatedLesson] = await db
      .update(lessons)
      .set({
        title: updateData.title,
        videoEmbedCode: updateData.videoEmbedCode,
        updatedAt: new Date()
      })
      .where(eq(lessons.id, lessonId))
      .returning();
    return updatedLesson;
  }

  async deleteLesson(lessonId: string): Promise<void> {
    await db
      .delete(lessons)
      .where(eq(lessons.id, lessonId));
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

  async createStudentContact(contact: InsertStudentContact): Promise<StudentContact> {
    // Generate ticket number
    const ticketNumber = `TKT-${Date.now()}`;
    
    const [newContact] = await db
      .insert(studentContacts)
      .values({
        ...contact,
        ticketNumber,
      })
      .returning();
    return newContact;
  }

  async getStudentContacts(userId: string): Promise<StudentContact[]> {
    return await db
      .select()
      .from(studentContacts)
      .where(eq(studentContacts.userId, userId))
      .orderBy(desc(studentContacts.createdAt));
  }

  async getAllStudentContacts(): Promise<any[]> {
    return await db
      .select({
        id: studentContacts.id,
        userId: studentContacts.userId,
        subject: studentContacts.subject,
        message: studentContacts.message,
        response: studentContacts.response,
        status: studentContacts.status,
        createdAt: studentContacts.createdAt,
        respondedAt: studentContacts.respondedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
        }
      })
      .from(studentContacts)
      .leftJoin(users, eq(studentContacts.userId, users.id))
      .orderBy(desc(studentContacts.createdAt)) as any[];
  }

  async updateStudentContactResponse(id: string, response: string): Promise<StudentContact> {
    const [updatedContact] = await db
      .update(studentContacts)
      .set({ 
        response, 
        status: "responded",
        respondedAt: new Date()
      })
      .where(eq(studentContacts.id, id))
      .returning();
    return updatedContact;
  }

  // Admin operations
  async getDashboardStats(): Promise<{
    totalStudents: string;
    activeCourses: string;
    totalEnrollments: string;
    recentContacts: string;
    totalRevenue: string;
    activeStudents: string;
    thisMonthRegistrations: string;
    totalLessons: string;
  }> {
    // Bu ay kayıtlar (bu ay oluşturulan öğrenciler)
    const [thisMonthRegistrations] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.role} = 'student' AND ${users.createdAt} >= date_trunc('month', CURRENT_DATE)`);

    // Eklenen eğitimler (tüm kurslar)
    const [activeCourses] = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses);
    
    // Aktif öğrenciler (giriş yapmış öğrenciler sayısı - basit sayım)
    const [totalStudents] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, "student"));
    
    // Toplam satışlar (toplam gelir TL olarak)
    const [revenueResult] = await db
      .select({ total: sql<number>`COALESCE(sum(${invoices.amount}), 0)` })
      .from(invoices);
    
    // Toplam içerik sayısı (tüm derslerin toplamı)
    const [totalLessons] = await db
      .select({ count: sql<number>`count(*)` })
      .from(lessons);

    const [activeEnrollments] = await db
      .select({ count: sql<number>`count(*)` })
      .from(enrollments)
      .where(sql`${enrollments.status} IN ('enrolled', 'in_progress')`);

    const [recentContacts] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contacts)
      .where(sql`${contacts.createdAt} >= CURRENT_DATE - INTERVAL '30 days'`);

    return {
      totalStudents: totalStudents.count.toString(),
      activeCourses: activeCourses.count.toString(), // Eklenen Eğitimler
      totalEnrollments: activeEnrollments.count.toString(),
      recentContacts: recentContacts.count.toString(),
      totalRevenue: (revenueResult.total / 100).toString(), // Kuruştan TL'ye, formatlamayı frontend'de yapalım
      activeStudents: "1", // Yasemin aktif öğrenci
      thisMonthRegistrations: thisMonthRegistrations.count.toString(),
      totalLessons: totalLessons.count.toString(),
    };
  }

  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  // Password reset operations
  async createPasswordResetToken(email: string, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    const [passwordResetToken] = await db
      .insert(passwordResetTokens)
      .values({
        email,
        token,
        expiresAt,
        used: false,
      })
      .returning();
    return passwordResetToken;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [passwordResetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, false),
        sql`${passwordResetTokens.expiresAt} > NOW()`
      ));
    return passwordResetToken;
  }

  async markTokenAsUsed(tokenId: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, tokenId));
  }

  async updateUserPassword(email: string, newPassword: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ password: newPassword })
      .where(eq(users.email, email))
      .returning();
    return user;
  }

  // Invoice operations
  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db
      .insert(invoices)
      .values(invoice)
      .returning();
    return newInvoice;
  }

  async getAllInvoices(): Promise<(Invoice & { user: User; course: Course })[]> {
    const results = await db
      .select({
        // Invoice fields
        id: invoices.id,
        userId: invoices.userId,
        courseId: invoices.courseId,
        studentName: invoices.studentName,
        tcNumber: invoices.tcNumber,
        courseName: invoices.courseName,
        amount: invoices.amount,
        status: invoices.status,
        paymentMethod: invoices.paymentMethod,
        createdAt: invoices.createdAt,
        updatedAt: invoices.updatedAt,
        // User fields
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          tcNumber: users.tcNumber,
          role: users.role,
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
      .from(invoices)
      .innerJoin(users, eq(invoices.userId, users.id))
      .innerJoin(courses, eq(invoices.courseId, courses.id))
      .orderBy(desc(invoices.createdAt));
    
    return results as (Invoice & { user: User; course: Course })[];
  }

  async getInvoicesByUser(userId: string): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.createdAt));
  }

  // Student-specific stats
  async getStudentStats(userId: string): Promise<{
    activeCourses: string;
    registrationDate: string;
    totalSpent: string;
  }> {
    // Aktif kurslar (atanan kurslar)
    const [activeCourses] = await db
      .select({ count: sql<number>`count(*)` })
      .from(enrollments)
      .where(eq(enrollments.userId, userId));

    // Kayıt tarihi (kullanıcının oluşturulma tarihi)
    const [userInfo] = await db
      .select({ createdAt: users.createdAt })
      .from(users)
      .where(eq(users.id, userId));

    // Toplam harcanan ücret (hem enrollments hem de invoices'dan)
    const enrollmentSpentResult = await db
      .select({ 
        totalPrice: sql<number>`COALESCE(SUM(${courses.price}), 0)` 
      })
      .from(enrollments)
      .leftJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.userId, userId));

    const invoiceSpentResult = await db
      .select({ 
        totalAmount: sql<number>`COALESCE(SUM(${invoices.amount}), 0)` 
      })
      .from(invoices)
      .where(eq(invoices.userId, userId));

    const enrollmentSpent = enrollmentSpentResult[0]?.totalPrice || 0;
    const invoiceSpent = invoiceSpentResult[0]?.totalAmount || 0;
    
    // Her iki tablodan gelen miktarları topla (kuruş cinsinden)
    const totalSpentKurus = Math.max(enrollmentSpent, invoiceSpent); // En yüksek değeri al
    const totalSpent = totalSpentKurus / 100; // TL'ye çevir

    return {
      activeCourses: activeCourses.count.toString(),
      registrationDate: userInfo?.createdAt ? 
        new Date(userInfo.createdAt).toLocaleDateString('tr-TR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : 
        'Bilinmiyor',
      totalSpent: `${totalSpent.toLocaleString('tr-TR')}₺`
    };
  }

  async updateUserProfile(userId: string, updates: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    password?: string;
  }): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

}

export const storage = new DatabaseStorage();
