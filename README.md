# Swift Luxury Rentals — Ultra‑Premium Rentals Platform

An ultra‑premium, spy‑tech inspired luxury rentals platform built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and Prisma. Designed for high‑end city rentals with real‑time support, analytics dashboards, and cinematic UI/UX across tenant and admin experiences.

## 🌟 Highlights

- **Ultra‑premium design system**: Metallic black‑silver “James Bond” glass morphism, Sora headings, animated borders, premium shadows, 3D tilt, and HUD elements.
- **Real‑time Support Tickets**: Tenant dashboard support tab with ticket creation + live chat; Admin support dashboard for triage, status, and replies with unread indicators.
- **Weather + Clock Hero**: City pages include a sleek Bond‑style WeatherWidget (AQI + apparent temperature) and synchronized local time, with dramatic weather animations (rain/snow/sunny/cloudy/thunder).
- **Luxury Search + Calendar**: Glassy “press‑down” CodePen‑style search button, sophisticated dark calendar with thicker fonts, larger desktop size, premium selection chips, and controlled month navigation.
- **Admin Suite**: Ultra‑premium `/admin` dashboard, `/sales-analytics` spy‑tech analytics (metric cards, neon bar charts, target cards), and `/admin/pages` premium CMS list.
- **CRM + Bookings**: Mobile‑optimized CRM cards, admin bookings operations with deposits, scheduled/received payments, and quick actions.
- **Maps + Properties**: Metallic black‑silver map cards, modern property tiles, Instagram in‑app “View Details” compatibility, metallic silver iconography.
- **Authentication**: NextAuth credentials + Google OAuth, admin login with username support and middleware route protection. Automatic login post‑registration.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router), React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS, custom globals for HUD/spy effects, glass morphism, metallic borders
- **Animations**: Framer Motion, CSS keyframes (scan, grid‑pulse, spy‑metric glow), dynamic raindrops/splashes
- **Auth**: NextAuth.js (Credentials + Google), middleware protection
- **DB/ORM**: PostgreSQL + Prisma (`SupportTicket`, `SupportMessage`, `User`, `Booking`, `Payment`)
- **APIs**: Next.js Route Handlers (support, analytics, weather, bookings)
- **Maps**: Google Maps via `@react-google-maps/api` with graceful fallback
- **UX Libs**: Vanilla‑Tilt (3D), React Hook Form

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
```powershell
# Windows PowerShell v5 compatible
./start-server.bat
# or
powershell -ExecutionPolicy Bypass -File .\start-server.ps1
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure (key paths)

```
berlinluxerentals/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── admin/             # Admin dashboards (main, bookings, pages, etc.)
│   │   ├── city/[cityName]/   # City page with hero (clock + weather + rain bg)
│   │   ├── properties/        # Properties listing page
│   │   ├── sales-analytics/   # Spy‑tech analytics dashboard
│   │   ├── support-dashboard/ # Admin support tickets dashboard
│   │   ├── dashboard/         # Tenant dashboard (support tab + chat)
│   │   ├── api/               # Route handlers (support, analytics, weather, bookings)
│   │   ├── globals.css        # Global styles (spy‑tech HUD, glass, weather)
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable components
│   │   ├── Header.tsx         # Premium header
│   │   ├── WeatherWidget.tsx  # Bond‑style weather + AQI card
│   │   ├── PublicCalendar.tsx # Dark premium calendar
│   │   ├── PropertyCard.tsx   # Metallic‑styled property tiles
│   │   ├── Locations.tsx      # City tiles (tilt on desktop)
│   │   ├── SearchInterface.tsx# Glassy press‑down search button, filters
│   │   ├── SpyEuropeMap.tsx   # Map with metallic frame
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

## 🎨 Premium UX Overview

### Header Component
- Responsive navigation with mobile menu
- Smooth scroll effects
- Authentication links
- Logo and branding

### City Hero (Berlin, etc.)
- Black hero with Sora headings, Bond‑style clock, Weather widget (AQI + apparent temp)
- Dramatic weather overlays (rain at angle with teardrops + splashes, snow, thunder)
- Search bar with glassy press‑down animation and thin silver border; mobile‑optimized

### Property Cards
- Metallic black‑silver styling, silver icons, Instagram in‑app “View Details” compatibility
- Removed play button; metallic silver slider arrows

### ContactForm Component
- Form validation with React Hook Form
- Multiple inquiry types
- Success/error states
- Responsive layout

## 🌍 Pages (key)

### Home Page (`/`)
- Hero section with search
- Featured properties
- About section
- Locations overview
- Contact form

### Properties Page (`/properties`)
- Metallic tiles, 4 per row on desktop, filters showing only active‐listing cities

### Admin (`/admin`)
- Ultra‑premium cards with metallic borders, glow, and spy‑tech accents
- CTAs: CMS, CRM, Analytics, Bookings, Accounting, DevOps, Support

### Sales Analytics (`/sales-analytics`)
- “Spy‑Tech HUD” metrics, neon grid bars, mission‑style targets; silver glowing numbers

### Support Dashboard (`/support-dashboard`) / Tenant Dashboard (`/dashboard`)
- Tickets list, filters, chat; tenant unread badges, NEW REPLY indicators

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
- Weather: code‑driven raindrops with diagonal fall + splash cycles, thunder/snow/clouds
- HUD: scan, grid‑pulse, spy‑metric glows; subtle 3D hover transforms

### Support & Comms
- Prisma‑backed SupportTicket/SupportMessage models, real‑time chat UX, unread counts
 
### Bookings & CRM
- Admin bookings table: deposits (active/refunded), scheduled vs received, overdue chips, quick receive/refund actions

### Search & Filtering
- Real-time search
- Category filters
- Location-based filtering
- Price range selection
- Availability filters

## 🚀 Deployment

### Production Build
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
Custom metallic palette, Sora font for headings, glass morphism layers, backdrop‑filter, animated borders, and premium shadows.

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

For product or partnership inquiries:
- Email: contact@swiftluxuryrentals.com

## 🌟 Acknowledgments

- Original design inspiration from Artin Properties
- Images from Unsplash
- Icons from Heroicons
- Fonts from Google Fonts

---

**Swift Luxury Rentals** — Ultra‑premium rentals with spy‑tech precision and hospitality‑grade UX.





