# BeatWise Frontend

This is the frontend application for BeatWise, built with Next.js 15, React 19, TypeScript, and Tailwind CSS v4.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **UI**: React 19
- **Fonts**: Oswald (display), JetBrains Mono (monospace)

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

```bash
# Install dependencies (using pnpm)
pnpm install
```

### Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

Build for production:

```bash
pnpm build
```

### Start Production Server

```bash
pnpm start
```

## Project Structure

```
frontend/
├── app/                  # Next.js App Router
│   ├── layout.tsx       # Root layout with fonts and metadata
│   ├── page.tsx         # Landing page
│   └── globals.css      # Global styles and Tailwind CSS
├── components/          # React components
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── ProblemSection.tsx
│   ├── SolutionSection.tsx
│   ├── FeaturesSection.tsx
│   ├── SocialProofSection.tsx
│   ├── CTASection.tsx
│   └── Footer.tsx
├── public/              # Static assets
├── next.config.ts       # Next.js configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies
```

## Design System

The landing page follows an industrial technical aesthetic with:

- **Colors**: Dark mode palette with orange (#FF6B35) and teal (#00D4AA) accents
- **Typography**: Oswald for headings, JetBrains Mono for body text
- **Spacing**: Consistent spacing system using CSS variables
- **Border Radius**: Uniform 16px radius throughout

## Features

- ✅ Fully responsive design
- ✅ Dark/Light mode toggle (persisted in localStorage)
- ✅ Code-inspired visual language
- ✅ Optimized images with Next.js Image component
- ✅ Type-safe with TypeScript
- ✅ Modern CSS with Tailwind v4
- ✅ Free and open-source (no payment features)

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
