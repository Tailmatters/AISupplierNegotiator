import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { login, generateToken, setAuthCookie } from "@/lib/auth";
import { loginSchema } from "@/schema";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = loginSchema.parse(body);
    
    // Attempt to log in the user
    const user = await login(validatedData.username, validatedData.password);
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }
    
    // Generate a JWT token
    const token = await generateToken(user);
    
    // Create the response
    const response = NextResponse.json(
      {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      { status: 200 }
    );
    
    // Set the auth cookie in the response
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
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}