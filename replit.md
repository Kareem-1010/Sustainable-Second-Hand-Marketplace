# EcoFinds - Sustainable Second-Hand Marketplace

## Overview
EcoFinds is a full-stack sustainable marketplace application designed for the Odoo x NMIT Hackathon 2025. The platform enables users to buy and sell second-hand items, promoting sustainability and waste reduction through a complete e-commerce experience. The application features user authentication, product management, shopping cart functionality, order processing, and sustainability tracking with CO2 impact metrics.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with Vite for fast development and hot module replacement
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, modern UI components
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: Redux Toolkit for global state management (cart, user data)
- **Data Fetching**: TanStack React Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation
- **TypeScript**: Full TypeScript implementation for type safety across the application

### Backend Architecture
- **Runtime**: Node.js with Express.js for the REST API server
- **Authentication**: Passport.js with local strategy using session-based auth
- **Password Security**: bcrypt for password hashing with salt
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful endpoints following conventional HTTP methods and status codes

### Database Architecture
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Design**: 
  - Users table with profile information and authentication data
  - Products table with comprehensive metadata (category, condition, sustainability flags)
  - Cart items for managing user shopping carts
  - Orders and order items for purchase history
  - Reviews system for product feedback
- **Data Relationships**: Foreign key constraints ensuring referential integrity
- **Enums**: Predefined categories, conditions, and order statuses for data consistency

### State Management Strategy
- **Client State**: Redux Toolkit slices for cart management and user session state
- **Server State**: React Query for API data caching, background updates, and optimistic updates
- **Form State**: React Hook Form for local form state with validation

### Security Architecture
- **Authentication**: Session-based authentication with secure cookie storage
- **Password Security**: Scrypt-based password hashing with random salt generation
- **Input Validation**: Zod schemas for both client and server-side validation
- **CORS**: Configured for secure cross-origin requests in development

### UI/UX Design System
- **Component Library**: Radix UI primitives with custom styling via Tailwind
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Accessibility**: Built-in ARIA support through Radix UI components
- **Theme System**: CSS custom properties for consistent color palette and spacing

## External Dependencies

### Core Runtime Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection for serverless environments
- **drizzle-orm**: Type-safe ORM for database operations and migrations
- **passport**: Authentication middleware with local strategy support
- **bcrypt**: Cryptographic password hashing library

### Frontend Libraries
- **@tanstack/react-query**: Server state management and data synchronization
- **@reduxjs/toolkit**: Predictable state container for application state
- **wouter**: Minimalist routing library for React applications
- **react-hook-form**: Performant forms library with minimal re-renders
- **@hookform/resolvers**: Integration between React Hook Form and validation libraries

### UI Component Dependencies
- **@radix-ui/react-***: Headless UI primitives for accessible component building
- **tailwindcss**: Utility-first CSS framework for rapid UI development
- **class-variance-authority**: Utility for creating variant-based component APIs
- **clsx**: Utility for conditionally joining CSS class names

### Validation and Type Safety
- **zod**: TypeScript-first schema validation library
- **drizzle-zod**: Integration between Drizzle ORM and Zod for schema validation

### Development and Build Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking and enhanced developer experience
- **tsx**: TypeScript execution environment for Node.js
- **esbuild**: Fast JavaScript bundler for production builds

### Session and Storage
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **express-session**: Session middleware for Express applications