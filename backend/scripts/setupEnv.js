import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { generateKeyPairSync } from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envPath = path.join(__dirname, '..', '.env')

let env = fs.existsSync(envPath)
  ? fs.readFileSync(envPath, 'utf8')
  : 'PORT=3000\n'

function hasEnv(key) {
  return new RegExp(`^${key}=.+$`, 'm').test(env)
}

function upsertEnv(key, value) {
  const line = `${key}=${value}`
  const regex = new RegExp(`^${key}=.*$`, 'm')

  if (regex.test(env)) {
    env = env.replace(regex, line)
  } else {
    env += `\n${line}`
  }
}

if (!hasEnv('PORT')) {
  upsertEnv('PORT', '3000')
}

if (!hasEnv('JWT_PRIVATE_KEY_B64') || !hasEnv('JWT_PUBLIC_KEY_B64')) {
  const { privateKey, publicKey } = generateKeyPairSync('ec', {
    namedCurve: 'P-256',
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    },
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    }
  })

  upsertEnv('JWT_PRIVATE_KEY_B64', Buffer.from(privateKey).toString('base64'))
  upsertEnv('JWT_PUBLIC_KEY_B64', Buffer.from(publicKey).toString('base64'))

  fs.writeFileSync(envPath, env.trim() + '\n')
  console.log('JWT keys generated automatically.')
} else {
  console.log('JWT keys already exist.')
}