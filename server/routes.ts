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

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
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
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
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
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.patch("/api/admin/contacts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
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
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
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
