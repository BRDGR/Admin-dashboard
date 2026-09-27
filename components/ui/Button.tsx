"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none active:scale-[0.99]",
  {
    variants: {
      variant: {
        primary: "bg-[#0364FF] hover:bg-[#0252d4] text-white shadow-xs",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200/80",
        outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        danger: "bg-red-600 hover:bg-red-700 text-white shadow-xs",
      },
      size: {
        sm: "h-8 px-3 text-[11px]",
        md: "h-9 px-4",
        lg: "h-10 px-5 text-sm",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export function Button({ className, variant, size, isLoading, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin shrink-0" />}
      {children}
    </button>
  );
}
