# Deployment Guide - Gyan Education Mobile App

## 📦 Building for Production

### Prerequisites
- Expo account (create at https://expo.dev)
- EAS CLI installed: `npm install -g eas-cli`

## Option 1: Using Expo Application Services (EAS) - Recommended

### Initial Setup

1. **Login to Expo**
```bash
eas login
```

2. **Configure EAS Build**
```bash
cd mobile-app
eas build:configure
```

This creates `eas.json` with build configurations.

### Building for Android

#### Development Build
```bash
eas build --profile development --platform android
```

#### Preview Build (APK for testing)
```bash
eas build --profile preview --platform android
```

#### Production Build (AAB for Play Store)
```bash
eas build --profile production --platform android
```

**Download APK/AAB**: After build completes, download from the provided URL or Expo dashboard.

### Building for iOS

#### Development Build
```bash
eas build --profile development --platform ios
```

#### Production Build (for App Store)
```bash
eas build --profile production --platform ios
```

**Requirements**:
- Apple Developer Account ($99/year)
- App Store Connect access
- Proper certificates and provisioning profiles

### Building for Both Platforms
```bash
eas build --profile production --platform all
```

## Option 2: Classic Expo Build (Deprecated but simpler)

### Android APK
```bash
expo build:android -t apk
```

### Android App Bundle (for Play Store)
```bash
expo build:android -t app-bundle
```

### iOS
```bash
expo build:ios
```

## 📱 Distribution Methods

### 1. Internal Testing (Easiest)

**Using Expo Go**
- Users install Expo Go app
- Share your published Expo project URL
- No build required!

```bash
expo publish
```

### 2. TestFlight (iOS)

1. Build iOS app with EAS
2. Upload to App Store Connect
3. Add internal/external testers
4. Distribute via TestFlight

### 3. Google Play Internal Testing

1. Build Android AAB
2. Upload to Google Play Console
3. Create internal testing track
4. Add testers via email

### 4. Direct APK Distribution

1. Build APK with EAS
2. Download APK file
3. Share APK file directly
4. Users install (need to enable "Unknown Sources")

## 🚀 Publishing to App Stores

### Google Play Store

1. **Create Developer Account** ($25 one-time fee)
   - Visit https://play.google.com/console

2. **Prepare App Listing**
   - App name: Gyan Education
   - Description
   - Screenshots (required)
   - Feature graphic
   - Icon

3. **Build Production AAB**
```bash
eas build --profile production --platform android
```

4. **Upload to Play Console**
   - Create new app
   - Upload AAB
   - Fill in store listing
   - Set content rating
   - Set pricing (free/paid)

5. **Submit for Review**

### Apple App Store

1. **Create Developer Account** ($99/year)
   - Visit https://developer.apple.com

2. **Create App in App Store Connect**
   - Bundle ID: com.gyan.education
   - App name: Gyan Education

3. **Prepare App Listing**
   - Description
   - Screenshots (required for all device sizes)
   - Preview videos (optional)
   - Icon

4. **Build Production IPA**
```bash
eas build --profile production --platform ios
```

5. **Upload to App Store Connect**
   - Use Transporter app or EAS Submit
   - Fill in app information
   - Set pricing

6. **Submit for Review**

## 🔧 Pre-Deployment Checklist

### Code
- [ ] Remove console.logs
- [ ] Update API_BASE_URL to production URL
- [ ] Test all features thoroughly
- [ ] Fix all warnings
- [ ] Update version number in app.json

### Assets
- [ ] App icon (1024x1024 PNG)
- [ ] Splash screen
- [ ] Screenshots for stores
- [ ] Feature graphic (Android)

### Configuration
- [ ] Update app.json with correct details
- [ ] Set proper bundle identifiers
- [ ] Configure permissions
- [ ] Set up analytics (optional)
- [ ] Configure crash reporting (optional)

### Legal
- [ ] Privacy policy URL
- [ ] Terms of service
- [ ] Content rating
- [ ] Age restrictions

## 📊 App Store Requirements

### Android (Google Play)

**Required Assets**:
- App icon: 512x512 PNG
- Feature graphic: 1024x500 PNG
- Screenshots: At least 2 (phone and tablet)
- Privacy policy URL

**App Details**:
- Title (max 50 characters)
- Short description (max 80 characters)
- Full description (max 4000 characters)
- Category
- Content rating

### iOS (App Store)

**Required Assets**:
- App icon: 1024x1024 PNG
- Screenshots for all device sizes:
  - iPhone 6.7" (1290x2796)
  - iPhone 6.5" (1242x2688)
  - iPhone 5.5" (1242x2208)
  - iPad Pro 12.9" (2048x2732)

**App Details**:
- Name (max 30 characters)
- Subtitle (max 30 characters)
- Description (max 4000 characters)
- Keywords (max 100 characters)
- Category
- Age rating

## 🔐 Environment Configuration

### Production API URL

Update `src/constants/api.js`:
```javascript
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api'
  : 'https://your-production-api.com/api';
```

### Environment Variables

Create `.env.production`:
```
API_BASE_URL=https://api.gyaneducation.com/api
SENTRY_DSN=your_sentry_dsn
ANALYTICS_ID=your_analytics_id
```

## 📈 Post-Deployment

### Monitoring
- Set up crash reporting (Sentry, Bugsnag)
- Configure analytics (Firebase, Amplitude)
- Monitor app performance
- Track user engagement

### Updates
- Use OTA (Over-The-Air) updates with Expo
- Push updates without app store review
- Test updates thoroughly before pushing

```bash
# Publish update
expo publish

# Or with EAS Update
eas update --branch production
```

### Version Management

Update version in `app.json`:
```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    },
    "ios": {
      "buildNumber": "2"
    }
  }
}
```

## 🛠️ Troubleshooting

### Build Fails

1. Clear cache: `expo start -c`
2. Delete node_modules: `rm -rf node_modules && npm install`
3. Check eas.json configuration
4. Review build logs in Expo dashboard

### App Rejected

**Common reasons**:
- Missing privacy policy
- Incomplete app information
- Bugs or crashes
- Guideline violations
- Missing required screenshots

**Solution**: Address feedback and resubmit

## 📚 Resources

- [Expo Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Expo Application Services](https://expo.dev/eas)

## 💡 Tips

1. **Start with internal testing** before public release
2. **Use semantic versioning** (1.0.0, 1.0.1, 1.1.0)
3. **Keep changelog** for each version
4. **Test on real devices** before submitting
5. **Prepare marketing materials** in advance
6. **Plan for support** and user feedback
7. **Monitor reviews** and respond promptly

## 🎯 Quick Commands Reference

```bash
# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build Android APK (for testing)
eas build -p android --profile preview

# Build Android AAB (for Play Store)
eas build -p android --profile production

# Build iOS (for App Store)
eas build -p ios --profile production

# Submit to stores
eas submit -p android
eas submit -p ios

# Publish OTA update
expo publish
# or
eas update --branch production
```

---

**Ready to deploy?** Follow this guide step by step, and your app will be live on the app stores! 🚀
