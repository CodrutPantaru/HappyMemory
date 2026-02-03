import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pantarucodrut.happymemorymatch',
  appName: 'Happy Memory Match',
  webDir: 'dist/memory-game/browser',
  plugins: {
    AdMob: {
      appId: 'ca-app-pub-2750823075008793~7506783752'
    }
  }
};

export default config;

