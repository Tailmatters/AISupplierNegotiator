import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/lib/db";
import { User, users } from "@/schema";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

// Constants for JWT handling
const JWT_SECRET = process.env.SESSION_SECRET || "default-secret-key-change-in-production";
const TOKEN_NAME = "auth_token";
const TOKEN_EXPIRY = "24h";

// Use promisify to convert callback-based functions to promise-based
const scryptAsync = promisify(scrypt);

/**
 * Hash a password using scrypt
 * @param password The plain text password to hash
 * @returns A string in the format "hash.salt"
 */
export async function hashPassword(password: string): Promise<string> {
  // Generate a random salt
  const salt = randomBytes(16).toString("hex");
  
  // Hash the password with the salt
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  
  // Return the hash and salt together
  return `${derivedKey.toString("hex")}.${salt}`;
}

/**
 * Compare a plain text password with a stored hashed password
 * @param plainPassword The plain text password to verify
 * @param hashedPassword The stored hashed password (in "hash.salt" format)
 * @returns True if the password matches, false otherwise
 */
export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  // Split the hash and salt
  const [hash, salt] = hashedPassword.split(".");
  
  // Hash the plain password with the same salt
  const derivedKey = (await scryptAsync(plainPassword, salt, 64)) as Buffer;
  
  // Compare the hashes in constant time (to prevent timing attacks)
  return timingSafeEqual(
    Buffer.from(hash, "hex"),
    derivedKey
  );
}

/**
 * Generate a JWT token for a user
 * @param user The user to generate a token for
 * @returns The JWT token
 */
export async function generateToken(user: User): Promise<string> {
  const { password, ...userPayload } = user;
  
  return new SignJWT(userPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(new TextEncoder().encode(JWT_SECRET));
}

/**
 * Set the token cookie in the response
 * @param token The JWT token to set in the cookie
 */
export async function setTokenCookie(token: string): Promise<void> {
  cookies().set({
    name: TOKEN_NAME,
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 24 hours in seconds
    sameSite: "lax",
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
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    sameSite: "lax",
  });
}

/**
 * Verify a JWT token from the request
 * @param request The NextRequest object
 * @returns True if the token is valid, false otherwise
 */
export async function verifyToken(request: NextRequest): Promise<boolean> {
  try {
    const token = request.cookies.get(TOKEN_NAME)?.value;
    
    if (!token) {
      return false;
    }
    
    // Verify the token
    await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    
    return true;
  } catch (error) {
    console.error("Token verification error:", error);
    return false;
  }
}

/**
 * Get the user from the token in the request
 * @param request The NextRequest object
 * @returns The user if found and valid, null otherwise
 */
export async function getUserFromToken(request: NextRequest): Promise<User | null> {
  try {
    const token = request.cookies.get(TOKEN_NAME)?.value;
    
    if (!token) {
      return null;
    }
    
    // Verify and decode the token
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    
    if (!payload.id) {
      return null;
    }
    
    // Get the user from the database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.id as number));
    
    return user || null;
  } catch (error) {
    console.error("Get user from token error:", error);
    return null;
  }
}