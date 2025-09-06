npm install --save-dev cross-env# EcoFinds - Sustainable Second-Hand Marketplace

A full-stack sustainable marketplace application built for the Odoo x NMIT Hackathon 2025. EcoFinds enables users to buy and sell second-hand items, promoting sustainability and reducing waste.

## 🌱 Features

### Core Functionality
- **User Authentication**: Secure signup/login with JWT and bcrypt
- **Product Management**: Full CRUD operations for product listings
- **Product Discovery**: Browse, search, and filter products by category
- **Shopping Cart**: Add/remove items with quantity management
- **Order Management**: Complete purchase flow and order history
- **User Dashboard**: Profile management and activity tracking
- **Reviews & Ratings**: Rate and review purchased items

### Sustainability Focus
- **CO2 Impact Tracking**: Shows environmental savings for each purchase
- **Eco-Friendly Badges**: Highlight sustainable products
- **Second-Hand First**: Promotes reuse and waste reduction
- **Sustainability Metrics**: Track your environmental impact

### Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: State management with Redux Toolkit
- **Type Safety**: Full TypeScript implementation
- **Modern Architecture**: Clean separation of concerns
- **Database Integrity**: PostgreSQL with Prisma ORM

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eco-finds
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials and configuration.

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 🏗️ Project Structure

