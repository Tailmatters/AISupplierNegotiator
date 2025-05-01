import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/lib/db";
import { User, users } from "@/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// Convert callback-based scrypt to Promise-based
const scryptAsync = promisify(scrypt);

// Auth constants
const JWT_SECRET = process.env.SESSION_SECRET || "your-super-secret-key";
const TOKEN_NAME = "auth-token";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Use TextEncoder to convert the secret to Uint8Array as required by jose
const secretKey = new TextEncoder().encode(JWT_SECRET);

/**
 * Hash a password with salt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

/**
 * Compare a supplied password with a stored hashed password
 */
export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * Generate a JWT token for a user
 */
export async function generateToken(user: User): Promise<string> {
  const { password, ...userWithoutPassword } = user;
  
  return new SignJWT({ ...userWithoutPassword })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Token expires in 7 days
    .sign(secretKey);
}

/**
 * Set the token in a cookie
 */
export async function setTokenCookie(token: string): Promise<void> {
  cookies().set({
    name: TOKEN_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  });
}

/**
 * Clear the token cookie
 */
export async function clearTokenCookie(): Promise<void> {
  cookies().set({
    name: TOKEN_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

/**
 * Verify that a JWT token is valid
 */
export async function verifyToken(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(TOKEN_NAME)?.value;
  
  if (!token) return false;
  
  try {
    await jwtVerify(token, secretKey);
    return true;
  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
}

/**
 * Get user object from token in request
 */
export async function getUserFromToken(req: NextRequest): Promise<User | null> {
  const token = req.cookies.get(TOKEN_NAME)?.value;
  
  if (!token) return null;
  
  try {
    const verified = await jwtVerify(token, secretKey);
    const userId = verified.payload.id as number;
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    return user || null;
  } catch (error) {
    console.error("Error getting user from token:", error);
    return null;
  }
}