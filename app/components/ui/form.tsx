"use client"

import * as React from "react"
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
  type UseFormProps,
  useForm,
  type UseFormReturn,
  type ControllerRenderProps,
  type FieldError,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

interface FormProps<T extends FieldValues> extends React.FormHTMLAttributes<HTMLFormElement> {
  form: UseFormReturn<T>
  onSubmit: (values: T) => void
}

const Form = <T extends FieldValues>({ form, onSubmit, className, ...props }: FormProps<T>) => (
  <FormProvider {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className={className} {...props} />
  </FormProvider>
)

interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName
  field: ControllerRenderProps<TFieldValues, TName>
  formItemId: string
  error?: FieldError
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  const formItemId = React.useId()
  
  return (
    <Controller
      {...props}
      render={({ field, formState }) => (
        <FormFieldContext.Provider
          value={{
            name: props.name,
            field,
            formItemId,
            error: formState.errors[props.name] as FieldError,
          }}
        >
          {props.render ? props.render({ field, formState }) : null}
        </FormFieldContext.Provider>
      )}
    />
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  
  if (!fieldContext) {
    throw new Error("useFormField must be used within a FormField")
  }
  
  const { field, formItemId, error } = fieldContext
  
  const { register } = useFormContext()
  
  return {
    formItemId,
    error,
    ...field,
  }
}

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    )
  }
)
FormItem.displayName = "FormItem"

interface FormLabelProps extends React.ComponentPropsWithoutRef<typeof Label> {
  required?: boolean
}

const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  FormLabelProps
>(({ className, required, ...props }, ref) => {
  const { error, formItemId } = useFormField()
  
  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    >
      {props.children}
      {required && <span className="ml-1 text-destructive">*</span>}
    </Label>
  )
})
FormLabel.displayName = "FormLabel"

interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  ({ ...props }, ref) => {
    const { error, formItemId, ...rest } = useFormField()
    
    return (
      <div ref={ref} id={formItemId} {...props} />
    )
  }
)
FormControl.displayName = "FormControl"

interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  FormDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-[0.8rem] text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  name?: string
}

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, name, ...props }, ref) => {
    const { error, formItemId } = useFormField()
    const formState = useFormContext().formState
    
    const fieldError = name ? formState.errors[name] : error
    const body = fieldError ? String(fieldError.message) : children
    
    if (!body) {
      return null
    }
    
    return (
      <p
        ref={ref}
        id={`${formItemId}-message`}
        className={cn("text-[0.8rem] font-medium text-destructive", className)}
        {...props}
      >
        {body}
      </p>
    )
  }
)
FormMessage.displayName = "FormMessage"

/**
 * Creates a form with Zod validation
 * @param schema Zod schema for form validation
 * @param options Additional options for useForm
 * @returns UseFormReturn with zodResolver
 */
function useZodForm<T extends z.ZodType>(
  schema: T,
  options?: Omit<UseFormProps<z.infer<T>>, "resolver">
): UseFormReturn<z.infer<T>> {
  return useForm<z.infer<T>>({
    ...options,
    resolver: zodResolver(schema),
  })
}

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
  useZodForm,
}