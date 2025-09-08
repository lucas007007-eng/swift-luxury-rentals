# BerlinLuxerentals.de

A modern, responsive rental property website built with Next.js, TypeScript, and Tailwind CSS. This is a complete clone and rebrand of the Artin Properties website, customized for the Berlin luxury rental market.

## 🌟 Features

- **Modern Design**: Beautiful, responsive UI with smooth animations
- **Property Listings**: Comprehensive property cards with image carousels
- **Multi-Duration Rentals**: Support for short-term, month-to-month, and long-term rentals
- **Advanced Filtering**: Filter properties by type, location, amenities, and more
- **Contact Forms**: Interactive contact forms with validation
- **Location Pages**: Detailed information about Berlin neighborhoods
- **Mobile Responsive**: Fully responsive design for all devices
- **SEO Optimized**: Built with Next.js for optimal performance and SEO

## 🚀 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **Forms**: React Hook Form
- **Development**: ESLint, PostCSS, Autoprefixer

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd berlinluxerentals
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
berlinluxerentals/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── about/             # About page
│   │   ├── contact/           # Contact page
│   │   ├── properties/        # Properties listing page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable components
│   │   ├── Header.tsx         # Navigation header
│   │   ├── Hero.tsx           # Hero section
│   │   ├── PropertyCard.tsx   # Property listing card
│   │   ├── About.tsx          # About section
│   │   ├── Locations.tsx      # Locations section
│   │   ├── ContactForm.tsx    # Contact form
│   │   └── Footer.tsx         # Site footer
│   ├── lib/                   # Utility functions
│   │   └── utils.ts           # Helper functions
│   └── types/                 # TypeScript type definitions
│       └── index.ts           # Type definitions
├── public/                    # Static assets
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

## 🎨 Components Overview

### Header Component
- Responsive navigation with mobile menu
- Smooth scroll effects
- Authentication links
- Logo and branding

### Hero Component
- Dynamic search functionality
- Rental type tabs (Short-term, Month-to-month, Long-term)
- Animated elements with Framer Motion
- Quick filter buttons

### PropertyCard Component
- Image carousel with navigation
- Property details and amenities
- Pricing and availability
- Like/bookmark functionality
- Responsive design

### ContactForm Component
- Form validation with React Hook Form
- Multiple inquiry types
- Success/error states
- Responsive layout

## 🌍 Pages

### Home Page (`/`)
- Hero section with search
- Featured properties
- About section
- Locations overview
- Contact form

### Properties Page (`/properties`)
- Property filtering and sorting
- Grid/map view toggle
- Advanced search options
- Pagination

### About Page (`/about`)
- Company mission and values
- Team profiles
- Statistics and achievements
- Company history

### Contact Page (`/contact`)
- Contact information
- Interactive contact form
- FAQ section
- Office location details

## 🎯 Key Features

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Flexible grid layouts
- Touch-friendly interfaces

### Animations
- Smooth page transitions
- Scroll-triggered animations
- Hover effects
- Loading states

### Property Management
- Multiple property types
- Image galleries
- Amenity listings
- Availability tracking
- Pricing display

### Search & Filtering
- Real-time search
- Category filters
- Location-based filtering
- Price range selection
- Availability filters

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Lint Code
```bash
npm run lint
```

## 🔧 Configuration

### Tailwind CSS
The project uses a custom Tailwind configuration with:
- Custom color palette (primary/secondary)
- Extended font family (Inter)
- Custom utility classes
- Responsive breakpoints

### Next.js
- App Router architecture
- TypeScript support
- Image optimization
- SEO optimization

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support or questions about this project:
- Email: info@berlinluxerentals.de
- Phone: +49 (30) 1234-5678

## 🌟 Acknowledgments

- Original design inspiration from Artin Properties
- Images from Unsplash
- Icons from Heroicons
- Fonts from Google Fonts

---

**BerlinLuxerentals.de** - Making Rentals Easy with One Platform for Every Duration.





