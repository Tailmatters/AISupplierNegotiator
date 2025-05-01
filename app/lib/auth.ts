import { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/lib/db";
import { User, users } from "@/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// Use promisify to convert callback-based scrypt to Promise-based
const scryptAsync = promisify(scrypt);

// JWT token settings
const JWT_SECRET = process.env.SESSION_SECRET || "your-secret-key";
const TOKEN_NAME = "auth-token";
const EXPIRATION = 60 * 60 * 24 * 7; // 7 days in seconds

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(
  supplied: string,
  stored: string
): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Token generation
export async function generateToken(user: User): Promise<string> {
  const { password, ...userWithoutPassword } = user;

  // Create a JWT that expires in 7 days
  const token = await new SignJWT({ ...userWithoutPassword })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + EXPIRATION)
    .sign(new TextEncoder().encode(JWT_SECRET));

  return token;
}

// Set token in cookies
export function setTokenCookie(token: string) {
  const cookieStore = cookies();
  
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: EXPIRATION,
    path: "/",
  });
}

// Clear auth cookie
export function clearTokenCookie() {
  const cookieStore = cookies();
  
  cookieStore.set(TOKEN_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
}

// Verify token
export async function verifyToken(token: string): Promise<User | null> {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );

    return verified.payload as unknown as User;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

// Authenticate user from request
export async function authenticateRequest(
  request: NextRequest
): Promise<User | null> {
  try {
    // Check for token in cookies
    const token = request.cookies.get(TOKEN_NAME)?.value;
    
    if (!token) {
      return null;
    }

    // Verify token
    const user = await verifyToken(token);
    
    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

// User database operations
export async function getUserByUsername(username: string): Promise<User | undefined> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    
    return user;
  } catch (error) {
    console.error("Error getting user by username:", error);
    return undefined;
  }
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    return user;
  } catch (error) {
    console.error("Error getting user by email:", error);
    return undefined;
  }
}

export async function getUserById(id: number): Promise<User | undefined> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    
    return user;
  } catch (error) {
    console.error("Error getting user by id:", error);
    return undefined;
  }
}