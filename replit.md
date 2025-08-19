# Overview

This is a full-stack web application for a dog training academy (Aytaç Mert Köpek Eğitimi Akademisi) built with modern web technologies. The application serves as a learning management system where students can enroll in courses, track their progress, and administrators can manage courses, enrollments, and contact requests. The system features role-based access control, course management, custom login/registration system with popup modals, automatic email notifications, and a responsive design optimized for both desktop and mobile devices.

## Recent Changes (August 19, 2025)

- Implemented complete user authentication system with popup modals for login and registration
- Added custom login system with info@aytacmert.com / Administrator admin credentials
- Created student and admin dashboards with role-based routing
- Integrated email service using info@aytacmert.com SMTP for welcome emails
- Added comprehensive privacy policy modal with KVKK compliance
- Set up admin dashboard with user management, contact handling, and statistics

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built with React 18 using TypeScript and Vite as the build tool. The application uses a component-based architecture with shadcn/ui components for consistent design and Tailwind CSS for styling. State management is handled through TanStack Query for server state and React hooks for local state. The routing system uses Wouter for lightweight client-side navigation. The application implements role-based rendering, showing different dashboards for students and administrators.

## Backend Architecture
The server runs on Express.js with TypeScript, following a RESTful API design pattern. The application uses a modular structure with separate route handlers, storage interfaces, and authentication middleware. The backend implements session-based authentication integrated with Replit Auth for secure user management. API routes are organized by functionality (public routes, protected student routes, admin routes) with appropriate middleware for authorization.

## Database Design
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema includes core entities: users (with role-based access), courses, enrollments (linking users to courses with progress tracking), contacts (for customer inquiries), and sessions (for authentication). Database relationships are properly defined with foreign keys and indexes for optimal performance.

## Authentication & Authorization
Authentication is handled through Replit's OpenID Connect integration with session-based storage using PostgreSQL. The system implements role-based access control with two primary roles: students and administrators. Session management uses connect-pg-simple for PostgreSQL session storage with configurable TTL. Protected routes verify authentication status and role permissions before allowing access.

## UI/UX Design System
The frontend uses shadcn/ui components built on Radix UI primitives for accessibility and consistent behavior. Styling is managed through Tailwind CSS with a custom design system including CSS variables for theming. The application is fully responsive with mobile-first design principles and includes comprehensive form validation using react-hook-form with Zod schemas.

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database hosting with connection pooling and WebSocket support for real-time capabilities.

## Authentication Services
- **Replit Auth**: OpenID Connect authentication provider integrated with Replit's platform for seamless user management and session handling.

## Frontend Libraries
- **TanStack Query**: Server state management and caching for efficient API data fetching and synchronization.
- **Radix UI**: Headless component primitives providing accessible and customizable UI building blocks.
- **shadcn/ui**: Pre-built component library built on Radix UI for rapid development with consistent design patterns.

## Development Tools
- **Vite**: Fast build tool and development server with hot module replacement and optimized production builds.
- **Drizzle ORM**: Type-safe database ORM with migration support and PostgreSQL dialect compatibility.
- **Tailwind CSS**: Utility-first CSS framework for rapid styling and responsive design implementation.

## Payment Processing
The application implements a manual payment system using bank transfer (IBAN) with WhatsApp integration for payment confirmation rather than automated payment gateways.