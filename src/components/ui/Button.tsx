import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "gold" | "ghost" | "outline";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  gold: "btn-gold",
  ghost: "btn-ghost",
  outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", className = "", children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`${variantClass[variant]} text-sm px-4 py-2 rounded-lg font-medium inline-flex items-center gap-1.5 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
});

export default Button;
