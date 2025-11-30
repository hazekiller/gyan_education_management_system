# Gyan Education Management System - Mobile App

React Native mobile application built with Expo SDK 54 for the Gyan Education Management System.

## Features

- 📱 **Cross-platform**: Works on both iOS and Android
- 🔐 **Secure Authentication**: JWT-based auth with secure token storage
- 📊 **Complete Dashboard**: Overview of all key metrics
- 👥 **Student Management**: View and manage student records
- 👨‍🏫 **Teacher Management**: Access teacher information
- 📚 **Academic Features**: 
  - Classes and Subjects
  - Attendance tracking
  - Exams and Results
  - Assignments
- 💰 **Fee Management**: Track and manage student fees
- 📅 **Events & Announcements**: Stay updated with school activities
- 💬 **Messaging**: Communication between users
- 📖 **Library Management**: Book tracking and transactions
- 🏠 **Hostel Management**: Room allocations and management
- 🚌 **Transport Management**: Route and vehicle tracking
- 💵 **Payroll**: Staff salary management

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (for testing)

## Installation

1. Navigate to the mobile-app directory:
```bash
cd mobile-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure API endpoint:
   - Open `src/constants/api.js`
   - Update `API_BASE_URL` with your backend server address:
     - For Android Emulator: `http://10.0.2.2:5000/api`
     - For iOS Simulator: `http://localhost:5000/api`
     - For Physical Device: `http://YOUR_COMPUTER_IP:5000/api` (e.g., `http://192.168.1.100:5000/api`)

## Running the App

### Development Mode

Start the Expo development server:
```bash
npm start
```

This will open Expo DevTools in your browser. You can then:

- **Scan QR code** with Expo Go app (Android) or Camera app (iOS)
- Press **`a`** to open in Android emulator
- Press **`i`** to open in iOS simulator
- Press **`w`** to open in web browser

### Platform-Specific Commands

```bash
# Android
npm run android

# iOS (macOS only)
npm run ios

# Web
npm run web
```

## Configuration

### Backend Connection

Make sure your backend server is running and accessible:

1. Backend should be running on `http://localhost:5000`
2. For physical device testing, ensure your device and computer are on the same network
3. Update the API URL in `src/constants/api.js` accordingly

### Demo Credentials

```
Email: admin@gyan.edu
Password: Admin@123
```

## Project Structure

```
mobile-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.js
│   │   ├── Card.js
│   │   ├── Input.js
│   │   ├── LoadingSpinner.js
│   │   └── CustomDrawer.js
│   ├── constants/           # App constants and configuration
│   │   ├── api.js          # API endpoints
│   │   └── theme.js        # Theme colors, sizes, fonts
│   ├── navigation/          # Navigation configuration
│   │   ├── AppNavigator.js
│   │   └── MainNavigator.js
│   ├── screens/             # All app screens
│   │   ├── Auth/
│   │   ├── Dashboard/
│   │   ├── Students/
│   │   ├── Teachers/
│   │   ├── Classes/
│   │   ├── Attendance/
│   │   ├── Exams/
│   │   ├── Assignments/
│   │   ├── Fees/
│   │   ├── Events/
│   │   ├── Announcements/
│   │   ├── Messages/
│   │   ├── Profile/
│   │   ├── Schedule/
│   │   ├── Subjects/
│   │   ├── Library/
│   │   ├── Hostel/
│   │   ├── Transport/
│   │   └── Payroll/
│   ├── services/            # API services
│   │   └── api.js
│   ├── store/               # Redux store
│   │   ├── index.js
│   │   └── authSlice.js
│   ├── utils/               # Utility functions
│   └── App.js              # Main app component
├── assets/                  # Images, fonts, etc.
├── app.json                # Expo configuration
├── babel.config.js         # Babel configuration
├── package.json            # Dependencies
└── README.md              # This file
```

## Key Technologies

- **React Native**: Mobile app framework
- **Expo SDK 54**: Development platform
- **React Navigation**: Navigation library
- **Redux Toolkit**: State management
- **Axios**: HTTP client
- **Expo Secure Store**: Secure token storage
- **React Native Paper**: UI components
- **Expo Linear Gradient**: Gradient backgrounds

## Features by Role

### Admin
- Full access to all features
- Dashboard with statistics
- Manage students, teachers, classes
- Fee management
- Payroll management
- System-wide announcements

### Teacher
- View assigned classes
- Mark attendance
- Create and grade assignments
- Post announcements
- View schedule
- Message students

### Student
- View class schedule
- Check attendance
- Submit assignments
- View exam results
- Check fee status
- Receive announcements

## API Integration

All API calls are centralized in `src/services/api.js` with:
- Automatic token injection
- Request/response interceptors
- Error handling
- Token refresh logic

## State Management

Redux Toolkit is used for global state management:
- **Auth State**: User authentication and profile
- Easily extensible for additional slices

## Security

- JWT tokens stored securely using Expo Secure Store
- Automatic token injection in API requests
- Auto-logout on token expiration
- Secure password input fields

## Troubleshooting

### Cannot connect to backend

1. Check if backend server is running
2. Verify API_BASE_URL in `src/constants/api.js`
3. For physical devices, use your computer's IP address
4. Ensure firewall allows connections on port 5000

### App crashes on startup

1. Clear cache: `expo start -c`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check for any missing dependencies

### Navigation issues

1. Ensure all screen components are properly exported
2. Check navigation stack configuration
3. Verify route names match in navigator and navigation calls

## Building for Production

### Android APK

```bash
expo build:android
```

### iOS IPA

```bash
expo build:ios
```

### Using EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## Future Enhancements

- [ ] Push notifications
- [ ] Offline mode support
- [ ] Dark mode
- [ ] Biometric authentication
- [ ] Real-time chat
- [ ] File upload/download
- [ ] Calendar integration
- [ ] Performance analytics

## Support

For issues or questions, please contact the development team or create an issue in the repository.

## License

This project is part of the Gyan Education Management System.
