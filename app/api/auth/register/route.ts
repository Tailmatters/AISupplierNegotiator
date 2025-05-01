import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { hashPassword, generateToken, setTokenCookie } from "@/lib/auth";
import { insertUserSchema } from "@/schema";
import { db } from "@/lib/db";
import { users } from "@/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/auth/register
 * Registers a new user and creates a session
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = insertUserSchema.parse(body);

    // Check if username already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, validatedData.username));

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email));

    if (existingEmail.length > 0) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        ...validatedData,
        password: hashedPassword,
      })
      .returning();

    // Generate authentication token
    const token = await generateToken(newUser);
    
    // Set token in HTTP-only cookie
    setTokenCookie(token);

    // Return user data (without password)
    const { password, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}