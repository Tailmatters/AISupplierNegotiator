import Link from 'next/link'
import { Metadata } from 'next'
import { ArrowRight, CheckCircle, ArrowUpRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Negotiator - Home',
  description: 'AI-powered procurement negotiation platform',
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold inline-block text-xl md:text-2xl text-gradient-primary">
                AI Negotiator
              </span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Link
                href="/auth"
                className="border rounded-md px-3 py-2 text-sm font-medium"
              >
                Login
              </Link>
              <Link
                href="/auth?tab=register"
                className="bg-primary text-primary-foreground rounded-md px-3 py-2 text-sm font-medium"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl">
                    Transform Your{" "}
                    <span className="text-gradient-primary">Procurement</span> With AI Negotiation
                  </h1>
                  <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Leverage AI to conduct effective negotiations with suppliers, analyze spend 
                    patterns, and optimize contracts across your entire procurement process.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="/auth?tab=register"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    href="#features"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 p-6 shadow-lg">
                  <div className="absolute inset-0 bg-grid-white/10 bg-[top_left_-1px] [mask-image:linear-gradient(to_bottom_right,white,transparent,white)]"></div>
                  <div className="relative h-full w-full overflow-hidden rounded-lg border bg-background p-6 shadow-md">
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-primary">AI</span>
                        </div>
                        <div className="text-sm font-medium">AI Negotiator</div>
                      </div>
                      <div className="rounded-lg bg-muted p-4">
                        <p className="text-sm">
                          Based on our analysis of your past orders with Supplier XYZ, we recommend 
                          a target price reduction of 8% and improved payment terms of Net 45. 
                          Would you like me to initiate a negotiation with these objectives?
                        </p>
                      </div>
                      <div className="rounded-lg bg-primary/10 p-4 self-end max-w-[80%]">
                        <p className="text-sm">
                          That sounds good. Please also try to negotiate a reduction in minimum order quantities.
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted p-4">
                        <p className="text-sm">
                          I'll add that to our objectives. Based on current market trends and your leverage with 
                          this supplier, we have a 76% probability of achieving these objectives.
                        </p>
                      </div>
                      <div className="flex space-x-2 self-end">
                        <button className="rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground">
                          Start Negotiation
                        </button>
                        <button className="rounded-md border px-3 py-1 text-xs">
                          Adjust Objectives
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Everything You Need for Smarter Procurement
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform integrates advanced AI with procurement best practices to deliver
                  a comprehensive solution for optimizing your supplier negotiations.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border bg-card p-6 shadow-sm card-hover">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <ArrowUpRight className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold">AI Negotiations</h3>
                <p className="mt-2 text-muted-foreground">
                  Automate and optimize supplier negotiations using AI that learns from your 
                  historical procurement data and industry benchmarks.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="mr-2 h-4 w-4 text-success" />
                    <span>Category-specific strategies</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="mr-2 h-4 w-4 text-success" />
                    <span>Performance tracking</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="mr-2 h-4 w-4 text-success" />
                    <span>Objective-based approach</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border bg-card p-6 shadow-sm card-hover">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Spend Analysis</h3>
                <p className="mt-2 text-muted-foreground">
                  Gain deep insights into your spending patterns with powerful analytics 
                  and visualization tools to identify savings opportunities.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="mr-2 h-4 w-4 text-success" />
                    <span>Category hierarchies</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="mr-2 h-4 w-4 text-success" />
                    <span>Supplier consolidation</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="mr-2 h-4 w-4 text-success" />
                    <span>Trend analysis</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border bg-card p-6 shadow-sm card-hover">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                    <path d="M10 9H8" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Contract Management</h3>
                <p className="mt-2 text-muted-foreground">
                  Streamline contract creation, approval, and tracking with templates and 
                  automated generation from negotiation outcomes.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="mr-2 h-4 w-4 text-success" />
                    <span>Template libraries</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="mr-2 h-4 w-4 text-success" />
                    <span>Auto-generation</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="mr-2 h-4 w-4 text-success" />
                    <span>Approval workflows</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border bg-card p-6 shadow-sm card-hover">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M20 6v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />
                    <path d="M2 6v12a2 2 0 0 0 2 2h2" />
                    <path d="M12 10v4" />
                    <path d="M16 10v4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Supplier Management</h3>
                <p className="mt-2 text-muted-foreground">
                  Maintain comprehensive supplier profiles, track performance, and 
                  manage relationships through a centralized system.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="mr-2 h-4 w-4 text-success" />
                    <span>Performance metrics</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="mr-2 h-4 w-4 text-success" />
                    <span>Communication history</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="mr-2 h-4 w-4 text-success" />
                    <span>Risk assessment</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border bg-card p-6 shadow-sm card-hover">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2v20" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Savings Tracking</h3>
                <p className="mt-2 text-muted-foreground">
                  Measure and report your procurement savings with detailed tracking 
                  and customizable dashboards to demonstrate value.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="mr-2 h-4 w-4 text-success" />
                    <span>Multi-method calculation</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="mr-2 h-4 w-4 text-success" />
                    <span>Executive reporting</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="mr-2 h-4 w-4 text-success" />
                    <span>Goal tracking</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border bg-card p-6 shadow-sm card-hover">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M3 3h18v18H3V3z" />
                    <path d="M3 9h18" />
                    <path d="M3 15h18" />
                    <path d="M9 3v18" />
                    <path d="M15 3v18" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Custom Dashboards</h3>
                <p className="mt-2 text-muted-foreground">
                  Create personalized dashboards with widgets that matter most to 
                  your role and procurement objectives.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="mr-2 h-4 w-4 text-success" />
                    <span>Drag-and-drop editor</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="mr-2 h-4 w-4 text-success" />
                    <span>Multiple layouts</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="mr-2 h-4 w-4 text-success" />
                    <span>Flexible widgets</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Ready to Transform Your Procurement Process?
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Join thousands of procurement professionals who are saving time, reducing costs, 
                  and improving supplier relationships with AI Negotiator.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link
                  href="/auth?tab=register"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  Get Started for Free
                </Link>
                <Link
                  href="#"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  Schedule a Demo
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t bg-muted">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              © {new Date().getFullYear()} AI Negotiator. All rights reserved.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}