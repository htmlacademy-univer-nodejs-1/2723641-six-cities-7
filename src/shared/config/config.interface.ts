export type AppConfig = {
  port: number;
  dbHost: string;
  salt: string;
  uploadDirectory: string;
};

export interface Config {
  get<K extends keyof AppConfig>(key: K): AppConfig[K];
}
