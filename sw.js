importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');

const VERSION = '1.4.0';
const FILES = [
  'css/normalize.css',
  'css/styles.css',
  'icons/apple-touch-icon.png',
  'icons/favicon-96x96.png',
  'icons/favicon.ico',
  'icons/favicon.svg',
  'icons/web-app-manifest-192x192.png',
  'icons/web-app-manifest-512x512.png',
  'js/BluetoothTerminal.js',
  'js/main.js',
  'js/register-sw.js',
  'index.html',
  'site.webmanifest',
];

workbox.precaching.precacheAndRoute(FILES.map((url) => ({url, revision: VERSION})));
workbox.routing.setDefaultHandler(new workbox.strategies.NetworkFirst());
