import { ElectronAPI } from '@electron-toolkit/preload'

interface CustomElectronAPI {
  getHomeDir: () => Promise<string>
  readDir: (dirPath: string) => Promise<{ name: string; isDir: boolean }[]>
  resolvePath: (...paths: string[]) => Promise<string>
}
declare global {
  interface Window {
    electron: ElectronAPI & CustomElectronAPI
  }
}
