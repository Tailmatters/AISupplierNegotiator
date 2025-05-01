import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, generateToken, setTokenCookie } from "@/lib/auth";
import { insertUserSchema } from "@/schema";
import { db } from "@/lib/db";
import { users } from "@/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/auth/register - Register a new user
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const validatedData = insertUserSchema.parse(body);

    // Check if username already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, validatedData.username));

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const [existingEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email));

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create the user
    const [newUser] = await db
      .insert(users)
      .values({
        ...validatedData,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Generate a token
    const token = await generateToken(newUser);

    // Set the token in a cookie
    await setTokenCookie(token);

    // Return the user without password
    const { password, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.format() },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}