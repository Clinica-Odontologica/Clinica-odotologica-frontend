import React from "react";
import { Card } from "../ui/card/card"; 

interface TarjetaKPIProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string; 
  trendDirection?: "up" | "down" | "neutral";
  description?: string; 
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
      ? "text-red-500"
      : "text-slate-500";

  return (
    <Card className="p-5 md:p-6 flex flex-col gap-3 md:gap-4 border border-teal-100 shadow-sm hover:shadow-md transition-all w-full min-w-0 bg-white rounded-2xl md:rounded-3xl">
      
      {/* Encabezado de la tarjeta: Título e Icono */}
      <div className="flex items-center justify-between gap-3 min-w-0">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
          {title}
        </h3>
        {/* 🌟 shrink-0 asegura que el ícono no se deforme, y agregamos un gradiente premium */}
        <div className="text-teal-600 bg-gradient-to-br from-cyan-50 to-teal-100 p-2.5 rounded-xl border border-teal-100 shrink-0 shadow-inner">
          {icon}
        </div>
      </div>
      
      {/* Cuerpo de la tarjeta: Valor principal y descripción */}
      <div className="min-w-0">
        <p className="text-2xl md:text-3xl font-black text-slate-900 truncate">
          {value}
        </p>
        
        {(trend || description) && (
          <p className="mt-1.5 md:mt-2 text-xs md:text-sm text-slate-500 flex items-center gap-1.5 min-w-0">
            {trend && (
              <span className={`font-bold ${trendColor} shrink-0`}>
                {trend}
              </span>
            )}
            {description && (
              <span className="truncate" title={description}>
                {description}
              </span>
            )}
          </p>
        )}
      </div>
    </Card>
  );
};

export default TarjetaKPI;