# Habit Tracker Frontend

A modern, responsive React TypeScript frontend for the Habit Tracker application.

## Features

- 🔐 **Authentication**: User registration and login with JWT tokens
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 🎯 **Habit Management**: Create, view, and delete habits
- 📅 **Date Tracking**: Set reminder dates for habits
- 🎨 **Modern UI**: Clean, intuitive interface with Tailwind CSS
- 🔔 **Toast Notifications**: User feedback for all actions
- 📊 **Status Tracking**: Visual indicators for habit status (due today, overdue, upcoming)

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **Axios** for API communication
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hot Toast** for notifications
- **date-fns** for date manipulation

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend API running on `http://localhost:8000`

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── Layout.tsx      # Main layout wrapper
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication state management
│   ├── pages/              # Page components
│   │   ├── Login.tsx       # Login page
│   │   ├── Register.tsx    # Registration page
│   │   └── Dashboard.tsx   # Main dashboard
│   ├── services/           # API services
│   │   └── api.ts          # API client and endpoints
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # Shared types
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # App entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## API Integration

The frontend communicates with the FastAPI backend through a proxy configuration in `vite.config.ts`. All API calls are prefixed with `/api` and automatically redirected to `http://localhost:8000`.

### Authentication Flow

1. User registers/logs in through the UI
2. JWT token is stored in localStorage
3. Token is automatically included in API requests
4. Token expiration is handled gracefully with automatic logout

### Habit Management

- **Create**: Add new habits with title, description, and reminder date
- **Read**: View all user habits with status indicators
- **Delete**: Remove habits with confirmation dialog

## Styling

The application uses Tailwind CSS with a custom color palette:
- Primary: Blue tones for main actions
- Success: Green tones for positive feedback
- Custom components defined in `index.css`

## Development

### Adding New Features

1. Create new components in `src/components/`
2. Add new pages in `src/pages/`
3. Define types in `src/types/index.ts`
4. Add API endpoints in `src/services/api.ts`

### State Management

The app uses React Context for global state management:
- `AuthContext`: Handles user authentication and token management

## Production Build

To build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
