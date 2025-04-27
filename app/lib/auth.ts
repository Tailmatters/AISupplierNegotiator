import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import * as schema from "@/schema";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export interface RegisterData {
  username: string;
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

// Session management
const SESSION_COOKIE_NAME = "ai_negotiator_session";

// User authentication
export async function register(data: RegisterData) {
  // Check if user already exists
  const existingUser = await getUserByUsername(data.username);
  if (existingUser) {
    throw new Error("Username already exists");
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password);

  // Create user
  const [user] = await db.insert(schema.users).values({
    username: data.username,
    password: hashedPassword,
    name: data.name,
    email: data.email,
    role: "buyer", // Default role
  }).returning();

  if (!user) {
    throw new Error("Failed to create user");
  }

  await createSession(user.id);

  // Return user without password
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function login(data: LoginData) {
  const user = await getUserByUsername(data.username);
  if (!user) {
    throw new Error("Invalid username or password");
  }

  const isPasswordValid = await comparePasswords(data.password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid username or password");
  }

  await createSession(user.id);

  // Return user without password
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function logout() {
  const cookie = cookies();
  const sessionId = cookie.get(SESSION_COOKIE_NAME)?.value;
  
  if (sessionId) {
    cookie.delete(SESSION_COOKIE_NAME);
  }
  
  return true;
}

export async function createSession(userId: number) {
  const sessionId = randomBytes(32).toString("hex");
  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // Session lasts 7 days
  
  const cookie = cookies();
  cookie.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    expires,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  
  return sessionId;
}

export async function getCurrentUser() {
  const cookie = cookies();
  const sessionId = cookie.get(SESSION_COOKIE_NAME)?.value;
  
  if (!sessionId) {
    return null;
  }
  
  try {
    const user = await getUserById(1); // Replace with actual session lookup
    if (!user) return null;
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function getUserById(id: number) {
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
  return user || null;
}

export async function getUserByUsername(username: string) {
  const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
  return user || null;
}