"use client";

import { Input as ShadcnInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputProps {
  type?: string;
  label?: string;
  placeholder?: string;
  value?: string | number | undefined;
  onChange?: (value: string) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
}

export default function Input({
  type = "text",
  label,
  placeholder,
  value,
  onChange,
  disabled,
  min,
  max,
}: InputProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <Label className="text-sm font-medium text-muted-foreground">
          {label}
        </Label>
      )}

      <ShadcnInput
        type={type}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        min={min}
        max={max}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full"
      />
    </div>
  );
}
