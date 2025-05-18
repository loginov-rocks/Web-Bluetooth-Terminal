# Web Bluetooth Terminal - Web App

Builds static website to `dist` which is then commited to the `gh-pages` branch and further automatically deployed to
GitHub Pages. The `gh-pages` branch keeps the history of the changes and ability to manually introduce any needed
changes.

## Development

Requires Node.js v22 (for development only).

### Build Dependencies

`bluetooth-terminal`, `normalize.css`, `sw-toolbox`.

### Development Dependencies

Lint: `@eslint/js`, `eslint`, `eslint-config-google`, `globals`.

Styles: `sass`.

Manual build process: `browser-sync`, `copyfiles`, `rimraf`.

Deployment: `gh-pages`.

### Tools

* https://realfavicongenerator.net to generate icons and manifest.
