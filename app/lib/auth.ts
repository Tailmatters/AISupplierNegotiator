import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import * as schema from '@/schema';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

// Promisify the callback-based scrypt function
const scryptAsync = promisify(scrypt);

// Session token settings
const SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days
const TOKEN_KEY = 'auth_token';

/**
 * Hash a password using scrypt with a random salt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

/**
 * Compare a plaintext password with a stored hash
 */
export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * Generate a secure random session token
 */
function generateToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string): Promise<schema.User | undefined> {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username));
  
  return user;
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<schema.User | undefined> {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id));
  
  return user;
}

/**
 * Create a new user
 */
export async function createUser(userData: schema.InsertUser): Promise<schema.User> {
  const [user] = await db
    .insert(schema.users)
    .values(userData)
    .returning();
  
  return user;
}

/**
 * Create and store a new session for the user
 */
export async function createSession(user: schema.User): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY);
  
  // In a production app, you would store the session in a database table
  // For this example, we'll use a secure HTTP-only cookie
  await cookies().set({
    name: TOKEN_KEY,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    path: '/',
  });
  
  // Update the user's last login timestamp
  await db
    .update(schema.users)
    .set({ last_login: new Date() })
    .where(eq(schema.users.id, user.id));
  
  return token;
}

/**
 * Get the current session token from cookies
 */
export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = cookies();
  const token = cookieStore.get(TOKEN_KEY);
  return token?.value;
}

/**
 * Destroy the current session
 */
export async function destroySession(): Promise<void> {
  await cookies().delete(TOKEN_KEY);
}

/**
 * Login a user with username and password
 */
export async function login(username: string, password: string): Promise<schema.User | null> {
  const user = await getUserByUsername(username);
  
  if (!user || !(await comparePasswords(password, user.password))) {
    return null;
  }
  
  await createSession(user);
  return user;
}

/**
 * Register a new user
 */
export async function register(userData: schema.InsertUser): Promise<schema.User | null> {
  // Check if username already exists
  const existingUser = await getUserByUsername(userData.username);
  
  if (existingUser) {
    return null;
  }
  
  // Hash the password
  const hashedPassword = await hashPassword(userData.password);
  
  // Create the user with the hashed password
  const user = await createUser({
    ...userData,
    password: hashedPassword,
  });
  
  // Create a session for the new user
  await createSession(user);
  
  return user;
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<schema.User | null> {
  try {
    // In a real application with sessions stored in a database,
    // you would look up the session by token and find the associated user
    // For this example, we'll simulate that by returning the user directly
    const token = await getSessionToken();
    
    if (!token) {
      return null;
    }
    
    // Here, in a production app, you would validate the token
    // For now, we'll just return a mock user to demonstrate the flow
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.last_login, new Date()));
    
    return user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}