"use client"

import * as React from "react"
import {
  useForm as useHookForm,
  type UseFormProps,
  type UseFormReturn,
  type FieldValues,
  type SubmitHandler,
  type UseFormStateReturn,
  type Path,
  type FieldPath,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import * as z from "zod"

type FormProps<T extends FieldValues> = {
  form: UseFormReturn<T>
  onSubmit: SubmitHandler<T>
  className?: string
  children: React.ReactNode
}

type FormFieldContextValue<
  T extends FieldValues = FieldValues,
  P extends Path<T> = Path<T>,
> = {
  name: P
}

type FormItemContextValue = {
  id: string
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

function useForm<T extends z.ZodType>({
  schema,
  defaultValues,
  ...rest
}: Omit<UseFormProps<z.infer<T>>, "resolver"> & {
  schema: T
}) {
  return useHookForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
    ...rest,
  })
}

function useFormContext<T extends FieldValues>() {
  return React.useContext(
    React.createContext({} as UseFormReturn<T>)
  ) as UseFormReturn<T>;
}

function Form<T extends FieldValues>({
  form,
  onSubmit,
  className,
  children,
}: FormProps<T>) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
      {children}
    </form>
  )
}

function FormField<
  T extends FieldValues,
  P extends Path<T>,
>({
  name,
  ...props
}: {
  name: P
} & Omit<React.ComponentPropsWithoutRef<"div">, "name">) {
  const id = React.useId()
  const context = useFormContext<T>()

  return (
    <FormFieldContext.Provider value={{ name }}>
      <FormItemContext.Provider value={{ id }}>
        <div {...props} />
      </FormItemContext.Provider>
    </FormFieldContext.Provider>
  )
}

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { formItemId } = useFormField()

  return (
    <div
      ref={ref}
      id={formItemId}
      className={cn("space-y-2", className)}
      {...props}
    />
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export {
  useForm,
  useFormContext,
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
  FormField,
}