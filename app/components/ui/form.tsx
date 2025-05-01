"use client";

import * as React from "react";
import {
  useForm as useHookForm,
  UseFormProps as UseHookFormProps,
  UseFormReturn,
  FieldValues,
  FormProvider,
  SubmitHandler,
  SubmitErrorHandler,
  useFormContext,
  Controller,
  ControllerProps,
  FieldPath,
} from "react-hook-form";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Extended useForm function that wraps the one from react-hook-form
export function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any
>(props?: UseHookFormProps<TFieldValues, TContext>): UseFormReturn<TFieldValues, TContext> {
  return useHookForm<TFieldValues, TContext>(props);
}

// Custom Form wrapper that uses FormProvider
type FormProps<TFieldValues extends FieldValues = FieldValues, TContext = any> = {
  form: UseFormReturn<TFieldValues, TContext>;
  children: React.ReactNode;
  className?: string;
  onSubmit: SubmitHandler<TFieldValues>;
  onError?: SubmitErrorHandler<TFieldValues>;
};

export const Form = <TFieldValues extends FieldValues = FieldValues, TContext = any>({
  form,
  children,
  className,
  onSubmit,
  onError,
}: FormProps<TFieldValues, TContext>) => {
  return (
    <FormProvider {...form}>
      <form
        className={className}
        onSubmit={form.handleSubmit(onSubmit, onError)}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  );
};

// Form item wrapper that shows the label and error message for a form field
type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

export const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

export const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  const { id } = React.useContext(FormItemContext);

  return (
    <Label
      ref={ref}
      className={cn(className)}
      htmlFor={id}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

export const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => {
  const { id } = React.useContext(FormItemContext);

  return <div ref={ref} id={id} {...props} />;
});
FormControl.displayName = "FormControl";

export const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { id } = React.useContext(FormItemContext);

  return (
    <p
      ref={ref}
      id={`${id}-description`}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

export const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { id } = React.useContext(FormItemContext);
  const { formState } = useFormContext();
  const fieldName = id.replace("react-aria", "");
  const error = fieldName ? formState.errors[fieldName] : null;
  const body = error ? String(error.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={`${id}-message`}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

// Custom Field component for controlled inputs
export const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return <Controller {...props} />;
};