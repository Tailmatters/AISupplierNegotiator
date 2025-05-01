import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { comparePasswords, generateToken, setTokenCookie } from "@/lib/auth";
import { loginSchema } from "@/schema";
import { db } from "@/lib/db";
import { users } from "@/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/auth/login - Authenticate a user
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Find the user by username
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, validatedData.username));

    // If no user found or password doesn't match
    if (!user || !(await comparePasswords(validatedData.password, user.password))) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Generate a token
    const token = await generateToken(user);

    // Set the token in a cookie
    await setTokenCookie(token);

    // Return the user without password
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Login error:", error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.format() },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}