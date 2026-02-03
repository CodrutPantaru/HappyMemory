import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.memorygame.app',
  appName: 'Happy Memory Match',
  webDir: 'dist/memory-game/browser',
  plugins: {
    AdMob: {
      appId: 'ca-app-pub-3940256099942544~3347511713'
    },
    SocialLogin: {
      providers: {
        google: true,
        facebook: false,
        apple: false,
        twitter: false
      },
      google: {
        webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
        mode: 'online'
      }
    }
  }
};

export default config;
