"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { type ToastActionElement, type ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 10
const TOAST_REMOVE_DELAY = 5000

type ToastType = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

type ToasterToast = ToastType

type ToastContextType = {
  toasts: ToasterToast[]
  addToast: (toast: Omit<ToasterToast, "id">) => void
  updateToast: (props: ToasterToast) => void
  dismissToast: (toastId: string) => void
  removeToast: (toastId: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToasterToast[]>([])

  const addToast = (toast: Omit<ToasterToast, "id">) => {
    setToasts((existingToasts) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast = { id, ...toast }
      
      // If we already have the maximum number of toasts, remove the oldest one
      if (existingToasts.length >= TOAST_LIMIT) {
        return [...existingToasts.slice(1), newToast]
      }
      
      return [...existingToasts, newToast]
    })
  }

  const updateToast = (toast: ToasterToast) => {
    setToasts((prev) => prev.map((t) => (t.id === toast.id ? toast : t)))
  }

  const dismissToast = (toastId: string) => {
    setToasts((prev) =>
      prev.map((t) =>
        t.id === toastId ? { ...t, open: false } : t
      )
    )
  }

  const removeToast = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId))
  }

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        updateToast,
        dismissToast,
        removeToast,
      }}
    >
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  
  return {
    ...context,
    toast: (props: Omit<ToasterToast, "id">) => {
      context.addToast(props)
    },
  }
}