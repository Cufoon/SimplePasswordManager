interface ElectronAPI {
  openFile(): Promise<string>;

  readFile(path: string, password: string): Promise<string>;

  writeFile(path: string, password: string, content: string): Promise<boolean>;

  getEK(): Promise<string>;

  setEK(ek: string): Promise<void>;

  clearEK(): Promise<void>;
}

declare interface Window {
  readonly electronAPI: ElectronAPI;
}
