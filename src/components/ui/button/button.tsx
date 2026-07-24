import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { Loader2 } from "lucide-react";

// 1. RECETA DE ESTILOS CON CVA
// eslint-disable-next-line react-refresh/only-export-components
export const buttonVariants = cva(
  // -> Estilos BASE: Se aplican a absolutamente todos los botones
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]",
  {
variants: {
      variant: {
        // El botón protagonista con tu degradado personalizado
        primary: "bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-md hover:shadow-lg hover:from-cyan-600 hover:to-teal-700",
        
        // Estándar de color entero (el que usamos en los paneles)
        solid: "bg-teal-600 text-white hover:bg-teal-700 shadow-sm",
        
        // Botón suave con borde sutil (el que usamos para "Cancelar" o "Registrar Paciente")
        soft: "bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-100",
        
        // Alternativa secundaria sin borde
        secondary: "bg-teal-100 text-teal-700 hover:bg-teal-200", 
        
        // Acción destructiva
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm", 
        
        // Botón solo con borde
        outline: "border-2 border-teal-600 text-teal-600 hover:bg-teal-50 bg-transparent",
        
        // Botón invisible sin fondo (Ideal para iconos)
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-transparent",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-base",
        lg: "h-12 px-6 text-lg",
        icon: "h-10 w-10 justify-center p-0", 
      },
    },
    defaultVariants: {
      variant: "primary", 
      size: "md",
    },
  }
);

// 2. TIPADO EN TYPESCRIPT
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

// 3. COMPONENTE
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { 
      className, 
      variant, 
      size, 
      loading = false, 
      disabled, 
      children, 
      ...props 
    }, 
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={twMerge(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" size={size === "sm" ? 16 : 18} />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;