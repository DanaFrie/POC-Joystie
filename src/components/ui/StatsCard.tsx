import React from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  subtext?: string;
  bgColor?: string;
  icon?: React.ReactNode;
}

export default function StatsCard({ title, value, subtext, bgColor = 'bg-brand-cream', icon }: StatsCardProps) {
  return (
    <div className={`w-full max-w-[601px] ${bgColor} border-[3px] border-brand-gray rounded-card shadow-card p-6`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold mb-2 text-brand-navy">{title}</h3>
          <p className="text-4xl font-bold mb-1">{value}</p>
          {subtext && <p className="text-sm text-brand-gray">{subtext}</p>}
        </div>
        {icon && <div className="text-4xl">{icon}</div>}
      </div>
    </div>
  );
}
