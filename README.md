# GST Filing Desktop App

A desktop application for GST (Goods and Services Tax) filing and invoice management, similar to KhataBook. Built with Electron, React, TypeScript, and Tailwind CSS.

## Features

- **Dashboard** - Overview of sales, purchases, GST liability, and quick actions
- **Business Profile** - Manage your business details, GSTIN, PAN, and bank information
- **Party Management** - Add and manage customers and suppliers with GSTIN details
- **Sales Invoices** - Create, view, and manage sales invoices with automatic GST calculation
- **Purchase Invoices** - Track purchase invoices for Input Tax Credit (ITC)
- **GST Returns** - GSTR-1 and GSTR-3B summary preparation with monthly breakdown
- **Reports** - Sales, Purchase, GST, and Party-wise reports with date filtering

## GST Calculation Features

- Automatic CGST/SGST split for intra-state transactions
- IGST calculation for inter-state transactions
- Support for all GST rates: 0%, 0.25%, 3%, 5%, 12%, 18%, 28%
- HSN code support
- Round-off calculation
- Input Tax Credit (ITC) computation
- Net GST liability calculation

## Tech Stack

- **Electron** - Cross-platform desktop framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **localStorage** - Local data persistence
- **Lucide React** - Beautiful icons
- **date-fns** - Date formatting

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development (Web Mode)

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Development (Electron Mode)

```bash
npm run electron:dev
```

### Build

```bash
# Web build
npm run build:web

# Desktop build (creates installer)
npm run electron:build
```

### Linting & Type Checking

```bash
npm run lint
npm run typecheck
```

## Project Structure

```
src/
├── components/
│   ├── Layout/          # Sidebar, Header, Layout
│   ├── Dashboard/       # Dashboard with summary cards
│   ├── Business/        # Business profile management
│   ├── Parties/         # Customer/Supplier management
│   ├── Invoices/        # Invoice creation, listing, viewing
│   ├── Returns/         # GSTR-1 and GSTR-3B summaries
│   └── Reports/         # Various business reports
├── store/               # localStorage-based data layer
├── types/               # TypeScript type definitions
├── utils/               # GST calculation utilities
├── App.tsx              # Route configuration
└── main.tsx             # Entry point
```

## Indian States & GST

The app supports all Indian states and union territories with proper state codes for GSTIN validation and inter-state/intra-state GST determination.

## Data Storage

All data is stored locally using the browser's localStorage API. No data is sent to any server, ensuring complete privacy of your financial information.

## License

MIT
