'use client'

import * as React from 'react'
import {
  useForm as useHookForm,
  UseFormProps,
  SubmitHandler,
  UseFormReturn,
  FieldValues,
  FieldPath,
  FieldPathValue,
  Controller,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as LabelPrimitive from '@radix-ui/react-label'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { z } from 'zod'

const Form = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
>(
  props: React.PropsWithChildren<{
    form: UseFormReturn<TFieldValues, TContext>
    onSubmit?: SubmitHandler<TFieldValues>
    className?: string
  }>,
) => {
  const { form, onSubmit, children, className, ...rest } = props

  return (
    <form
      className={className}
      onSubmit={onSubmit && form.handleSubmit(onSubmit)}
      {...rest}
    >
      {children}
    </form>
  )
}

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
  field: UseFormReturn<TFieldValues>['register'](name: TName)
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: {
  name: TName
  control: UseFormReturn<TFieldValues>['control']
  render: ({
    field,
    formState,
  }: {
    field: {
      name: TName
      value: FieldPathValue<TFieldValues, TName>
      onChange: (value: FieldPathValue<TFieldValues, TName>) => void
      onBlur: () => void
      ref: React.RefCallback<HTMLInputElement>
      disabled?: boolean
    }
    formState: UseFormReturn<TFieldValues>['formState']
  }) => React.ReactElement
}) => {
  return (
    <Controller
      control={props.control}
      name={props.name}
      render={({ field, formState }) => {
        return (
          <FormFieldContext.Provider value={{ name: props.name, field }}>
            {props.render({ field, formState })}
          </FormFieldContext.Provider>
        )
      }}
    />
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>')
  }
  return fieldContext
}

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('space-y-2', className)} {...props} />
  )
})
FormItem.displayName = 'FormItem'

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { name } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(className)}
      htmlFor={name}
      {...props}
    />
  )
})
FormLabel.displayName = 'FormLabel'

const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => {
  const { field } = useFormField()

  return (
    <Slot
      ref={ref}
      id={field.name}
      name={field.name}
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      {...props}
    />
  )
})
FormControl.displayName = 'FormControl'

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { name } = useFormField()

  return (
    <p
      ref={ref}
      id={`${name}-description`}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
})
FormDescription.displayName = 'FormDescription'

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { name, field } = useFormField()

  // Get errors from the form state
  const formContext = React.useContext(FormFieldContext)
  const formState = formContext ? formContext['field']?.formState : null
  const errors = formState?.errors

  const error = errors?.[name]
  const errorMessage = error?.message
  
  if (!errorMessage) {
    return null
  }

  return (
    <p
      ref={ref}
      id={`${name}-error`}
      className={cn('text-sm font-medium text-destructive', className)}
      {...props}
    >
      {errorMessage}
    </p>
  )
})
FormMessage.displayName = 'FormMessage'

export {
  useHookForm as useForm,
  zodResolver,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
}