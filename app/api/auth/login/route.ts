import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { comparePasswords, generateToken, setTokenCookie } from "@/lib/auth";
import { loginSchema } from "@/schema";
import { db } from "@/lib/db";
import { users } from "@/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/auth/login
 * Authenticates a user and creates a session
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Find user by username
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, validatedData.username));

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Verify password
    const passwordValid = await comparePasswords(
      validatedData.password,
      user.password
    );

    if (!passwordValid) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Generate authentication token
    const token = await generateToken(user);
    
    // Set token in HTTP-only cookie
    setTokenCookie(token);

    // Return user data (without password)
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Login error:", error);

    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}