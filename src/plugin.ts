import fs from 'fs';
import path from 'path';
import { Plugin } from 'vite';
import { resolveDevServerUrl } from './utils.js';
import { JoshDevFr, JoshDevFrConfig } from './types.js'; 

/**
 * Vite plugin for PHP MVC Framework by JoshDevFr
 * Handles hot file generation for development and manifest management for production
 */
const joshdevFr: JoshDevFr = (config: JoshDevFrConfig = {}) => {
  const {
    input = ['resources/js/app.js'],
    publicDirectory = 'public',
    buildDirectory = 'build',
    hotFile = 'hot',
  } = config;

  let viteDevServerUrl: string;
  const pluginName = 'vite-plugin-joshdevfr';

  return {
    name: pluginName,
    enforce: 'post',

    config: (userConfig, { command }) => {
      const baseOptions = {
        build: {
          manifest: true,
          outDir: path.join(publicDirectory, buildDirectory),
          rollupOptions: {
            input: Array.isArray(input) ? input : [input],
          },
        },
      };

      if (command === 'serve') {
        return {
          base: '',
          ...baseOptions,
        };
      }

      return {
        base: `/${buildDirectory}/`,
        ...baseOptions,
      };
    },

    configureServer(server) {
      const hotFilePath = path.join(publicDirectory, hotFile);

      if (!fs.existsSync(publicDirectory)) {
        fs.mkdirSync(publicDirectory, { recursive: true });
      }

      return () => {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/__joshdevfr_vite_ping') {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('pong');
            return;
          }
          next();
        });
      };
    },

    configResolved(config) {
      viteDevServerUrl = resolveDevServerUrl(config);
    },

    async buildStart() {
      const hotFilePath = path.join(publicDirectory, hotFile);

      if (this.meta.watchMode || process.env.NODE_ENV === 'development') {
        const url = viteDevServerUrl || 'http://localhost:5173';
        fs.writeFileSync(hotFilePath, url);
        console.log(`\n  ${pluginName}: Hot file created at ${hotFilePath}`);
      } else {
        if (fs.existsSync(hotFilePath)) {
          fs.unlinkSync(hotFilePath);
        }
      }
    },

    buildEnd() {
      const hotFilePath = path.join(publicDirectory, hotFile);

      if (fs.existsSync(hotFilePath) && !this.meta.watchMode) {
        fs.unlinkSync(hotFilePath);
      }
    },

    closeBundle() {
      const hotFilePath = path.join(publicDirectory, hotFile);

      if (fs.existsSync(hotFilePath)) {
        fs.unlinkSync(hotFilePath);
        console.log(`\n  ${pluginName}: Hot file removed`);
      }
    },

    writeBundle() {
      const viteManifestPath = path.join(
        publicDirectory,
        buildDirectory,
        '.vite',
        'manifest.json'
      );

      const targetManifestPath = path.join(
        publicDirectory,
        buildDirectory,
        'manifest.json'
      );

      if (fs.existsSync(viteManifestPath)) {
        const manifest = fs.readFileSync(viteManifestPath, 'utf-8');

        fs.writeFileSync(targetManifestPath, manifest);

        fs.rmSync(path.join(publicDirectory, buildDirectory, '.vite'), {
          recursive: true,
          force: true,
        });

        console.log(
          `\n  ${pluginName}: Manifest moved to ${targetManifestPath}`
        );
      }
    },
  };
}

export default joshdevFr;