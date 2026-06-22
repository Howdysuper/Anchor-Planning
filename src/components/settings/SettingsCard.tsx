import React from 'react';

interface SettingsCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsCard({ title, description, children }: SettingsCardProps) {
  const childrenArray = React.Children.toArray(children).filter(Boolean);

  return (
    <div className="mb-6">
      {title && (
        <h3 className="text-[14px] font-bold text-[#888888] uppercase tracking-wider mb-2.5 px-1">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-[13px] text-[#888888] mb-3 px-1 leading-relaxed">
          {description}
        </p>
      )}
      <div className="bg-[#141414] border border-[rgba(255,255,255,0.06)] rounded-[20px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
        {childrenArray.map((child, idx) => {
          const isLast = idx === childrenArray.length - 1;
          return (
            <React.Fragment key={idx}>
              {child}
              {!isLast && <div className="h-px bg-[rgba(255,255,255,0.06)] mx-5" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
