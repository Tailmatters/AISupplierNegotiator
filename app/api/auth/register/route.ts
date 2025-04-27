import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByUsername, setSessionCookie } from "@/lib/auth";
import { insertUserSchema } from "@/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validatedFields = insertUserSchema.safeParse(body);
    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validatedFields.error.errors },
        { status: 400 }
      );
    }
    
    const { username, password, name, email, role } = validatedFields.data;
    
    // Check if username already exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }
    
    // Create new user
    const user = await createUser({
      username,
      password,
      name,
      email,
      role,
    });
    
    // Set session cookie
    await setSessionCookie(user.id);
    
    // Return user data without password
    return NextResponse.json({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}