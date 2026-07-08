"use client";

import React, { InputHTMLAttributes, forwardRef } from "react";

interface StableInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "onKeyDown"> {
  onChangeAction?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDownAction?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const StableInput = forwardRef<HTMLInputElement, StableInputProps>(
  ({ onChangeAction, onKeyDownAction, ...props }, ref) => {
    return <input ref={ref} onChange={onChangeAction} onKeyDown={onKeyDownAction} {...props} />;
  }
);

StableInput.displayName = "StableInput";

export default StableInput;
