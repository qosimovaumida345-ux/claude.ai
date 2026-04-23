import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.claudefanmade.app',
  appName: 'Claude Fan-Made',
  // Saytni to'g'ridan-to'g'ri yuklaydi — backend shart emas
  server: {
    url: 'https://claude-ai-8iev.onrender.com',
    cleartext: false
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
}

export default config