#!/bin/bash
npm install --legacy-peer-deps
export NODE_OPTIONS=--openssl-legacy-provider
npm run build