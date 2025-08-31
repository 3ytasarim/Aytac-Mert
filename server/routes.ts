import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertInvoiceSchema } from "@shared/schema";
import { 
  insertContactSchema, 
  insertEnrollmentSchema, 
  registrationSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  insertStudentContactSchema
} from "@shared/schema";
import { sendWelcomeEmail, sendPasswordResetEmail } from "./emailService";
import { z } from "zod";
import { randomBytes } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes for Replit Auth (not used in custom auth)
  app.get('/api/auth/user', (req, res) => {
    // Check custom session first
    try {
      const sessionUser = (req.session as any).user;
      const hasSessionUser = sessionUser ? true : false;
      const userId = sessionUser?.id;
      const userRole = sessionUser?.role;
      
      console.log('Auth check:', { 
        isAuth: req.isAuthenticated ? req.isAuthenticated() : false,
        hasUser: req.user ? true : false,
        hasSessionUser,
        userId,
        userRole,
        expires_at: (req.user as any)?.expires_at,
        now: Math.floor(Date.now() / 1000)
      });
      
      if (sessionUser) {
        console.log(`${sessionUser.role === 'admin' ? 'Admin' : 'User'} user authenticated via session`);
        return res.json(sessionUser);
      }
      
      // Fallback to Replit Auth if available
      if (req.user && (req.user as any).claims) {
        const userId = (req.user as any).claims.sub;
        storage.getUser(userId).then(user => {
          if (user) {
            console.log('User authenticated via Replit Auth');
            res.json(user);
          } else {
            res.status(401).json({ message: "Unauthorized" });
          }
        }).catch(() => {
          res.status(401).json({ message: "Unauthorized" });
        });
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  // Public routes
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      res.json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      } else {
        console.error("Error creating contact:", error);
        res.status(500).json({ message: "Failed to create contact" });
      }
    }
  });

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email ve şifre gereklidir" });
      }

      // Check for admin user
      if (email === "info@aytacmert.com" && password === "Administrator") {
        // Create admin session
        const adminUser = {
          id: "admin-user-id",
          email: "info@aytacmert.com",
          firstName: "Admin",
          lastName: "User",
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
          profileImageUrl: null
        };
        
        // Store user in session - simpler approach
        (req.session as any).userId = adminUser.id;
        (req.session as any).userEmail = adminUser.email;
        (req.session as any).userRole = adminUser.role;
        (req.session as any).user = adminUser;
        
        console.log('Admin session being set:', { 
          userId: adminUser.id, 
          userRole: adminUser.role,
          sessionId: req.sessionID 
        });
        
        // Immediately respond with user data
        res.json({ 
          message: "Giriş başarılı", 
          user: adminUser
        });
        return;
      }

      // Check registered users
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Email veya şifre hatalı" });
      }

      // Simple password check (in real app, use bcrypt)
      if (user.password !== password) {
        return res.status(401).json({ message: "Email veya şifre hatalı" });
      }

      // Store user in session
      (req.session as any).userId = user.id;
      (req.session as any).userEmail = user.email;
      (req.session as any).userRole = user.role || 'student';
      (req.session as any).user = { ...user, role: user.role || 'student' };
      
      res.json({ 
        message: "Giriş başarılı", 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          role: user.role || 'student'
        }
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Giriş işlemi başarısız" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    try {
      (req.session as any).user = null;
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({ message: "Çıkış işlemi başarısız" });
        }
        res.json({ message: "Çıkış başarılı" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Çıkış işlemi başarısız" });
    }
  });

  // Password reset routes
  app.post("/api/request-password-reset", async (req, res) => {
    try {
      const { email } = requestPasswordResetSchema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({ message: "Şifre sıfırlama e-postası gönderildi (eğer hesap mevcutsa)" });
      }

      // Generate reset token
      const resetToken = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Save token to database
      await storage.createPasswordResetToken(email, resetToken, expiresAt);

      // Send reset email
      const emailSent = await sendPasswordResetEmail(email, resetToken);
      
      if (emailSent) {
        res.json({ message: "Şifre sıfırlama e-postası gönderildi" });
      } else {
        res.status(500).json({ message: "E-posta gönderilirken hata oluştu" });
      }
    } catch (error) {
      console.error("Password reset request error:", error);
      res.status(500).json({ message: "Şifre sıfırlama talebinde hata oluştu" });
    }
  });

  app.post("/api/reset-password", async (req, res) => {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      
      // Verify token
      const passwordResetToken = await storage.getPasswordResetToken(token);
      if (!passwordResetToken) {
        return res.status(400).json({ message: "Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı" });
      }

      // Update user password
      const updatedUser = await storage.updateUserPassword(passwordResetToken.email, password);
      if (!updatedUser) {
        return res.status(400).json({ message: "Kullanıcı bulunamadı" });
      }

      // Mark token as used
      await storage.markTokenAsUsed(passwordResetToken.id);

      res.json({ message: "Şifre başarıyla değiştirildi" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Şifre sıfırlama sırasında hata oluştu" });
    }
  });

  // Admin-only routes
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser || sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin yetkisi gerekli" });
      }
      
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "İstatistik verileri alınamadı" });
    }
  });

  app.get("/api/admin/contacts", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser || sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin yetkisi gerekli" });
      }
      
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "İletişim mesajları alınamadı" });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser || sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin yetkisi gerekli" });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Kullanıcı listesi alınamadı" });
    }
  });

  app.patch("/api/admin/contacts/:id", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser || sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin yetkisi gerekli" });
      }
      
      const { id } = req.params;
      const { status } = req.body;
      
      const updatedContact = await storage.updateContactStatus(id, status);
      res.json(updatedContact);
    } catch (error) {
      console.error("Error updating contact:", error);
      res.status(500).json({ message: "İletişim durumu güncellenemedi" });
    }
  });

  // Registration endpoint
  app.post("/api/register", async (req, res) => {
    try {
      const registrationData = registrationSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(registrationData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Bu email adresi zaten kayıtlı" });
      }

      // Create user
      const newUser = await storage.createRegisteredUser({
        firstName: registrationData.firstName,
        email: registrationData.email,
        phone: registrationData.phone,
        tcNumber: registrationData.tcNumber,
        password: registrationData.password,
        role: "student"
      });

      // Send welcome email
      try {
        await sendWelcomeEmail({
          firstName: registrationData.firstName,
          email: registrationData.email,
          password: registrationData.password
        });
        console.log("Welcome email sent successfully");
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Don't fail registration if email fails
      }

      res.json({ 
        message: "Kayıt başarılı", 
        user: { 
          id: newUser.id, 
          email: newUser.email, 
          firstName: newUser.firstName 
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Geçersiz kayıt bilgileri", errors: error.errors });
      } else {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Kayıt işlemi başarısız" });
      }
    }
  });

  // Student stats endpoint
  app.get("/api/student/stats", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Giriş yapmanız gerekli" });
      }
      
      const stats = await storage.getStudentStats(sessionUser.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching student stats:", error);
      res.status(500).json({ message: "İstatistikler alınamadı" });
    }
  });

  // Student contacts endpoint
  app.get("/api/student/contacts", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Giriş yapmanız gerekli" });
      }
      
      const contacts = await storage.getStudentContacts(sessionUser.id);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching student contacts:", error);
      res.status(500).json({ message: "Mesajlar alınamadı" });
    }
  });

  // Student contact creation
  app.post("/api/student/contacts", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Giriş yapmanız gerekli" });
      }
      
      const contactData = {
        ...req.body,
        userId: sessionUser.id
      };
      
      const contact = await storage.createStudentContact(contactData);
      res.json(contact);
    } catch (error) {
      console.error("Error creating student contact:", error);
      res.status(500).json({ message: "Mesaj gönderilemedi" });
    }
  });

  // Profile update endpoint
  app.put("/api/profile/update", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Giriş yapmanız gerekli" });
      }

      const { firstName, lastName, phone, currentPassword, newPassword } = req.body;

      // If password change requested, verify current password
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ message: "Mevcut şifre gerekli" });
        }

        const user = await storage.getUser(sessionUser.id);
        if (!user || user.password !== currentPassword) {
          return res.status(400).json({ message: "Mevcut şifre hatalı" });
        }
      }

      // Update user profile
      const updatedUser = await storage.updateUserProfile(sessionUser.id, {
        firstName,
        lastName,
        phone,
        ...(newPassword && { password: newPassword })
      });

      // Update session with new user data
      (req.session as any).user = {
        ...sessionUser,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone
      };

      res.json({ 
        message: "Profil güncellendi",
        user: updatedUser
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Profil güncellenemedi" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/admin/contacts", async (req, res) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  // Admin student contact routes
  app.get("/api/admin/student-contacts", async (req: any, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      
      console.log("Admin student contacts request:", { sessionUser, hasSession: !!req.session });
      
      if (!sessionUser || sessionUser.role !== 'admin') {
        console.log("Access denied:", { sessionUser, role: sessionUser?.role });
        return res.status(403).json({ message: "Admin access required" });
      }

      const contacts = await storage.getAllStudentContacts();
      console.log("Student contacts found:", contacts.length);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching student contacts:", error);
      res.status(500).json({ message: "Failed to fetch student contacts" });
    }
  });

  app.patch("/api/admin/student-contacts/:id/respond", async (req: any, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      
      if (!sessionUser || sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { response } = req.body;
      
      if (!response || response.trim() === '') {
        return res.status(400).json({ message: "Response cannot be empty" });
      }

      const updatedContact = await storage.updateStudentContactResponse(id, response);
      res.json(updatedContact);
    } catch (error) {
      console.error("Error responding to student contact:", error);
      res.status(500).json({ message: "Failed to send response" });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Protected student routes
  app.get("/api/enrollments", isAuthenticated, async (req: any, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      const userId = sessionUser?.id || req.user?.claims?.sub;
      const enrollments = await storage.getUserEnrollments(userId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  // Get course lessons for students
  app.get("/api/courses/:id/lessons", isAuthenticated, async (req: any, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      const userId = sessionUser?.id || req.user?.claims?.sub;
      
      const { id } = req.params;
      
      // Check if student is enrolled in this course
      const enrollments = await storage.getUserEnrollments(userId);
      const isEnrolled = enrollments.some(enrollment => enrollment.course.id === id);
      
      if (!isEnrolled) {
        return res.status(403).json({ message: "Not enrolled in this course" });
      }
      
      const lessons = await storage.getCourseLessons(id);
      res.json(lessons);
    } catch (error) {
      console.error("Error fetching course lessons:", error);
      res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });

  // Get student enrollment for specific course
  app.get("/api/student/enrollments/:courseId", isAuthenticated, async (req: any, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      const userId = sessionUser?.id || req.user?.claims?.sub;
      const { courseId } = req.params;
      
      const enrollments = await storage.getUserEnrollments(userId);
      const enrollment = enrollments.find(e => e.course.id === courseId);
      
      if (!enrollment) {
        return res.status(404).json({ message: "Not enrolled in this course" });
      }
      
      res.json(enrollment);
    } catch (error) {
      console.error("Error fetching enrollment:", error);
      res.status(500).json({ message: "Failed to fetch enrollment" });
    }
  });

  // Student contact routes
  app.post("/api/student/contact", isAuthenticated, async (req: any, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      const userId = sessionUser?.id || req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const contactData = insertStudentContactSchema.parse(req.body);
      const newContact = await storage.createStudentContact({
        ...contactData,
        userId
      });
      
      res.json(newContact);
    } catch (error) {
      console.error("Error creating student contact:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/student/contacts", isAuthenticated, async (req: any, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      const userId = sessionUser?.id || req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const contacts = await storage.getStudentContacts(userId);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching student contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.post("/api/enroll", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { courseId } = req.body;

      // Check if already enrolled
      const existingEnrollment = await storage.getEnrollment(userId, courseId);
      if (existingEnrollment) {
        return res.status(400).json({ message: "Already enrolled in this course" });
      }

      const enrollmentData = {
        userId,
        courseId,
        status: "pending" as const,
      };

      const enrollment = await storage.createEnrollment(enrollmentData);
      res.json(enrollment);
    } catch (error) {
      console.error("Error creating enrollment:", error);
      res.status(500).json({ message: "Failed to enroll in course" });
    }
  });

  // Protected admin routes
  app.get("/api/admin/stats", isAuthenticated, async (req: any, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      const userId = sessionUser?.id || req.user?.claims?.sub;
      
      // Check for session-based admin
      if (sessionUser && sessionUser.role === 'admin') {
        // Continue
      } else {
        // Check for Replit auth admin
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
      }

      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/enrollments", isAuthenticated, async (req: any, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      const userId = sessionUser?.id || req.user?.claims?.sub;
      
      if (sessionUser && sessionUser.role === 'admin') {
        // Continue
      } else {
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
      }

      const enrollments = await storage.getAllEnrollments();
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching all enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.get("/api/admin/contacts", isAuthenticated, async (req: any, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      const userId = sessionUser?.id || req.user?.claims?.sub;
      
      if (sessionUser && sessionUser.role === 'admin') {
        // Continue
      } else {
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
      }

      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  // Students management endpoint
  app.post("/api/admin/students", isAuthenticated, async (req: any, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      const userId = sessionUser?.id || req.user?.claims?.sub;
      
      if (sessionUser && sessionUser.role === 'admin') {
        // Continue
      } else {
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
      }

      const { firstName, lastName, email, phone, tcNumber, status } = req.body;
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Bu email adresi zaten kayıtlı" });
      }

      const newStudent = await storage.createRegisteredUser({
        firstName,
        email,
        phone,
        tcNumber,
        password: "student123", // Default password
        role: 'student',
      });
      
      res.json(newStudent);
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(500).json({ message: "Öğrenci oluşturulurken hata oluştu" });
    }
  });

  // Delete student endpoint
  app.delete("/api/admin/users/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      const userId = sessionUser?.id || req.user?.claims?.sub;
      
      if (sessionUser && sessionUser.role === 'admin') {
        // Continue
      } else {
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
      }

      const { userId: targetUserId } = req.params;
      
      // Get user to check if it's admin
      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
      
      if (targetUser.role === 'admin') {
        return res.status(403).json({ message: "Admin kullanıcı silinemez" });
      }

      await storage.deleteUser(targetUserId);
      res.json({ message: "Kullanıcı başarıyla silindi" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Kullanıcı silinirken hata oluştu" });
    }
  });

  // Update user endpoint
  app.patch("/api/admin/users/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      const userId = sessionUser?.id || req.user?.claims?.sub;
      
      if (sessionUser && sessionUser.role === 'admin') {
        // Continue
      } else {
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
      }

      const { userId: targetUserId } = req.params;
      const { firstName, lastName, email, phone } = req.body;
      
      const updatedUser = await storage.updateUser(targetUserId, {
        firstName,
        lastName,
        email,
        phone
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Kullanıcı güncellenirken hata oluştu" });
    }
  });

  // Assign courses to user endpoint
  app.post("/api/admin/users/:userId/courses", isAuthenticated, async (req: any, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      const userId = sessionUser?.id || req.user?.claims?.sub;
      
      if (sessionUser && sessionUser.role === 'admin') {
        // Continue
      } else {
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
      }

      const { userId: targetUserId } = req.params;
      const { courseIds } = req.body;
      
      await storage.assignCoursesToUser(targetUserId, courseIds);
      
      res.json({ message: "Dersler başarıyla atandı" });
    } catch (error) {
      console.error("Error assigning courses:", error);
      res.status(500).json({ message: "Dersler atanırken hata oluştu" });
    }
  });

  // Admin course routes
  app.get("/api/admin/courses", isAuthenticated, async (req: any, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      const userId = sessionUser?.id || req.user?.claims?.sub;
      
      if (sessionUser && sessionUser.role === 'admin') {
        // Continue
      } else {
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
      }

      const courses = await storage.getAllCoursesForAdmin();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching admin courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.post("/api/admin/courses", isAuthenticated, async (req: any, res) => {
    try {
      // Get user ID from either session or Replit auth
      const sessionUser = (req.session as any)?.user;
      const userId = sessionUser?.id || req.user?.claims?.sub;
      
      console.log('Creating course, userId:', userId, 'sessionUser:', !!sessionUser);
      
      // Check for session-based admin
      if (sessionUser && sessionUser.role === 'admin') {
        console.log('Admin user authorized via session');
      } else {
        // Check for Replit auth admin
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
      }

      const courseData = req.body;
      // Convert price to integer (TL cinsinden)
      const priceInTL = Math.round(parseFloat(courseData.price));
      
      const newCourse = await storage.createCourse({
        title: courseData.title,
        description: courseData.description,
        price: priceInTL,
        imageUrl: courseData.imageUrl || null,
        isActive: true,
      });

      console.log('Course created successfully:', newCourse.id);
      res.json(newCourse);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.patch("/api/admin/courses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      const userId = sessionUser?.id || req.user?.claims?.sub;
      
      if (sessionUser && sessionUser.role === 'admin') {
        // Continue
      } else {
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
      }

      const { id } = req.params;
      const updateData = { ...req.body };
      
      // Convert price to integer if it exists (TL cinsinden)
      if (updateData.price !== undefined) {
        updateData.price = Math.round(parseFloat(updateData.price));
      }
      
      const updatedCourse = await storage.updateCourse(id, updateData);
      
      // Handle enrollment status changes
      if (updateData.hasOwnProperty('isActive')) {
        if (!updateData.isActive) {
          await storage.deactivateCourseEnrollments(id);
        } else {
          await storage.reactivateCourseEnrollments(id);
        }
      }
      
      res.json(updatedCourse);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  app.delete("/api/admin/courses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      const userId = sessionUser?.id || req.user?.claims?.sub;
      
      if (sessionUser && sessionUser.role === 'admin') {
        // Continue
      } else {
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
      }

      const { id } = req.params;
      
      await storage.deleteCourse(id);
      res.json({ message: "Course deleted successfully" });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // Video serving endpoint
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const { ObjectStorageService, ObjectNotFoundError } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      await objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving video:", error);
      if (error.name === 'ObjectNotFoundError') {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Video upload for lessons
  app.post("/api/admin/lessons/upload", isAuthenticated, async (req: any, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      const userId = sessionUser?.id || req.user?.claims?.sub;
      
      if (sessionUser && sessionUser.role === 'admin') {
        // Continue
      } else {
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
      }

      // Generate presigned URL for video upload
      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ message: "Failed to generate upload URL" });
    }
  });

  // Admin lesson management routes
  app.post("/api/admin/lessons", isAuthenticated, async (req: any, res) => {
    try {
      // Get user ID from either session or Replit auth
      const sessionUser = (req.session as any)?.user;
      const userId = sessionUser?.id || req.user?.claims?.sub;
      
      console.log('Creating lessons, userId:', userId, 'sessionUser:', !!sessionUser);
      
      // Check for session-based admin
      if (sessionUser && sessionUser.role === 'admin') {
        console.log('Admin user authorized via session for lessons');
      } else {
        // Check for Replit auth admin
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
      }

      const { courseId, lessons } = req.body;
      await storage.createLessons(courseId, lessons);
      console.log('Lessons created successfully for course:', courseId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error creating lessons:", error);
      res.status(500).json({ message: "Failed to create lessons" });
    }
  });

  app.get("/api/admin/courses/:id/lessons", isAuthenticated, async (req: any, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      const userId = sessionUser?.id || req.user?.claims?.sub;
      
      if (sessionUser && sessionUser.role === 'admin') {
        // Continue
      } else {
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
      }

      const { id } = req.params;
      const lessons = await storage.getCourseLessons(id);
      res.json(lessons);
    } catch (error) {
      console.error("Error fetching course lessons:", error);
      res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });

  app.patch("/api/admin/lessons/:id", isAuthenticated, async (req: any, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      const userId = sessionUser?.id || req.user?.claims?.sub;
      
      if (sessionUser && sessionUser.role === 'admin') {
        // Continue
      } else {
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
      }

      const { id } = req.params;
      const { title, videoEmbedCode } = req.body;
      
      const updatedLesson = await storage.updateLesson(id, { title, videoEmbedCode });
      res.json(updatedLesson);
    } catch (error) {
      console.error("Error updating lesson:", error);
      res.status(500).json({ message: "Failed to update lesson" });
    }
  });

  app.delete("/api/admin/lessons/:id", isAuthenticated, async (req: any, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      const userId = sessionUser?.id || req.user?.claims?.sub;
      
      if (sessionUser && sessionUser.role === 'admin') {
        // Continue
      } else {
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
      }

      const { id } = req.params;
      await storage.deleteLesson(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting lesson:", error);
      res.status(500).json({ message: "Failed to delete lesson" });
    }
  });

  // Image upload routes
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const { ObjectStorageService } = await import("./objectStorage");
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/images/upload-url", isAuthenticated, async (req: any, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      const userId = sessionUser?.id || req.user?.claims?.sub;
      
      if (sessionUser && sessionUser.role === 'admin') {
        // Continue
      } else {
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
      }

      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      const { uploadURL, imageId } = await objectStorageService.getImageUploadURL();
      res.json({ uploadURL, imageId });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ message: "Failed to generate upload URL" });
    }
  });

  app.patch("/api/admin/contacts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      const userId = sessionUser?.id || req.user?.claims?.sub;
      
      if (sessionUser && sessionUser.role === 'admin') {
        // Continue
      } else {
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
      }

      const { id } = req.params;
      const { status } = req.body;

      const contact = await storage.updateContactStatus(id, status);
      res.json(contact);
    } catch (error) {
      console.error("Error updating contact status:", error);
      res.status(500).json({ message: "Failed to update contact status" });
    }
  });

  // Seed default courses if they don't exist
  app.post("/api/admin/seed", isAuthenticated, async (req: any, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      const userId = sessionUser?.id || req.user?.claims?.sub;
      
      if (sessionUser && sessionUser.role === 'admin') {
        // Continue
      } else {
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
      }

      const existingCourses = await storage.getAllCourses();
      if (existingCourses.length === 0) {
        const defaultCourses = [
          {
            title: "İtaat Eğitimi",
            description: "Köpeğinizin temel komutları öğrenmesi ve günlük yaşamda itaatkâr davranması için kapsamlı eğitim programı.",
            price: 2500000, // 25.000₺ in kuruş
            imageUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400"
          },
          {
            title: "Göz Temaslı Eğitim",
            description: "Köpeğinizle güçlü bağ kurmanız ve etkili iletişim sağlamanız için özel göz teması teknikleri.",
            price: 2500000, // 25.000₺ in kuruş
            imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400"
          }
        ];

        for (const courseData of defaultCourses) {
          await storage.createCourse(courseData);
        }
      }

      res.json({ message: "Courses seeded successfully" });
    } catch (error) {
      console.error("Error seeding courses:", error);
      res.status(500).json({ message: "Failed to seed courses" });
    }
  });

  // Invoice endpoints
  app.post("/api/invoices", async (req, res) => {
    try {
      // Check if user is logged in
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const invoiceData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice({
        ...invoiceData,
        userId: sessionUser.id,
      });
      
      res.json({ 
        message: "Fatura başarıyla oluşturuldu", 
        invoice 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      } else {
        console.error("Error creating invoice:", error);
        res.status(500).json({ message: "Failed to create invoice" });
      }
    }
  });

  app.get("/api/admin/invoices", async (req, res) => {
    try {
      // Check if user is admin
      const sessionUser = (req.session as any).user;
      if (!sessionUser || sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const invoices = await storage.getAllInvoices();
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Check if user is logged in and either admin or accessing their own invoices
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      if (sessionUser.role !== 'admin' && sessionUser.id !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const invoices = await storage.getInvoicesByUser(userId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching user invoices:", error);
      res.status(500).json({ message: "Failed to fetch user invoices" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
