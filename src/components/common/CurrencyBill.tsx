import React from 'react';
import { motion } from 'framer-motion';

type BillValue = 1 | 5 | 10 | 20 | 50 | 100;

interface CurrencyBillProps {
  value?: BillValue;
  amount?: number;
  icon?: React.ReactNode;
  color?: string;
  label?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export default function CurrencyBill({ 
  value, 
  amount, 
  icon, 
  color = "#f59e0b", 
  label = "₱", 
  className = "", 
  size = 'sm' 
}: CurrencyBillProps) {
  const images: Record<BillValue, string> = {
    1: '/img/Currency/1Peso.png',
    5: '/img/Currency/5Pesos.png',
    10: '/img/Currency/10Pesos.png',
    20: '/img/Currency/20Pesos.png',
    50: '/img/Currency/50Pesos.png',
    100: '/img/Currency/100Pesos.png',
  };

  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  // If amount is provided, render a stylized amount display
  if (amount !== undefined) {
    return (
      <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 shadow-lg group ${className}`}
           style={{ 
             backgroundColor: `${color}10`, 
             borderColor: `${color}40`,
             boxShadow: `0 4px 15px ${color}20` 
           }}>
        <div className="p-1 rounded-lg bg-white/10 shadow-inner group-hover:rotate-12 transition-transform shrink-0" style={{ color }}>
          {icon}
        </div>
        <div className="flex items-center gap-0.5">
          <span className="text-xs sm:text-sm font-black italic tracking-tighter" style={{ color }}>
             {label}{amount.toLocaleString()}
          </span>
        </div>
      </div>
    );
  }

  // Fallback to original Bill image display
  const billValue = value || 1;
  return (
    <div className={`relative inline-block ${sizes[size]} ${className}`} title={`₱${billValue}`}>
       <img 
          src={images[billValue]} 
          alt={`₱${billValue}`} 
          className="w-full h-full object-contain filter drop-shadow-md"
       />
    </div>
  );
}
