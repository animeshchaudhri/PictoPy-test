import { ElectronAPI } from "@electron-toolkit/preload";

// src/custom.d.ts
interface CustomAPI {
  getHomeDir: () => Promise<string>
  readDir: (dirPath: string) => Promise<{ name: string; isDir: boolean }[]>
  resolvePath: (...paths: string[]) => Promise<string>
}

interface Window {
  electron: ElectronAPI & CustomAPI
}
