# Cakelandia - Next.js E-commerce Platform

Cakelandia is a modern e-commerce platform for a pastry shop, built with Next.js, React, and TypeScript. The application features a responsive design with a purple-themed UI consistent with the brand identity.

## Features

- Responsive product catalog with grid and list views
- Category filtering and product search
- Shopping cart functionality using React Context API
- Checkout process with order confirmation
- Order tracking system
- Admin dashboard for order management
- WhatsApp integration for order notifications

## Tech Stack

- Next.js for server-side rendering and routing
- React for UI components
- TypeScript for type safety
- CSS Modules for component styling
- Context API for state management

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/pages` - Next.js pages and API routes
- `/components` - Reusable React components
- `/styles` - CSS modules and global styles
- `/public` - Static assets like images
- `/types` - TypeScript type definitions
- `/utils` - Utility functions and helpers
- `/context` - React Context providers

## Recent Fixes

- Resolved React key warnings across all components
- Fixed hydration mismatches between server and client rendering
- Improved Next.js Link component usage
