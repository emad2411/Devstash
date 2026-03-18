import { defineConfig } from '@prisma/config'
import { config } from 'dotenv'
import { expand } from 'dotenv-expand'
import * as path from 'path'

// Load .env.local
const envPath = path.resolve(__dirname, '.env.local')
const envConfig = config({ path: envPath })
expand(envConfig)

export default defineConfig({
  earlyAccess: true,
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
})
