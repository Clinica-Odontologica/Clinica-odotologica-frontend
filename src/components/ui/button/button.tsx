import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { Loader2 } from "lucide-react"; // Aprovechamos tu librería de iconos

// 1. RECETA DE ESTILOS CON CVA
// eslint-disable-next-line react-refresh/only-export-components
export const buttonVariants = cva(
  // -> Estilos BASE: Se aplican a absolutamente todos los botones
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]",
  {
    // -> VARIANTES VISUALES
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-md",// Ideal para acciones principales
        secondary: "mt-4 px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors", // Ideal para acciones secundarias o menos importantes
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm", // Ideal para acciones destructivas (borrar)
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-base",
        lg: "h-12 px-6 text-lg",
        icon: "h-10 w-10 justify-center p-0", // Especial para botones con solo un icono adentro
      },
    },
    // -> VALORES POR DEFECTO (si no le especificas nada al usarlo)
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

// 2. TIPADO EN TYPESCRIPT
// Combinamos las propiedades nativas de un botón HTML + las variantes que creamos en CVA
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean; // Añadimos nuestra propiedad personalizada de carga
}

// 3. COMPONENTE CON FORWARDREF
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
        // Si está cargando, bloqueamos el clic automáticamente por seguridad
        disabled={disabled || loading}
        // twMerge evita conflictos si le pasas clases extra por className
        className={twMerge(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {/* Spinner animado automático si loading es true */}
        {loading && <Loader2 className="animate-spin" size={size === "sm" ? 16 : 18} />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;