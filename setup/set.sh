#!/bin/bash

# Client CMS Setup Script
# This script creates the complete folder structure and files for the CMS

echo "🚀 Setting up Client CMS project..."

# Create main project directory
mkdir -p client-cms
cd client-cms

# Create all directories
echo "📁 Creating directory structure..."
mkdir -p {lib/{config,auth,utils,types},data/{config,content/{pages,components,blog/posts},uploads/{images,documents,media}},components/{ui,layout,content,dashboard,admin},app/{about,services,contact,blog/[slug],dashboard/{content/[section],media,seo,theme,settings},admin/{users,analytics,system},api/{auth/[...nextauth],config/[section],content/[type],upload,seo,preview}},public/{images,icons},styles/themes}

# Create package.json
echo "📦 Creating package.json..."
cat > package.json << 'EOF'
{
  "name": "client-cms",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "setup": "node scripts/setup.js"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "next-auth": "^4.24.0",
    "@auth/prisma-adapter": "^1.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "@tailwindcss/forms": "^0.5.0",
    "@tailwindcss/typography": "^0.5.0",
    "lucide-react": "^0.263.0",
    "recharts": "^2.8.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.47.0",
    "@hookform/resolvers": "^3.3.0",
    "clsx": "^2.0.0",
    "class-variance-authority": "^0.7.0",
    "cmdk": "^0.2.0",
    "sharp": "^0.32.0",
    "gray-matter": "^4.0.3",
    "remark": "^15.0.0",
    "remark-html": "^16.0.0",
    "date-fns": "^2.30.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "eslint-config-next": "14.0.0",
    "@types/jest": "^29.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0"
  }
}
EOF

# Create next.config.js
echo "⚙️ Creating next.config.js..."
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', 'yourdomain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'https://yourdomain.com/uploads/:path*'
          : '/uploads/:path*'
      }
    ];
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
    };
    return config;
  }
}

module.exports = nextConfig
EOF

# Create tailwind.config.js
echo "🎨 Creating tailwind.config.js..."
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
      },
      fontFamily: {
        heading: 'var(--font-heading)',
        body: 'var(--font-body)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
EOF

# Create tsconfig.json
echo "📝 Creating tsconfig.json..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# Create environment files
echo "🔐 Creating environment files..."
cat > .env.example << 'EOF'
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure-admin-password
CONTENT_MANAGER_EMAIL=content@example.com
CONTENT_MANAGER_PASSWORD=secure-content-password
UPLOAD_MAX_SIZE=10485760
ALLOWED_DOMAINS=localhost,yourdomain.com
CPANEL_UPLOAD_URL=https://yourdomain.com/api/upload.php
CPANEL_API_KEY=your-cpanel-api-key
EOF

cat > .env.local << 'EOF'
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=super-secret-key-change-this
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
CONTENT_MANAGER_EMAIL=content@example.com
CONTENT_MANAGER_PASSWORD=content123
UPLOAD_MAX_SIZE=10485760
ALLOWED_DOMAINS=localhost
EOF

# Create auth config
echo "🔒 Creating auth configuration..."
cat > auth.config.ts << 'EOF'
import { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export default {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (credentials?.email === process.env.ADMIN_EMAIL &&
            credentials?.password === process.env.ADMIN_PASSWORD) {
          return {
            id: '1',
            email: credentials.email,
            role: 'admin',
            name: 'Admin User'
          };
        }

        if (credentials?.email === process.env.CONTENT_MANAGER_EMAIL &&
            credentials?.password === process.env.CONTENT_MANAGER_PASSWORD) {
          return {
            id: '2',
            email: credentials.email,
            role: 'content_manager',
            name: 'Content Manager'
          };
        }

        return null;
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role;
      return session;
    }
  }
} satisfies NextAuthConfig;
EOF

# Create middleware
echo "🛡️ Creating middleware..."
cat > middleware.ts << 'EOF'
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (pathname.startsWith('/admin') && token?.role !== 'admin') {
      return Response.redirect(new URL('/dashboard', req.url));
    }

    if (pathname.startsWith('/dashboard') && !token) {
      return Response.redirect(new URL('/auth/signin', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
};
EOF

# Create data files
echo "📄 Creating configuration files..."

# Site configuration
cat > data/config/site.toml << 'EOF'
[site]
name = "Client Website"
description = "Professional website for our client"
url = "https://clientwebsite.com"
email = "contact@clientwebsite.com"
phone = "+1234567890"
logo = "/images/logo.png"

[company]
name = "Client Company"
address = "123 Business St, City, State 12345"
founded = 2020
registration_number = "12345678"

[social]
facebook = "https://facebook.com/client"
twitter = "https://twitter.com/client"
linkedin = "https://linkedin.com/company/client"
instagram = "https://instagram.com/client"
youtube = ""

[contact]
hours = "Mon-Fri 9AM-5PM"
timezone = "America/New_York"
emergency_phone = ""
EOF

# Theme configuration
cat > data/config/theme.toml << 'EOF'
[colors]
primary = "#3B82F6"
secondary = "#10B981"
accent = "#F59E0B"
background = "#FFFFFF"
foreground = "#1F2937"
muted = "#F3F4F6"
border = "#E5E7EB"

[typography]
heading_font = "Inter"
body_font = "Open Sans"

[font_sizes]
xs = "0.75rem"
sm = "0.875rem"
base = "1rem"
lg = "1.125rem"
xl = "1.25rem"
"2xl" = "1.5rem"
"3xl" = "1.875rem"

[layout]
max_width = "1200px"
header_height = "80px"
footer_height = "200px"
sidebar_width = "280px"

[animations]
duration_fast = "150ms"
duration_normal = "300ms"
duration_slow = "500ms"
EOF

# Navigation configuration
cat > data/config/navigation.toml << 'EOF'
[[main_menu]]
label = "Home"
href = "/"
order = 1
icon = "home"

[[main_menu]]
label = "About"
href = "/about"
order = 2
icon = "info"

[[main_menu]]
label = "Services"
href = "/services"
order = 3
icon = "briefcase"

[[main_menu]]
label = "Contact"
href = "/contact"
order = 4
icon = "phone"

[footer_menu]
company = [
  { label = "About Us", href = "/about" },
  { label = "Our Team", href = "/team" },
  { label = "Careers", href = "/careers" }
]
services = [
  { label = "Web Design", href = "/services/web-design" },
  { label = "Development", href = "/services/development" },
  { label = "Consulting", href = "/services/consulting" }
]
support = [
  { label = "Contact", href = "/contact" },
  { label = "FAQ", href = "/faq" },
  { label = "Support", href = "/support" }
]

[cta]
text = "Get Started"
href = "/contact"
style = "primary"
EOF

# SEO configuration
cat > data/config/seo.toml << 'EOF'
[global]
site_name = "Client Website"
default_title = "Client Website - Professional Services"
title_template = "%s | Client Website"
default_description = "Professional services for business growth and success"
canonical_url = "https://clientwebsite.com"
default_keywords = ["business", "services", "professional", "consulting"]

[robots]
index = true
follow = true
googlebot = "index,follow"

[og]
type = "website"
image = "/images/og-image.jpg"
image_width = 1200
image_height = 630
image_alt = "Client Website"

[twitter]
card = "summary_large_image"
site = "@clientwebsite"
creator = "@clientwebsite"

[schema]
organization = "Client Company"
logo = "/images/logo.png"
same_as = [
  "https://facebook.com/client",
  "https://twitter.com/client",
  "https://linkedin.com/company/client"
]

[analytics]
google_analytics = ""
google_tag_manager = ""
facebook_pixel = ""
EOF

# Home page content
cat > data/content/pages/home.toml << 'EOF'
[meta]
title = "Welcome to Our Website"
description = "Professional services for your business needs"
keywords = ["business", "services", "professional", "home"]
updated = "2024-01-15T10:30:00Z"

[seo]
title = "Home - Professional Business Services"
description = "Transform your business with our professional services. Expert solutions for growth and success."
canonical = "/"
no_index = false

[hero]
title = "Transform Your Business"
subtitle = "Professional solutions that drive real results for your company"
cta_text = "Get Started Today"
cta_link = "/contact"
secondary_cta_text = "Learn More"
secondary_cta_link = "/about"
background_image = "/images/hero-bg.jpg"
background_video = ""

[about_preview]
title = "About Our Company"
content = """
We provide exceptional services with over 10 years of experience in the industry.
Our dedicated team is committed to delivering quality solutions that help businesses grow and succeed.
"""
image = "/images/about-preview.jpg"
cta_text = "Learn More About Us"
cta_link = "/about"

[[features]]
title = "Quality Service"
description = "We deliver high-quality solutions tailored to your needs"
icon = "check-circle"
color = "primary"

[[features]]
title = "Expert Team"
description = "Our experienced professionals bring years of expertise"
icon = "users"
color = "secondary"

[[features]]
title = "24/7 Support"
description = "Round-the-clock support for all your business needs"
icon = "headphones"
color = "accent"

[stats]
title = "Our Impact"
subtitle = "Numbers that speak for themselves"

[[stats.items]]
value = "500+"
label = "Happy Clients"
icon = "smile"

[[stats.items]]
value = "1000+"
label = "Projects Completed"
icon = "briefcase"

[[stats.items]]
value = "10+"
label = "Years Experience"
icon = "calendar"

[[stats.items]]
value = "24/7"
label = "Support Available"
icon = "clock"
EOF

# About page content
cat > data/content/pages/about.toml << 'EOF'
[meta]
title = "About Us - Our Story"
description = "Learn about our company, mission, and the experienced team behind our success"
keywords = ["about", "company", "team", "mission", "history"]
updated = "2024-01-15T10:30:00Z"

[seo]
title = "About Us - Learn About Our Company"
description = "Discover our story, mission, and the experienced team behind our success. Professional services since 2010."
canonical = "/about"

[hero]
title = "About Our Company"
subtitle = "Building success through professional excellence since 2010"
background_image = "/images/about-hero.jpg"

[story]
title = "Our Story"
content = """
Founded in 2010, our company has grown from a small startup to a leading provider of professional services.
We believe in delivering exceptional value to our clients through innovative solutions and dedicated service.

Our journey began with a simple mission: to help businesses achieve their goals through professional expertise
and personalized attention. Today, we continue to uphold these values while expanding our capabilities to
serve a diverse range of clients across various industries.
"""

[mission]
title = "Our Mission"
description = "To empower businesses with professional solutions that drive growth and success"

[vision]
title = "Our Vision"
description = "To be the trusted partner for businesses seeking excellence and innovation"

[values]
title = "Our Values"

[[values.items]]
title = "Excellence"
description = "We strive for excellence in everything we do"
icon = "star"

[[values.items]]
title = "Integrity"
description = "We conduct business with honesty and transparency"
icon = "shield"

[[values.items]]
title = "Innovation"
description = "We embrace new ideas and creative solutions"
icon = "lightbulb"

[[values.items]]
title = "Partnership"
description = "We build lasting relationships with our clients"
icon = "handshake"
EOF

# Services page content
cat > data/content/pages/services.toml << 'EOF'
[meta]
title = "Our Services"
description = "Comprehensive professional services to help your business grow"
keywords = ["services", "business", "consulting", "solutions"]
updated = "2024-01-15T10:30:00Z"

[seo]
title = "Professional Services - Complete Business Solutions"
description = "Discover our comprehensive range of professional services designed to help your business succeed and grow."
canonical = "/services"

[hero]
title = "Our Services"
subtitle = "Comprehensive solutions for your business needs"
background_image = "/images/services-hero.jpg"

[intro]
title = "What We Offer"
content = """
Our comprehensive range of services is designed to address every aspect of your business needs.
From strategy and planning to implementation and support, we provide end-to-end solutions
that drive results and create lasting value.
"""

[[services]]
title = "Business Consulting"
description = "Strategic guidance to help your business reach its full potential"
icon = "trending-up"
features = [
  "Strategic Planning",
  "Market Analysis",
  "Process Optimization",
  "Performance Metrics"
]
price_from = "Contact us"

[[services]]
title = "Digital Solutions"
description = "Modern digital solutions to enhance your business operations"
icon = "monitor"
features = [
  "Website Development",
  "Digital Marketing",
  "E-commerce Solutions",
  "Mobile Applications"
]
price_from = "Contact us"

[[services]]
title = "Support & Maintenance"
description = "Ongoing support to ensure your systems run smoothly"
icon = "headphones"
features = [
  "24/7 Technical Support",
  "Regular Maintenance",
  "Security Updates",
  "Performance Monitoring"
]
price_from = "Contact us"

[cta]
title = "Ready to Get Started?"
description = "Contact us today to discuss how we can help your business succeed"
button_text = "Contact Us"
button_link = "/contact"
EOF

# Contact page content
cat > data/content/pages/contact.toml << 'EOF'
[meta]
title = "Contact Us"
description = "Get in touch with our team for professional business solutions"
keywords = ["contact", "get in touch", "business", "consultation"]
updated = "2024-01-15T10:30:00Z"

[seo]
title = "Contact Us - Get Professional Business Solutions"
description = "Ready to transform your business? Contact our team today for expert consultation and professional services."
canonical = "/contact"

[hero]
title = "Contact Us"
subtitle = "Ready to transform your business? Let's talk."
background_image = "/images/contact-hero.jpg"

[contact_info]
title = "Get In Touch"
description = "We're here to help your business succeed. Reach out to us today."

[office]
title = "Our Office"
address = "123 Business Street"
city = "Your City"
state = "State"
zip = "12345"
country = "USA"

[hours]
title = "Business Hours"
weekdays = "Monday - Friday: 9:00 AM - 6:00 PM"
weekend = "Saturday - Sunday: Closed"
timezone = "EST"

[form]
title = "Send us a Message"
description = "Fill out the form below and we'll get back to you within 24 hours"
success_message = "Thank you for your message. We'll be in touch soon!"
EOF

# Testimonials component
cat > data/content/components/testimonials.toml << 'EOF'
[settings]
title = "What Our Clients Say"
subtitle = "Real feedback from real customers who trust our services"
display_count = 3
auto_rotate = true
rotation_speed = 5000

[[testimonials]]
id = 1
name = "John Smith"
company = "ABC Corporation"
position = "CEO"
content = "Excellent service and professional team. They delivered exactly what we needed on time and within budget."
image = "/images/testimonials/john-smith.jpg"
rating = 5

[[testimonials]]
id = 2
name = "Sarah Johnson"
company = "XYZ Industries"
position = "Marketing Director"
content = "Outstanding results and great communication throughout the project. Highly recommend their services."
image = "/images/testimonials/sarah-johnson.jpg"
rating = 5

[[testimonials]]
id = 3
name = "Michael Brown"
company = "Tech Solutions Inc"
position = "CTO"
content = "Professional, reliable, and innovative. They helped us achieve our goals and exceed our expectations."
image = "/images/testimonials/michael-brown.jpg"
rating = 5

[[testimonials]]
id = 4
name = "Emily Davis"
company = "Creative Agency"
position = "Founder"
content = "The team went above and beyond to ensure our success. Great partnership and fantastic results."
image = "/images/testimonials/emily-davis.jpg"
rating = 5
EOF

# Team component
cat > data/content/components/team.toml << 'EOF'
[settings]
title = "Meet Our Team"
subtitle = "The professionals behind our success"
layout = "grid"
show_social = true

[[members]]
id = 1
name = "Alex Johnson"
position = "CEO & Founder"
bio = "With over 15 years of experience in business consulting, Alex leads our team with vision and expertise."
image = "/images/team/alex-johnson.jpg"
email = "alex@company.com"
social.linkedin = "https://linkedin.com/in/alex-johnson"
social.twitter = "https://twitter.com/alex_johnson"

[[members]]
id = 2
name = "Maria Garcia"
position = "Head of Operations"
bio = "Maria ensures smooth operations and exceptional client service delivery across all our projects."
image = "/images/team/maria-garcia.jpg"
email = "maria@company.com"
social.linkedin = "https://linkedin.com/in/maria-garcia"

[[members]]
id = 3
name = "David Wilson"
position = "Technical Director"
bio = "David brings technical expertise and innovative solutions to complex business challenges."
image = "/images/team/david-wilson.jpg"
email = "david@company.com"
social.linkedin = "https://linkedin.com/in/david-wilson"
social.github = "https://github.com/david-wilson"

[[members]]
id = 4
name = "Lisa Chen"
position = "Marketing Manager"
bio = "Lisa drives our marketing efforts and helps clients build strong brand presence in their markets."
image = "/images/team/lisa-chen.jpg"
email = "lisa@company.com"
social.linkedin = "https://linkedin.com/in/lisa-chen"
social.twitter = "https://twitter.com/lisa_chen"
EOF

# Features component
cat > data/content/components/features.toml << 'EOF'
[settings]
title = "Why Choose Us"
subtitle = "The advantages that set us apart from the competition"
layout = "cards"
columns = 3

[[features]]
id = 1
title = "Expert Team"
description = "Our experienced professionals bring years of industry expertise to every project"
icon = "users"
color = "primary"

[[features]]
id = 2
title = "Quality Service"
description = "We deliver high-quality solutions tailored to meet your specific business needs"
icon = "check-circle"
color = "secondary"

[[features]]
id = 3
title = "24/7 Support"
description = "Round-the-clock support ensures your business operations run smoothly"
icon = "headphones"
color = "accent"

[[features]]
id = 4
title = "Fast Delivery"
description = "Quick turnaround times without compromising on quality or attention to detail"
icon = "zap"
color = "primary"

[[features]]
id = 5
title = "Competitive Pricing"
description = "Affordable solutions that provide excellent value for your investment"
icon = "dollar-sign"
color = "secondary"

[[features]]
id = 6
title = "Custom Solutions"
description = "Tailored approaches designed specifically for your unique business requirements"
icon = "settings"
color = "accent"
EOF

# Gallery component
cat > data/content/components/gallery.toml << 'EOF'
[settings]
title = "Our Work"
subtitle = "A showcase of our recent projects and achievements"
layout = "masonry"
columns = 3
show_captions = true
lightbox = true

[[images]]
id = 1
src = "/images/gallery/project-1.jpg"
alt = "Modern office building project"
caption = "Commercial Development Project"
category = "commercial"

[[images]]
id = 2
src = "/images/gallery/project-2.jpg"
alt = "Residential complex design"
caption = "Residential Complex Design"
category = "residential"

[[images]]
id = 3
src = "/images/gallery/project-3.jpg"
alt = "Interior design showcase"
caption = "Interior Design Project"
category = "interior"

[[images]]
id = 4
src = "/images/gallery/project-4.jpg"
alt = "Landscape architecture"
caption = "Landscape Architecture"
category = "landscape"

[[images]]
id = 5
src = "/images/gallery/project-5.jpg"
alt = "Industrial facility"
caption = "Industrial Facility Design"
category = "industrial"

[[images]]
id = 6
src = "/images/gallery/project-6.jpg"
alt = "Renovation project"
caption = "Historic Building Renovation"
category = "renovation"

[filters]
show_all_button = true
all_text = "All Projects"
categories = [
  { id = "commercial", label = "Commercial" },
  { id = "residential", label = "Residential" },
  { id = "interior", label = "Interior" },
  { id = "landscape", label = "Landscape" },
  { id = "industrial", label = "Industrial" },
  { id = "renovation", label = "Renovation" }
]
EOF

# Create lib files
echo "📚 Creating library files..."

# Config file manager
cat > lib/config/file-manager.ts << 'EOF'
import fs from 'fs/promises';
import path from 'path';
import { parse as parseToml, stringify as stringifyToml } from '@iarna/toml';

const DATA_DIR = path.join(process.cwd(), 'data');
const CONFIG_DIR = path.join(DATA_DIR, 'config');
const CONTENT_DIR = path.join(DATA_DIR, 'content');

// Cache for configuration files
const configCache = new Map<string, any>();
const contentCache = new Map<string, any>();

export async function readConfigFile(filename: string) {
  const cacheKey = `config:${filename}`;

  if (configCache.has(cacheKey)) {
    return configCache.get(cacheKey);
  }

  try {
    const filePath = path.join(CONFIG_DIR, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = parseToml(content);

    configCache.set(cacheKey, parsed);
    return parsed;
  } catch (error) {
    console.error(`Error reading config file ${filename}:`, error);
    return {};
  }
}

export async function writeConfigFile(filename: string, data: any) {
  try {
    const filePath = path.join(CONFIG_DIR, filename);
    const tomlContent = stringifyToml(data);
    await fs.writeFile(filePath, tomlContent, 'utf-8');

    // Update cache
    const cacheKey = `config:${filename}`;
    configCache.set(cacheKey, data);

    return true;
  } catch (error) {
    console.error(`Error writing config file ${filename}:`, error);
    return false;
  }
}

export async function readContentFile(type: string, filename: string) {
  const cacheKey = `content:${type}:${filename}`;

  if (contentCache.has(cacheKey)) {
    return contentCache.get(cacheKey);
  }

  try {
    const filePath = path.join(CONTENT_DIR, type, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = parseToml(content);

    contentCache.set(cacheKey, parsed);
    return parsed;
  } catch (error) {
    console.error(`Error reading content file ${type}/${filename}:`, error);
    return {};
  }
}

export async function writeContentFile(type: string, filename: string, data: any) {
  try {
    const filePath = path.join(CONTENT_DIR, type, filename);
    const tomlContent = stringifyToml(data);
    await fs.writeFile(filePath, tomlContent, 'utf-8');

    // Update cache
    const cacheKey = `content:${type}:${filename}`;
    contentCache.set(cacheKey, data);

    return true;
  } catch (error) {
    console.error(`Error writing content file ${type}/${filename}:`, error);
    return false;
  }
}

export function clearCache() {
  configCache.clear();
  contentCache.clear();
}

export async function listFiles(directory: string) {
  try {
    const dirPath = path.join(DATA_DIR, directory);
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    return files
      .filter(file => file.isFile() && file.name.endsWith('.toml