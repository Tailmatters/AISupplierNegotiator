"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

export function AuthTabs() {
  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="register">Register</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <div className="space-y-4 p-4 pt-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to access your account and continue your negotiation workflows
            </p>
          </div>
          <LoginForm />
        </div>
      </TabsContent>
      <TabsContent value="register">
        <div className="space-y-4 p-4 pt-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Create an account</h2>
            <p className="text-sm text-muted-foreground">
              Register to start using AI-powered negotiation tools
            </p>
          </div>
          <RegisterForm />
        </div>
      </TabsContent>
    </Tabs>
  );
}