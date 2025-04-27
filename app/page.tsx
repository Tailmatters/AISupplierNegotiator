import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  BarChart3,
  FileText,
  HandshakeIcon,
  LineChart,
  ShieldCheck,
  Users,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container px-4 py-24 md:px-6 lg:flex lg:items-center lg:gap-12">
          <div className="lg:w-1/2 space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
              AI-Powered Procurement Negotiation
            </h1>
            <p className="text-xl text-muted-foreground">
              Transform your procurement process with intelligent negotiation, advanced analytics, 
              and strategic supplier management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="font-semibold">
                <Link href="/dashboard">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="font-semibold">
                <Link href="/auth">Sign In</Link>
              </Button>
            </div>
          </div>
          <div className="hidden lg:block lg:w-1/2">
            <div className="relative">
              <div className="absolute -left-8 -top-8 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
              <div className="absolute -right-8 -bottom-8 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
              <div className="relative rounded-xl border bg-card p-8 shadow-xl">
                <div className="grid gap-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <HandshakeIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Negotiation Intelligence</h3>
                      <p className="text-muted-foreground">AI-powered negotiation strategies</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-blue-400/10 p-2">
                      <BarChart3 className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Spend Analysis</h3>
                      <p className="text-muted-foreground">Uncover savings opportunities</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-green-400/10 p-2">
                      <FileText className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Contract Management</h3>
                      <p className="text-muted-foreground">Streamlined contract workflows</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="container px-4 py-16 md:px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-4">
            <div className="inline-flex rounded-lg bg-primary/10 p-3">
              <HandshakeIcon className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">AI Negotiation</h2>
            <p className="text-muted-foreground">
              Our AI analyzes past negotiation data to identify optimal strategies, 
              automatically negotiating with suppliers based on your objectives.
            </p>
          </div>
          <div className="space-y-4">
            <div className="inline-flex rounded-lg bg-primary/10 p-3">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Spend Analysis</h2>
            <p className="text-muted-foreground">
              Gain insights into your procurement spending with comprehensive 
              analytics by supplier, category, and time period.
            </p>
          </div>
          <div className="space-y-4">
            <div className="inline-flex rounded-lg bg-primary/10 p-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Supplier Management</h2>
            <p className="text-muted-foreground">
              Maintain a comprehensive view of your supplier relationships, 
              track performance, and identify consolidation opportunities.
            </p>
          </div>
          <div className="space-y-4">
            <div className="inline-flex rounded-lg bg-primary/10 p-3">
              <LineChart className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Market Analysis</h2>
            <p className="text-muted-foreground">
              Porter's Five Forces analysis for each category provides strategic 
              insights to guide your negotiation approach.
            </p>
          </div>
          <div className="space-y-4">
            <div className="inline-flex rounded-lg bg-primary/10 p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Contract Management</h2>
            <p className="text-muted-foreground">
              Automatically generate contracts from negotiation outcomes using 
              your pre-defined templates for each category.
            </p>
          </div>
          <div className="space-y-4">
            <div className="inline-flex rounded-lg bg-primary/10 p-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Objective Assurance</h2>
            <p className="text-muted-foreground">
              Set negotiation objectives with confidence, knowing our system 
              will notify you if supplier offers don't meet your criteria.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to transform your procurement process?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Join procurement professionals worldwide who are saving time and 
            money with our AI-powered platform.
          </p>
          <Button asChild size="lg" className="mt-8 font-semibold">
            <Link href="/auth">
              Get Started Today <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card mt-auto">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold">ProcurementAI</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Transforming procurement through artificial intelligence and strategic insights.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold">Platform</h4>
                <ul className="mt-2 space-y-2 text-sm">
                  <li>
                    <Link href="/features" className="text-muted-foreground hover:text-foreground">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="/roadmap" className="text-muted-foreground hover:text-foreground">
                      Roadmap
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold">Company</h4>
                <ul className="mt-2 space-y-2 text-sm">
                  <li>
                    <Link href="/about" className="text-muted-foreground hover:text-foreground">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold">Legal</h4>
              <ul className="mt-2 space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ProcurementAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}