import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import {
  ToastActionElement,
  type ToastProps,
} from "@/components/ui/toast";

type ToastType = ToastProps & {
  id: string;
  title?: string;
  description?: string;
  action?: ToastActionElement;
};

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000;

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setToasts((toasts) => {
        const now = Date.now();
        const firstToast = toasts[0];
        
        if (firstToast && (now - firstToast.createdAt) > TOAST_REMOVE_DELAY) {
          return toasts.slice(1);
        }
        
        return toasts;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((toasts) => toasts.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant, action }: ToastType) => {
      setToasts((toasts) => {
        const id = Math.random().toString(36).slice(2, 11);
        const newToast = {
          id,
          title,
          description,
          variant,
          action,
          createdAt: Date.now(),
        };

        // Check if we already have a similar toast
        const hasSimilarToast = toasts.some(
          (toast) => 
            toast.title === title && 
            toast.description === description
        );

        if (hasSimilarToast) {
          return toasts;
        }

        // Limit number of toasts
        const updatedToasts = [
          ...toasts,
          newToast,
        ].slice(-TOAST_LIMIT);

        return updatedToasts;
      });
    },
    []
  );

  // Special toast for unauthorized errors that redirects to auth page
  const unauthorizedToast = useCallback(() => {
    toast({
      id: "unauthorized",
      title: "Authentication Required",
      description: "Please login to continue",
      variant: "destructive",
    });
    
    // Redirect to auth page after a short delay
    setTimeout(() => {
      router.push("/auth");
    }, 1500);
  }, [toast, router]);

  return {
    toast,
    toasts,
    dismissToast,
    unauthorizedToast,
  };
};