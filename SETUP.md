# Hoyaal Real Estate App - Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your Project URL and Anon Key
3. Create `.env` file in the root directory:
```bash
cp .env.example .env
```
4. Update `.env` with your credentials:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Setup Database
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the contents of `api/schema.sql`

### 4. Enable Phone Authentication
1. In Supabase Dashboard, go to Authentication > Settings
2. Enable Phone provider
3. Configure SMS provider (Twilio, MessageBird, etc.)

### 5. Start the App
```bash
npm start
```

## 📱 Features

### 🔐 Authentication
- Phone number authentication with OTP
- Role-based access control (SEEKER, OWNER, AGENT, ADMIN)
- Automatic profile creation on signup

### 🏠 Property Management
- Browse properties by type (Rent/Sale)
- Filter by categories (House, Apartment, Villa, etc.)
- Property verification system
- Owner ratings and contact info

### 👥 User Roles
- **SEEKER**: Browse and favorite properties
- **OWNER**: Post and manage own properties
- **AGENT**: Post properties for clients
- **ADMIN**: Manage all users and properties

### 🎨 UI Features
- Beautiful modern design with dark/light themes
- Smooth animations and transitions
- Responsive layouts
- Error handling and loading states

## 🛠 Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Navigation**: Expo Router
- **Styling**: StyleSheet with theme system

## 📁 Project Structure

```
├── app/                 # App screens and navigation
│   ├── (auth)/         # Authentication screens
│   ├── (tabs)/         # Main app tabs
│   └── listing/        # Property details
├── api/                # Supabase configuration
├── components/         # Reusable UI components
│   └── ui/            # Base UI components
├── hooks/              # Custom React hooks
├── store/              # State management
├── types/              # TypeScript type definitions
└── constants/          # App constants and themes
```

## 🔧 Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npx tsc --noEmit
```

## 🚀 Deployment

### Building for Production
```bash
# Build for web
npm run build:web

# Build for mobile
expo build:android
expo build:ios
```

## 📞 Support

For issues and questions:
1. Check the [Issues](https://github.com/your-repo/hoyaal/issues) page
2. Create a new issue with detailed description
3. Include screenshots and error messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Hoyaal** - Ka dhig gurigaaga raaxo! 🏡✨
