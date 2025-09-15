import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4e2896ff8c7d4b0c9326485feb5f70f2',
  appName: 'swiftnotes',
  webDir: 'dist',
  server: {
    url: 'https://4e2896ff-8c7d-4b0c-9326-485feb5f70f2.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;