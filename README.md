# Distribook React

Aplikasi perpustakaan digital yang di-porting dari Flutter ke React dengan TypeScript dan Tailwind CSS.

## Tech Stack

- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Redux Toolkit** - State Management
- **React Query** - Server State Management
- **React Router v6** - Routing
- **Axios** - HTTP Client
- **React Hook Form + Yup** - Form Handling & Validation
- **Lucide React** - Icons

## Fitur

- ✅ Authentication (Login/Logout)
- ✅ Daftar Buku dengan Pencarian & Filter
- ✅ Detail Buku
- ✅ Peminjaman Buku
- ✅ Riwayat Peminjaman
- ✅ Absensi (Check-in/Check-out)
- ✅ Pengumuman
- ✅ Pengaturan (Theme Toggle, Profile)
- ✅ Dark Mode Support
- ✅ Responsive Design
- ✅ Comprehensive Logging

## Struktur Folder

```
src/
├── components/
│   ├── common/       # Reusable UI components (Button, Input, Card, etc.)
│   ├── features/     # Feature-specific components (BookCard, LoanRequestCard)
│   └── layout/       # Layout components (Sidebar, Header, MainLayout)
├── config/           # Environment configuration
├── pages/            # Page components
├── services/         # API services
├── store/            # Redux store & slices
├── types/            # TypeScript type definitions
└── utils/            # Utility functions (logger, helpers)
```

## Environment Variables

Buat file `.env` di root project:

```env
# API Configuration
VITE_API_BASE_URL=https://distribook.vastro.id/api
VITE_API_TIMEOUT=20000

# App Configuration
VITE_APP_NAME=Distribook
VITE_APP_VERSION=1.0.0

# Logging
VITE_LOG_LEVEL=debug  # debug | info | warn | error
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm atau yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Logging

Aplikasi ini dilengkapi dengan sistem logging komprehensif untuk memudahkan debugging:

```typescript
import { createLogger } from '@/utils/logger';

const logger = createLogger('ComponentName');

logger.debug('Debug message', { data });
logger.info('Info message', { data });
logger.warn('Warning message', { data });
logger.error('Error message', error, { additionalData });
```

Log level dapat dikonfigurasi melalui environment variable `VITE_LOG_LEVEL`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | User login |
| GET | `/auth/logout/{session_id}` | User logout |
| GET | `/user` | Get current user |
| GET | `/books` | Get all books |
| GET | `/loanrequests` | Get loan requests |
| POST | `/loanrequests` | Create loan request |
| POST | `/attendance/today/` | Get today's attendance |
| POST | `/attendance` | Submit attendance |
| POST | `/pengumuman` | Get announcements |

## License

© 2024 Distribook. All rights reserved.
