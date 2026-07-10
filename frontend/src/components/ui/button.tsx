import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--brand)] text-white hover:brightness-110 shadow-sm hover:shadow-md hover:shadow-[var(--brand-glow)]",
        destructive:
          "bg-[var(--critical)] text-white hover:brightness-110 shadow-sm",
        outline:
          "border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--background-secondary)] hover:text-[var(--foreground)]",
        secondary:
          "bg-[var(--background-secondary)] text-[var(--foreground)] hover:bg-[var(--background-tertiary)] border border-[var(--border)]",
        ghost:
          "text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)] hover:text-[var(--foreground)]",
        link: "text-[var(--brand)] underline-offset-4 hover:underline",
        cyber:
          "bg-[var(--cyber)] text-white hover:brightness-110 shadow-sm hover:shadow-md hover:shadow-[var(--cyber-glow)]",
        warm: "bg-gradient-to-r from-[#ff9044] to-[#ff6b35] text-white hover:brightness-110 shadow-sm",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-lg px-6 text-sm",
        xl: "h-12 rounded-xl px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
