# Web Bluetooth Terminal - Web App

Builds static website to `dist` which is then commited to the `gh-pages` branch and further automatically deployed to
GitHub Pages. The `gh-pages` branch keeps the history of the changes and ability to manually introduce any needed
changes.

## Development

Requires Node.js v22 (for development only).

### Build Dependencies

`bluetooth-terminal`, `normalize.css`.

### Development Dependencies

Lint: `@eslint/js`, `eslint`, `eslint-config-google`, `globals`.

Styles: `sass`.

Manual build process: `browser-sync`, `copyfiles`, `rimraf`.

Deployment: `gh-pages`.

### Icons and Manifest

Icons are generated from single source: `web-app/assets/icon.png` with https://realfavicongenerator.net

On top of what manifest realfavicongenerator.net created, also added `start_url` and `"purpose": "maskable any"` for
`192x192` icon added - these are required.

To fulfill other parameters in Google Chrome I added:

* `description`
* `orientation`

* https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable#required_manifest_members
* https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/start_url
* https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/icons#purpose
* https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/description
* https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/orientation
