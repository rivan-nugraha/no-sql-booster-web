 
import * as React from 'react';
import {
  Controller,
  useFormContext,
} from 'react-hook-form';
import type {
  ControllerProps,
  FieldPath,
  FieldValues} from 'react-hook-form';

// FormProvider context
const FormContext = React.createContext<any>(undefined);

interface FormProviderProps {
  formName: string;
  children: React.ReactNode;
}

const FormProvider: React.FC<FormProviderProps> = ({ formName, children }) => {
  return <FormContext.Provider value={{ formName }}>{children}</FormContext.Provider>;
};

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    throw new Error('useFormField must be used within a FormField');
  }

  const fieldStateResult = getFieldState(fieldContext.name, formState);

  return {
    name: fieldContext.name,
    ...fieldStateResult,
  };
};

const FormItem: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = "", ...props }) => {
  return <div className={`flex flex-col gap-1 ${className}`} {...props} />;
};

const FormLabel: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, className = "", ...props }) => {
  const { error } = useFormField();
  return (
    <label className={`text-sm font-medium ${error ? 'text-red-500' : 'text-gray-700'} ${className}`} {...props}>
      {children}
    </label>
  );
};

interface FormControlProps extends React.InputHTMLAttributes<HTMLInputElement> {
  renderInput?: (props: React.InputHTMLAttributes<HTMLInputElement>) => React.ReactNode;
}

const FormControl: React.FC<FormControlProps> = ({ renderInput, className = "", ...props }) => {
  const { name, error } = useFormField();

  return (
    <div className="w-full">
      {renderInput ? (
        renderInput({ name, className: `${error ? 'border-red-500' : ''} ${className}`, ...props })
      ) : (
        <input
          id={name}
          name={name}
          className={`w-full px-3 py-2 border rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${className}`}
          {...props}
        />
      )}
      {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
    </div>
  );
};

const FormDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className = "", ...props }) => {
  return (
    <p className={`text-xs text-gray-500 ${className}`} {...props}>
      {children}
    </p>
  );
};

const FormMessage: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className = "", ...props }) => {
  const { error } = useFormField();
  if (!error) return null;
  return (
    <p className={`text-sm text-red-500 ${className}`} {...props}>
      {error.message}
    </p>
  );
};

const UseFormName = () => {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error('useFormName must be used within a FormProvider');
  }
  return context.formName;
};

export {
  FormProvider,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  UseFormName,
};
