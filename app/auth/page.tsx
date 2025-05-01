'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useAuth } from '@/hooks/use-auth'
import { insertUserSchema } from '@/schema'

// Form schema for login
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

// Form schema for registration with additional validation
const registerSchema = insertUserSchema
  .pick({
    username: true,
    password: true,
    name: true,
    email: true,
    company: true,
  })
  .extend({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type LoginFormValues = z.infer<typeof loginSchema>
type RegisterFormValues = z.infer<typeof registerSchema>

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState('login')

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      name: '',
      email: '',
      company: '',
    },
  })

  // Handle login form submission
  function onLoginSubmit(values: LoginFormValues) {
    loginMutation.mutate(values)
  }

  // Handle register form submission
  function onRegisterSubmit(values: RegisterFormValues) {
    registerMutation.mutate(values)
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto grid w-full max-w-[1200px] gap-6 md:grid-cols-2 lg:gap-12">
        {/* Left side: Auth form */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              AI Procurement Negotiator
            </h1>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Sign in to access your AI-powered negotiation platform
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Account Login</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter your password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center justify-center space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <button
                      className="text-primary underline"
                      onClick={() => setActiveTab('register')}
                    >
                      Register
                    </button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Register Form */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    Sign up for a new account to get started
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter your email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your company name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Create a password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Confirm your password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center justify-center space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button
                      className="text-primary underline"
                      onClick={() => setActiveTab('login')}
                    >
                      Login
                    </button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right side: Hero/Features */}
        <div className="hidden flex-col justify-center space-y-6 rounded-lg bg-muted p-10 md:flex">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter">
              Transform Your Procurement Process
            </h2>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our AI-powered platform optimizes supplier negotiations, increases savings, and streamlines contract management.
            </p>
          </div>
          <div className="grid gap-4 py-4">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M11 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5.5"/><path d="M18 14v4h4"/><path d="M18 18a4 4 0 0 0 4-4"/><path d="m12 12 8 8"/></svg>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">AI-Driven Negotiation</h3>
                <p className="text-sm text-muted-foreground">
                  Automate negotiations with suppliers based on past data and market trends.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">Spend Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive analytics to identify cost savings and supplier consolidation opportunities.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">Contract Management</h3>
                <p className="text-sm text-muted-foreground">
                  Generate and manage contracts with automatic templating and approval workflows.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-medium">JD</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-medium">TS</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-medium">RK</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Join over 10,000 procurement professionals
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}