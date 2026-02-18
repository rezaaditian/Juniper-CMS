# Juniper Proposals - Proposal Management Services

A comprehensive proposal management website built with Next.js, featuring a complete admin dashboard for content management.

## Features

- **Modern Landing Page** - Professional proposal management services showcase
- **Blog System** - Content management with categories and featured images
- **Admin Dashboard** - Complete CRUD operations for all content
- **Authentication** - Secure JWT-based admin authentication
- **Image Management** - Upload and organize images with gallery view
- **Backup System** - Database backup and restore functionality
- **Responsive Design** - Mobile-first design with Tailwind CSS

## Quick Start

1. **Clone and Install**
   \`\`\`bash
   git clone <repository-url>
   cd juniper-proposals
   npm install
   \`\`\`

2. **Setup Environment**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

3. **Initialize System**
   \`\`\`bash
   npm run setup
   \`\`\`

4. **Start Development**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Access Admin Panel**
   - Visit: http://localhost:3000/admin
   - Default credentials: `admin` / `admin123`

## Environment Variables

Required environment variables (see `.env.example`):

- `SESSION_SECRET` - JWT signing secret (minimum 32 characters)
- `ADMIN_DEFAULT_PASSWORD` - Default admin password
- `NODE_ENV` - Environment setting
- `NEXT_PUBLIC_BASE_URL` - Base URL for API calls (optional)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run setup` - Initialize system (run once)
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
- `npm run backup` - Create database backup

## Admin Features

- **Dashboard** - System overview and quick actions
- **Posts** - Blog post management with rich editor
- **Services** - Service offerings management
- **Testimonials** - Client testimonial management
- **Categories** - Content categorization
- **Images** - File upload and management
- **Backups** - Database backup and restore
- **Settings** - Site configuration

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: SQLite with better-sqlite3
- **Authentication**: JWT with jose
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **File Upload**: Built-in upload system
- **Validation**: Zod schemas

## Security Features

- JWT-based authentication with HTTP-only cookies
- Rate limiting on login attempts
- CSRF protection
- Input validation and sanitization
- Secure file upload handling
- Environment-based configuration

## Deployment

The application is ready for deployment on Vercel or any Node.js hosting platform. Make sure to:

1. Set environment variables in your hosting platform
2. Run `npm run setup` after deployment
3. Configure your domain in `NEXT_PUBLIC_BASE_URL`

## Support

For issues or questions, please check the admin dashboard system status or create a backup before making changes.
