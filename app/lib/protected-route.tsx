"use client"

import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { ReactNode, useEffect } from "react"

interface ProtectedRouteProps {
  children: ReactNode
  fallbackUrl?: string
}

export function ProtectedRoute({
  children,
  fallbackUrl = "/auth",
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !user && pathname !== fallbackUrl) {
      router.push(fallbackUrl)
    }
  }, [isLoading, user, router, pathname, fallbackUrl])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user && pathname !== fallbackUrl) {
    return null
  }

  return <>{children}</>
}