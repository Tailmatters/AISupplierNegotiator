import Link from 'next/link'
import { ArrowRight, ShieldCheck, BarChart3, Users, FileText } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b">
        <div className="container flex items-center justify-between h-16 mx-auto px-4">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
            </svg>
            <span className="font-bold text-xl">AI Negotiator</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/auth"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/auth?tab=register"
              className="bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-background to-muted py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-4xl mx-auto">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
              AI-Powered Procurement
            </span>{' '}
            Negotiation Platform
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            Optimize supplier interactions through intelligent contract management, advanced analytics, and collaborative negotiation tools.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth?tab=register"
              className="bg-primary text-primary-foreground py-3 px-6 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              Start Negotiating <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/demo"
              className="bg-secondary text-secondary-foreground py-3 px-6 rounded-md hover:bg-secondary/90 transition-colors"
            >
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center">
            Streamline Your Procurement Process
          </h2>
          <p className="mt-4 text-center text-muted-foreground max-w-2xl mx-auto">
            Our platform combines artificial intelligence with procurement expertise
            to help you achieve better deals with less effort.
          </p>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-card rounded-lg p-6 border shadow-sm transition-transform hover:shadow-md hover:-translate-y-1">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Negotiation</h3>
              <p className="text-muted-foreground">
                Let our AI handle complex supplier negotiations based on your objectives and historical data.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 border shadow-sm transition-transform hover:shadow-md hover:-translate-y-1">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Spend Analysis</h3>
              <p className="text-muted-foreground">
                Gain deep insights into your spending patterns and identify consolidation opportunities.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 border shadow-sm transition-transform hover:shadow-md hover:-translate-y-1">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Supplier Management</h3>
              <p className="text-muted-foreground">
                Centralize supplier information and track performance across all your procurement activities.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 border shadow-sm transition-transform hover:shadow-md hover:-translate-y-1">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Contract Management</h3>
              <p className="text-muted-foreground">
                Automatically generate and manage contracts from negotiation outcomes with customizable templates.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="bg-muted py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Ready to Transform Your Procurement?</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Join procurement teams worldwide who are saving time and reducing costs with AI Negotiator.
          </p>
          <div className="mt-10">
            <Link
              href="/auth?tab=register"
              className="bg-primary text-primary-foreground py-3 px-8 rounded-md hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            >
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                </svg>
                <span className="font-bold text-xl">AI Negotiator</span>
              </div>
              <p className="mt-4 text-muted-foreground">
                Empowering procurement professionals with artificial intelligence.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/features" className="text-muted-foreground hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/integrations" className="text-muted-foreground hover:text-foreground transition-colors">
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link href="/roadmap" className="text-muted-foreground hover:text-foreground transition-colors">
                    Roadmap
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/guides" className="text-muted-foreground hover:text-foreground transition-colors">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link href="/webinars" className="text-muted-foreground hover:text-foreground transition-colors">
                    Webinars
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-muted-foreground hover:text-foreground transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-muted-foreground hover:text-foreground transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AI Negotiator. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}