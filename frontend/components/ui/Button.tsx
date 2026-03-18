interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
}

export function Button({ children, variant = "primary", className = "", onClick }: ButtonProps) {
  const baseClasses = "flex items-center justify-center rounded-[16px] font-mono text-[13px] font-semibold transition-all";
  
  const variantClasses = {
    primary: "bg-[var(--color-accent-orange)] text-[var(--color-text-on-accent)] hover:opacity-90",
    secondary: "border-2 border-[var(--color-text-secondary)] text-[var(--color-text-primary)] hover:border-[var(--color-text-primary)]",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
