import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="font-bold text-xl">AI Procurement</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link 
              href="/auth" 
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Login
            </Link>
            <Button asChild>
              <Link href="/auth?register=true">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    AI-Powered Procurement Negotiation
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Optimize supplier interactions with our intelligent platform. Analyze spend, manage negotiations, and generate contracts effortlessly.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/dashboard">
                      Explore Dashboard
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/auth">
                      Login
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-[350px] sm:h-[450px] sm:w-[450px] md:h-[550px] md:w-[550px] lg:h-[550px] lg:w-[550px]">
                  <svg 
                    viewBox="0 0 200 200"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute inset-0 h-full w-full"
                  >
                    <path
                      fill="#0070f3"
                      d="M47.5,-57.2C59,-47.8,64.4,-30.9,67.7,-13.5C71,3.9,72.3,21.8,64.5,34.9C56.8,48,40,56.4,22.8,63.3C5.7,70.3,-11.9,75.9,-27.4,71.3C-42.9,66.7,-56.4,51.9,-65.7,34.4C-75,16.8,-80.2,-3.5,-76.1,-21.8C-72,-40.1,-58.6,-56.4,-42.7,-64.8C-26.9,-73.1,-8.5,-73.5,7.9,-71.4C24.4,-69.3,36,-66.7,47.5,-57.2Z"
                      transform="translate(100 100)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-blue-500"
                          >
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                          </svg>
                          <span className="text-lg font-bold">Spend Analysis</span>
                        </div>
                        <div className="h-40 w-64 rounded-md bg-gray-100 flex items-center justify-center">
                          <span className="text-sm text-gray-500">Interactive charts and analysis tools</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Streamline Your Procurement Process
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform helps procurement professionals save time and reduce costs with AI-powered tools.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
                <div className="rounded-full bg-primary p-2 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Advanced Analytics</h3>
                <p className="text-center text-muted-foreground">
                  Comprehensive spend visibility and category analysis to identify savings opportunities.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
                <div className="rounded-full bg-primary p-2 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">AI Negotiation</h3>
                <p className="text-center text-muted-foreground">
                  Let AI handle routine negotiations while you focus on strategic relationships.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
                <div className="rounded-full bg-primary p-2 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" x2="8" y1="13" y2="13" />
                    <line x1="16" x2="8" y1="17" y2="17" />
                    <line x1="10" x2="8" y1="9" y2="9" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Contract Management</h3>
                <p className="text-center text-muted-foreground">
                  Automated contract generation and lifecycle management to ensure compliance.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8 md:py-12">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span className="font-bold">AI Procurement</span>
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              Empowering procurement professionals with AI tools for better supplier management and cost savings.
            </p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">Features</Link></li>
                <li><Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">Pricing</Link></li>
                <li><Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">FAQ</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">About</Link></li>
                <li><Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">Terms</Link></li>
                <li><Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">Privacy</Link></li>
                <li><Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">Cookies</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="container py-4 text-center text-sm text-muted-foreground md:text-left">
          <p>© {new Date().getFullYear()} AI Procurement. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}