'use client'

import * as React from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

type ToastActionElement = React.ReactElement<unknown, string | React.JSXElementConstructor<any>>

type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: ToastActionElement
  variant?: ToastType
  duration?: number
  onOpenChange?: (open: boolean) => void
}

type Toast = ToastProps

type ToasterToast = Required<Pick<ToastProps, 'id'>> & Partial<ToastProps>

type ToastContextType = {
  toasts: ToasterToast[]
  toast: (props: Omit<ToastProps, 'id'>) => void
  dismiss: (toastId?: string) => void
}

const ToastContext = React.createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([])

  const toast = React.useCallback(
    ({ ...props }: Omit<ToastProps, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9)
      
      setToasts((prevToasts) => [
        ...prevToasts,
        { id, ...props } as ToasterToast,
      ])

      return id
    },
    []
  )

  const dismiss = React.useCallback((toastId?: string) => {
    setToasts((prevToasts) =>
      toastId
        ? prevToasts.filter((toast) => toast.id !== toastId)
        : []
    )
  }, [])

  // Auto dismiss toasts after duration
  React.useEffect(() => {
    const timeouts = toasts.map((toast) => {
      const duration = toast.duration || 5000
      return setTimeout(() => {
        dismiss(toast.id)
        toast.onOpenChange?.(false)
      }, duration)
    })

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [toasts, dismiss])

  const value = React.useMemo(
    () => ({
      toasts,
      toast,
      dismiss,
    }),
    [toasts, toast, dismiss]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return context
}