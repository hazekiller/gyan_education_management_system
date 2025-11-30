# Quick Start Guide - Gyan Education Mobile App

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd mobile-app
npm install
```

### Step 2: Configure Backend URL

**Option A: Using Android Emulator**
- Open `src/constants/api.js`
- Set `API_BASE_URL` to `http://10.0.2.2:5000/api`

**Option B: Using Physical Device**
1. Find your computer's IP address:
   - **Windows**: Run `ipconfig` in CMD, look for IPv4 Address
   - **Mac/Linux**: Run `ifconfig` or `ip addr`, look for inet address
2. Open `src/constants/api.js`
3. Set `API_BASE_URL` to `http://YOUR_IP:5000/api` (e.g., `http://192.168.1.100:5000/api`)

**Option C: Using iOS Simulator**
- Keep default `http://localhost:5000/api`

### Step 3: Start Backend Server
Make sure your backend is running:
```bash
cd ../backend
npm run dev
```

### Step 4: Start Mobile App
```bash
cd ../mobile-app
npm start
```

### Step 5: Open on Device

**For Physical Device:**
1. Install **Expo Go** app from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in terminal with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

**For Emulator:**
- Press `a` for Android emulator
- Press `i` for iOS simulator

### Step 6: Login
Use demo credentials:
```
Email: admin@gyan.edu
Password: Admin@123
```

## 📱 Testing on Physical Device

### Important Notes:
1. **Same Network**: Your phone and computer must be on the same WiFi network
2. **Firewall**: Ensure your firewall allows connections on port 5000
3. **IP Address**: Use your computer's local IP, not localhost

### Finding Your IP Address:

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter

**Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Linux:**
```bash
hostname -I
```

## 🔧 Troubleshooting

### "Network request failed"
- ✅ Check backend is running (`npm run dev` in backend folder)
- ✅ Verify API_BASE_URL in `src/constants/api.js`
- ✅ Ensure phone and computer are on same WiFi
- ✅ Check firewall settings

### "Unable to connect to Expo"
- ✅ Make sure Expo Go app is installed
- ✅ Try running `expo start --tunnel` for tunnel connection
- ✅ Restart Expo dev server

### App crashes on startup
```bash
# Clear cache and restart
expo start -c
```

## 📚 Next Steps

1. **Explore Features**: Navigate through all modules using the drawer menu
2. **Test API Integration**: Try creating/viewing students, teachers, etc.
3. **Customize**: Modify colors in `src/constants/theme.js`
4. **Add Features**: Extend screens in `src/screens/`

## 🎨 Customization

### Change Theme Colors
Edit `src/constants/theme.js`:
```javascript
export const COLORS = {
  primary: '#6366f1',  // Change this
  secondary: '#8b5cf6', // And this
  // ...
};
```

### Add New Screen
1. Create screen file in `src/screens/YourModule/YourScreen.js`
2. Add route in `src/navigation/MainNavigator.js`
3. Add API endpoint in `src/constants/api.js`

## 📞 Support

If you encounter issues:
1. Check the main README.md for detailed documentation
2. Review error messages in Expo DevTools
3. Check backend logs for API errors

## 🎯 Demo Features to Try

- ✅ View Dashboard statistics
- ✅ Browse Students and Teachers
- ✅ Check Attendance records
- ✅ View Exams and Assignments
- ✅ Access Fee Management
- ✅ Read Announcements
- ✅ Send Messages
- ✅ Check Library books
- ✅ View Profile

Happy coding! 🚀
