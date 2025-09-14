import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined
}

const prismaClient = global.__prismaClient ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.__prismaClient = prismaClient
}

export default prismaClient


