import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { users } from '@/schema';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

interface User {
  id: number;
  username: string;
  name: string;
  email?: string;
  role?: string;
  createdAt?: string;
  password?: string;
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  try {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return undefined;
  }
}

export async function getUserById(id: number): Promise<User | undefined> {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return undefined;
  }
}

export async function createUser(userData: {
  username: string;
  password: string;
  name: string;
  email?: string;
}): Promise<User | undefined> {
  try {
    const hashedPassword = await hashPassword(userData.password);
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();
    
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    return undefined;
  }
}

export async function createSession(userId: number) {
  const cookieStore = cookies();
  const sessionToken = randomBytes(32).toString('hex');
  
  cookieStore.set({
    name: 'session_token',
    value: sessionToken,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
  
  // Store session in database or memory store as needed
  
  return sessionToken;
}

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('session_token')?.value;
  
  if (!sessionToken) {
    return null;
  }
  
  // Retrieve user ID from session store based on token
  // For now we'll use a placeholder user ID
  const userId = 1; // Replace with actual lookup
  
  const user = await getUserById(userId);
  return user || null;
}

export async function deleteSession() {
  const cookieStore = cookies();
  cookieStore.delete('session_token');
  
  // Remove session from database or memory store as needed
}

export async function getCurrentUser() {
  try {
    return await getSessionUser();
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}