/* eslint-env node */
/**
 * Starts Vue CLI with Node's OpenSSL legacy provider on Node 17+.
 *
 * Webpack 4/5 and babel-loader hash caches with MD4. OpenSSL 3, shipped in
 * Node 17 and later, refuses that algorithm and webpack fails with
 * "error:0308010C:digital envelope routines::unsupported".
 *
 * The flag has to be in NODE_OPTIONS before the Node process that runs
 * vue-cli-service starts. Passing --openssl-legacy-provider as a
 * vue-cli-service argument does not do that. This wrapper is the npm script
 * entry so `npm run serve` and `npm run build` work on macOS, Linux, and
 * Windows without a prior export. An existing NODE_OPTIONS value is kept,
 * and the flag is added only when it is missing. Node 16 and older reject
 * the flag, so it is left off there.
 */
const { spawn } = require('child_process')
const { existsSync } = require('fs')
const path = require('path')

const flag = '--openssl-legacy-provider'
const major = Number(process.versions.node.split('.')[0])
const env = { ...process.env }

if (major >= 17) {
  const current = env.NODE_OPTIONS || ''
  if (!current.includes(flag)) {
    env.NODE_OPTIONS = `${current} ${flag}`.trim()
  }
}

const bin = path.join(
  __dirname,
  '..',
  'node_modules',
  '@vue',
  'cli-service',
  'bin',
  'vue-cli-service.js'
)

if (!existsSync(bin)) {
  console.error('vue-cli-service is not installed. Run npm install.')
  process.exit(1)
}

const child = spawn(process.execPath, [bin, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env
})

child.on('error', (error) => {
  console.error(error)
  process.exit(1)
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.exit(1)
  }
  process.exit(code == null ? 1 : code)
})
