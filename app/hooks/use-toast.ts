'use client'

import { useState, useEffect, useContext, createContext } from 'react'

import type {
  ToastActionElement,
  ToastProps,
} from '@/components/ui/toast'

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

type ToastContextType = {
  toasts: ToasterToast[]
  toast: (props: Omit<ToasterToast, 'id'>) => void
  dismiss: (toastId?: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [toasts, setToasts] = useState<ToasterToast[]>([])

  const toast = ({ ...props }: Omit<ToasterToast, 'id'>) => {
    const id = crypto.randomUUID()
    const newToast = { id, ...props }
    
    setToasts((prevToasts) => {
      const activeToasts = prevToasts.filter(
        (toast) => toast.id !== 'TOAST_LIMIT_REACHED'
      )
      
      if (activeToasts.length >= TOAST_LIMIT) {
        activeToasts.pop()
        activeToasts.push({
          id: 'TOAST_LIMIT_REACHED',
          title: 'Toast limit reached',
          description: 'Too many active notifications.',
          variant: 'destructive',
        })
        return activeToasts
      }
      
      return [newToast, ...prevToasts]
    })
    
    return id
  }

  const dismiss = (toastId?: string) => {
    if (toastId) {
      setToasts((prevToasts) =>
        prevToasts.filter((toast) => toast.id !== toastId)
      )
    } else {
      setToasts([])
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Dismiss all toasts when Escape key is pressed
      if (event.key === 'Escape') {
        dismiss()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  
  return context
}