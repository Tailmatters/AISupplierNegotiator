import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { comparePasswords, generateToken, setAuthCookie } from "@/lib/auth";
import { loginSchema, users } from "@/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const { username, password } = loginSchema.parse(body);
    
    // Find the user by username
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    
    // Check if the user exists and the password is correct
    if (!user || !(await comparePasswords(password, user.password))) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }
    
    // Generate a JWT token
    const token = await generateToken(user);
    
    // Create a successful response without the password
    const response = NextResponse.json({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    
    // Set the auth cookie
    await setAuthCookie(response, token);
    
    return response;
  } catch (error) {
    console.error("Login error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}