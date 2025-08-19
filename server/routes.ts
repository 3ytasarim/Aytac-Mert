import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertContactSchema, insertEnrollmentSchema, registrationSchema } from "@shared/schema";
import { sendWelcomeEmail } from "./emailService";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes for Replit Auth (not used in custom auth)
  app.get('/api/auth/user', (req, res) => {
    // Check custom session first
    try {
      const sessionUser = (req.session as any).user;
      
      if (sessionUser) {
        return res.json(sessionUser);
      }
      
      // Fallback to Replit Auth if available
      if (req.user && (req.user as any).claims) {
        const userId = (req.user as any).claims.sub;
        storage.getUser(userId).then(user => {
          if (user) {
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
        
        // Store user in session
        (req.session as any).user = adminUser;
        
        // Also login via passport for consistency
        req.login(adminUser, (err) => {
          if (err) {
            console.error("Passport login error:", err);
          }
        });
        
        // Ensure session is saved
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
          }
          
          console.log('Admin logged in, session saved');
          res.json({ 
            message: "Giriş başarılı", 
            user: adminUser
          });
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
      (req.session as any).user = user;
      
      res.json({ 
        message: "Giriş başarılı", 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          role: user.role
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
      const userId = req.user.claims.sub;
      const enrollments = await storage.getUserEnrollments(userId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
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
      const newCourse = await storage.createCourse({
        title: courseData.title,
        description: courseData.description,
        price: courseData.price,
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
      const updateData = req.body;
      
      const updatedCourse = await storage.updateCourse(id, updateData);
      res.json(updatedCourse);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Failed to update course" });
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
      const uploadURL = await objectStorageService.getImageUploadURL();
      const imageId = uploadURL.split('/').pop()?.split('?')[0] || '';
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

  const httpServer = createServer(app);
  return httpServer;
}
