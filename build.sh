#!/bin/bash
npm install --legacy-peer-deps
export NODE_OPTIONS=--openssl-legacy-provider
rm -rf dist
npm test
npm run build