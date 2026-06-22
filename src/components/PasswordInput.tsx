"use client";

import { useState, InputHTMLAttributes, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, className = "", ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="form-group">
        {label && <label className="form-label">{label}</label>}
        <div className="password-input-wrapper">
          <input
            ref={ref}
            type={visible ? "text" : "password"}
            className={`form-input password-input ${className}`}
            {...props}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setVisible(!visible)}
            aria-label={visible ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
