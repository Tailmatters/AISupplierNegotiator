import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { JWTPayload } from "next-auth/jwt";
import { db } from "@/lib/db";
import { users, User } from "@/schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// Convert callback-based scrypt to promise-based
const scryptAsync = promisify(scrypt);

// Use a solid JWT secret from environment variables
const JWT_SECRET = process.env.SESSION_SECRET || "development_secret_key";
const TOKEN_NAME = "auth-token";

// Max age for the JWT token in seconds (default: 30 days)
const MAX_AGE = 60 * 60 * 24 * 30;

/**
 * Hashes a password using scrypt
 * @param password The password to hash
 * @returns The hashed password with salt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

/**
 * Compares a password with a stored hash
 * @param supplied The password to compare
 * @param stored The stored password hash
 * @returns True if the passwords match, false otherwise
 */
export async function comparePasswords(
  supplied: string,
  stored: string
): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * Generates a JWT token for a user
 * @param user User object
 * @returns JWT token
 */
export async function generateToken(user: User): Promise<string> {
  // Create a payload with user data (excluding password)
  const payload = {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  // Create and sign the token
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(new TextEncoder().encode(JWT_SECRET));

  return token;
}

/**
 * Sets the authentication cookie in the response
 * @param response NextResponse object
 * @param token JWT token
 */
export async function setAuthCookie(
  response: NextResponse,
  token: string
): Promise<void> {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
    sameSite: "lax" as const,
  };

  response.cookies.set(TOKEN_NAME, token, cookieOptions);
}

/**
 * Gets the authentication token from the request
 * @param request NextRequest object
 * @returns The JWT token or null
 */
export async function getAuthToken(
  request: NextRequest
): Promise<string | null> {
  const token = request.cookies.get(TOKEN_NAME)?.value;
  return token || null;
}

/**
 * Clears the authentication cookie
 * @param response NextResponse object
 */
export async function clearAuthCookie(
  response?: NextResponse
): Promise<NextResponse> {
  const res = response || NextResponse.json({ success: true });
  res.cookies.delete(TOKEN_NAME);
  return res;
}

/**
 * Verifies a JWT token
 * @param token JWT token
 * @returns Decoded payload or null if invalid
 */
export async function verifyToken(token: string): Promise<any | null> {
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

/**
 * Authenticates a request using JWT
 * @param request NextRequest object
 * @returns User object or null if not authenticated
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<User | null> {
  try {
    // Get the JWT token from cookies
    const token = await getAuthToken(request);
    if (!token) return null;

    // Verify the token
    const payload = await verifyToken(token);
    if (!payload || !payload.id) return null;

    // Find the user in the database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.id))
      .limit(1);

    return user || null;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}