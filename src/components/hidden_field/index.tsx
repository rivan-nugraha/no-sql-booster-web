import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface HiddenFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  positionIcon: 'left' | 'right' | 'none'
}

const HiddenField = React.forwardRef<HTMLInputElement, HiddenFieldProps>(
  (props, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <>
        <input
          type={showPassword ? 'text' : 'password'}
          ref={ref}
          className={`
            w-full rounded-md border px-3 py-2 text-sm shadow-sm transition bg-white border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200
            ${props.positionIcon === 'left' ? 'pl-10' : ''}
          `}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </>
    );
  }
);

HiddenField.displayName = 'HiddenField';

export { HiddenField };
