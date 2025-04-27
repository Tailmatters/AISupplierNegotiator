import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BarChart3, FileText, HandshakeIcon, Loader2 } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-blue-100 dark:bg-blue-800/30 px-3 py-1 text-sm dark:text-blue-300 text-blue-800 mb-4">
                AI-Powered Procurement
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
                Transform Your Supplier Negotiations with AI
              </h1>
              <p className="text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our AI negotiation platform empowers procurement professionals to achieve better outcomes through intelligent analysis, automated negotiations, and comprehensive spend management.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link
                  href="/auth"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  View Demo
                </Link>
              </div>
            </div>
            <div className="mx-auto flex items-center justify-center">
              <div className="relative w-[350px] h-[350px] sm:w-[400px] sm:h-[400px] md:w-[450px] md:h-[450px] lg:w-[500px] lg:h-[500px] rounded-lg border overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 opacity-20 dark:opacity-30" />
                <div className="relative z-10 p-8 text-center flex flex-col justify-center items-center h-full">
                  <div className="grid grid-cols-2 gap-6 w-full">
                    <div className="rounded-lg bg-white/90 dark:bg-gray-800/90 p-4 shadow-sm transition-transform hover:scale-105">
                      <BarChart3 className="h-8 w-8 mb-2 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-sm font-medium">Spend Analysis</h3>
                    </div>
                    <div className="rounded-lg bg-white/90 dark:bg-gray-800/90 p-4 shadow-sm transition-transform hover:scale-105">
                      <HandshakeIcon className="h-8 w-8 mb-2 text-emerald-600 dark:text-emerald-400" />
                      <h3 className="text-sm font-medium">AI Negotiation</h3>
                    </div>
                    <div className="rounded-lg bg-white/90 dark:bg-gray-800/90 p-4 shadow-sm transition-transform hover:scale-105">
                      <FileText className="h-8 w-8 mb-2 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="text-sm font-medium">Contract Management</h3>
                    </div>
                    <div className="rounded-lg bg-white/90 dark:bg-gray-800/90 p-4 shadow-sm transition-transform hover:scale-105">
                      <Loader2 className="h-8 w-8 mb-2 text-amber-600 dark:text-amber-400" />
                      <h3 className="text-sm font-medium">Supplier Analytics</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm dark:text-primary-foreground/80 text-primary mb-4">
                Key Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Everything You Need for Smarter Procurement</h2>
              <p className="max-w-[900px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our platform combines the power of AI with advanced analytics to transform your procurement workflows.
              </p>
            </div>
          </div>
          <div className="mx-auto grid gap-8 md:gap-12 mt-8 md:mt-16 max-w-5xl grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="rounded-full border p-4 bg-primary/5">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-900">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Transform Your Negotiations?</h2>
              <p className="max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of procurement professionals already saving time and money with our platform.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link
                href="/auth"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 bg-white dark:bg-gray-950 border-t">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-8 md:gap-12 grid-cols-2 md:grid-cols-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">Features</Link></li>
                <li><Link href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">Pricing</Link></li>
                <li><Link href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">Use Cases</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">About</Link></li>
                <li><Link href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">Blog</Link></li>
                <li><Link href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">Careers</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">Documentation</Link></li>
                <li><Link href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">Guides</Link></li>
                <li><Link href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">Support</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">Privacy</Link></li>
                <li><Link href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">Terms</Link></li>
                <li><Link href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex justify-between items-center mt-8 pt-8 border-t">
            <p className="text-xs text-gray-500 dark:text-gray-400">© 2025 AI Negotiator. All rights reserved.</p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">
                <span className="sr-only">Twitter</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">
                <span className="sr-only">LinkedIn</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">
                <span className="sr-only">GitHub</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    title: "AI-Powered Negotiations",
    description: "Let our AI handle repetitive supplier negotiations based on your objectives, saving time and improving outcomes.",
    icon: HandshakeIcon
  },
  {
    title: "Spend Analysis",
    description: "Visualize your procurement data with interactive dashboards and identify savings opportunities across categories.",
    icon: BarChart3
  },
  {
    title: "Contract Management",
    description: "Automatically generate, track, and manage contracts based on negotiation outcomes and templates.",
    icon: FileText
  },
  {
    title: "Supplier Performance",
    description: "Track and analyze supplier performance metrics to make informed sourcing decisions.",
    icon: BarChart3
  },
  {
    title: "Category Intelligence",
    description: "Access market insights and category-specific analysis to strengthen your negotiation position.",
    icon: Loader2
  },
  {
    title: "Custom Dashboards",
    description: "Create personalized dashboards with the metrics and KPIs that matter most to your procurement team.",
    icon: BarChart3
  }
]