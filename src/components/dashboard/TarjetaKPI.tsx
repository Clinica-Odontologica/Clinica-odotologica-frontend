import React from "react";
import { Card } from "../ui/card/card"; 

interface TarjetaKPIProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string; // Ej: "+12%"
  trendDirection?: "up" | "down" | "neutral";
  description?: string; // Ej: "vs. mes anterior"
}

export const TarjetaKPI = ({
  title,
  value,
  icon,
  trend,
  trendDirection = "neutral",
  description,
}: TarjetaKPIProps) => {
  const trendColor =
    trendDirection === "up"
      ? "text-emerald-600"
      : trendDirection === "down"
      ? "text-red-600"
      : "text-slate-500";

  return (
    <Card className="p-6 flex flex-col gap-4 border border-border shadow-sm hover:shadow-md transition-shadow">
      {/* Encabezado de la tarjeta: Título e Icono */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <div className="text-teal-600 bg-teal-50 p-2 rounded-lg">
          {icon}
        </div>
      </div>
      
      {/* Cuerpo de la tarjeta: Valor principal y descripción */}
      <div>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
        
        {(trend || description) && (
          <p className="mt-2 text-sm text-slate-500 flex items-center gap-1.5">
            {trend && (
              <span className={`font-medium ${trendColor}`}>{trend}</span>
            )}
            {description && <span>{description}</span>}
          </p>
        )}
      </div>
    </Card>
  );
};

export default TarjetaKPI;