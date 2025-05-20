import React from 'react';

interface CheckBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const CheckBox = React.forwardRef<HTMLInputElement, CheckBoxProps>(
  ({ label = '', className = '', ...props }, ref) => {
    return (
      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          ref={ref}
          className={`h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 ${className}`}
          {...props}
        />
        {label && <span className="text-sm text-gray-700">{label}</span>}
      </label>
    );
  }
);

CheckBox.displayName = 'CheckBox';

export { CheckBox };
