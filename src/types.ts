import { Plugin } from 'vite';
export interface JoshDevFrConfig {
  input?: string | string[];
  publicDirectory?: string;
  buildDirectory?: string;
  hotFile?: string;
}
// Type alias for the plugin function, tying it to the config interface
export type JoshDevFr = (config?: JoshDevFrConfig) => Plugin;