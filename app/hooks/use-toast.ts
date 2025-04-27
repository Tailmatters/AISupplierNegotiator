'use client'

import * as React from 'react'
import { useState, useEffect, createContext, useContext } from 'react'

export type ToastType = 'default' | 'success' | 'error' | 'loading' | 'destructive'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastType
  duration?: number
  action?: React.ReactNode
}

export interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  updateToast: (id: string, toast: Partial<Toast>) => void
}

export const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  
  const { addToast, removeToast, updateToast } = context
  
  const toast = (props: Omit<Toast, 'id'>) => {
    return addToast(props)
  }
  
  return {
    ...context,
    toast
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  // Remove toast after duration
  useEffect(() => {
    const timeouts = toasts.map((toast) => {
      if (toast.duration === Infinity) return undefined

      const timeout = setTimeout(() => {
        removeToast(toast.id)
      }, toast.duration || 5000)

      return timeout
    })

    return () => {
      timeouts.forEach((timeout) => timeout && clearTimeout(timeout))
    }
  }, [toasts])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prevToasts) => [...prevToasts, { id, ...toast }])
    return id
  }

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  const updateToast = (id: string, toast: Partial<Toast>) => {
    setToasts((prevToasts) =>
      prevToasts.map((t) => (t.id === id ? { ...t, ...toast } : t))
    )
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, updateToast }}>
      {children}
    </ToastContext.Provider>
  )
}