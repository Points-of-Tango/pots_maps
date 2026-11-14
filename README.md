# post-maps

## Project setup
```
npm install --legacy-peer-deps
```

`npm install` without that flag fails on npm 7 and newer: `@vue/eslint-config-standard@8` wants ESLint 8, and this project still uses ESLint 7. That conflict predates the UKATA restyle.

`npm run serve` and `npm run build` run Vue CLI through `scripts/vue-cli.js`. On Node 17 and newer that launcher sets `NODE_OPTIONS=--openssl-legacy-provider` before the CLI process starts. OpenSSL 3 rejects the MD4 hash used by webpack and babel-loader (`error:0308010C:digital envelope routines::unsupported`). Passing `--openssl-legacy-provider` as an argument to `vue-cli-service` does not reach Node, so it does not fix the error. The launcher is cross-platform, leaves an existing `NODE_OPTIONS` value intact, and adds the flag only when it is missing. Node 16 and older do not understand the flag, so it is not added there.

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
