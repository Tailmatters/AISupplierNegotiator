import { db } from '@/lib/db'
import { users, type User } from '@/schema'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { eq } from 'drizzle-orm'
import { scrypt, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

// JWT settings
const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'default-secret-change-in-production'
)
const COOKIE_NAME = 'auth_token'
const EXPIRATION = '30d'

// Password hashing
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const buf = (await scryptAsync(password, salt, 64)) as Buffer
  return `${buf.toString('hex')}.${salt}`
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split('.')
  const hashedBuf = Buffer.from(hashed, 'hex')
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer
  return timingSafeEqual(hashedBuf, suppliedBuf)
}

// JWT token generation and verification
export async function createToken(user: Omit<User, 'password'>) {
  const token = await new SignJWT({ id: user.id, username: user.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRATION)
    .sign(JWT_SECRET)

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  return token
}

export async function verifyToken() {
  const token = cookies().get(COOKIE_NAME)?.value

  if (!token) {
    throw new Error('Authentication token is missing')
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    throw new Error('Invalid authentication token')
  }
}

export async function getUserFromToken() {
  try {
    const payload = await verifyToken()
    
    if (!payload.id) {
      return null
    }
    
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, Number(payload.id)))
    
    return user || null
  } catch (error) {
    return null
  }
}

export async function logout() {
  cookies().set(COOKIE_NAME, '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'lax',
    path: '/',
  })
}