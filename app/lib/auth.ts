import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { JWTPayload } from "next-auth/jwt";
import { db } from "@/lib/db";
import { User, users } from "@/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// Constants
const JWT_SECRET = process.env.SESSION_SECRET || "your-secret-key";
const COOKIE_NAME = "auth-token";
const EXPIRATION = 60 * 60 * 24 * 7; // 7 days in seconds

// Helper functions for password hashing
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

// Authentication functions
export async function login(username: string, password: string): Promise<User | null> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (!user) {
      return null;
    }

    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
}

// JWT token functions
export async function generateToken(user: User): Promise<string> {
  const payload: JWTPayload & { userId: number; role: string } = {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    sub: String(user.id),
    exp: Math.floor(Date.now() / 1000) + EXPIRATION,
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(JWT_SECRET));
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getUserFromToken(token: string): Promise<User | null> {
  const payload = await verifyToken(token);
  if (!payload || !payload.userId) {
    return null;
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId as number));
    return user || null;
  } catch (error) {
    console.error("Error fetching user from token:", error);
    return null;
  }
}

// Cookie management
export async function setAuthCookie(response: NextResponse, token: string) {
  const cookieStore = cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: EXPIRATION,
  });
}

export async function getAuthToken(request: NextRequest): Promise<string | null> {
  // Try to get from cookie
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    return token;
  }

  // Try to get from Authorization header
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return null;
}

export async function clearAuthCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Authentication middleware
export async function authenticateRequest(
  request: NextRequest
): Promise<User | null> {
  const token = await getAuthToken(request);
  if (!token) {
    return null;
  }

  return await getUserFromToken(token);
}

// Function to get the current authenticated user
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  return await getUserFromToken(token);
}