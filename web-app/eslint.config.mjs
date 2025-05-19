import js from '@eslint/js';
import {defineConfig} from 'eslint/config';
import google from 'eslint-config-google';
import globals from 'globals';

// @see https://stackoverflow.com/a/79327789
delete google.rules['valid-jsdoc'];
delete google.rules['require-jsdoc'];

export default defineConfig([
  {
    extends: [
      'js/recommended',
      google,
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        BluetoothTerminal: 'readonly',
        importScripts: 'readonly',
        workbox: 'readonly',
      },
    },
    plugins: {
      js,
    },
    rules: {
      'max-len': ['error', {
        code: 120,
      }],
    },
  },
]);
