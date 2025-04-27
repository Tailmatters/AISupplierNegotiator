import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users } from "@/schema";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { User } from "@/schema";

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

export async function getUserByUsername(username: string) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  } catch (error) {
    console.error("Error getting user by username:", error);
    return null;
  }
}

export async function getUserById(id: number) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
}

export async function createUser(userData: {
  username: string;
  password: string;
  name: string;
  email: string;
  role?: string;
}) {
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
    console.error("Error creating user:", error);
    throw error;
  }
}

// Session management using cookies
const SESSION_COOKIE_NAME = "session";

export async function setSessionCookie(userId: number) {
  cookies().set({
    name: SESSION_COOKIE_NAME,
    value: userId.toString(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const sessionCookie = cookies().get(SESSION_COOKIE_NAME);
  if (!sessionCookie) return null;

  try {
    const userId = parseInt(sessionCookie.value);
    if (isNaN(userId)) return null;
    return await getUserById(userId);
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function logoutUser() {
  cookies().delete(SESSION_COOKIE_NAME);
}

// Authentication middleware-like functions
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth");
  }
  return user;
}

export async function requireGuest() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }
}