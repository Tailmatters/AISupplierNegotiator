"use client"

import { useState, useEffect, useCallback } from "react"
import { type ToastActionElement, type ToastProps } from "@/components/ui/toast"

// Toast interface
export interface Toast extends ToastProps {
  id: string
  title?: string
  description?: string
  action?: ToastActionElement
  duration?: number
}

// Return type of useToast hook
export interface UseToastReturn {
  toasts: Toast[]
  toast: (props: Omit<Toast, "id">) => void
  dismiss: (toastId: string) => void
  dismissAll: () => void
}

// Auto-dismiss timeout in milliseconds
const DEFAULT_TOAST_DURATION = 5000

/**
 * Custom hook for managing toast notifications
 */
export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([])

  // Dismiss a specific toast by ID
  const dismiss = useCallback((toastId: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== toastId))
  }, [])

  // Dismiss all toasts
  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  // Create a new toast notification
  const toast = useCallback(
    ({ ...props }: Omit<Toast, "id">) => {
      const id = crypto.randomUUID()
      const duration = props.duration || DEFAULT_TOAST_DURATION

      setToasts((prevToasts) => [...prevToasts, { id, ...props }])

      // Auto-dismiss toast after duration
      if (duration > 0) {
        setTimeout(() => {
          dismiss(id)
        }, duration)
      }

      return id
    },
    [dismiss]
  )

  // Clean up toasts on unmount
  useEffect(() => {
    return () => {
      setToasts([])
    }
  }, [])

  return {
    toasts,
    toast,
    dismiss,
    dismissAll,
  }
}

// Create a singleton instance of useToast for global usage
let toastState: UseToastReturn | undefined

/**
 * Get or create the toast state
 */
export function getToastState(): UseToastReturn {
  if (!toastState) {
    throw new Error("Toast state not initialized")
  }
  
  return toastState
}

/**
 * Set the toast state
 */
export function setToastState(state: UseToastReturn) {
  toastState = state
}