import React, { ReactNode } from 'react';

interface SettingsRowProps {
  id?: string;
  icon?: ReactNode;
  title: string;
  description?: string;
  children?: ReactNode; // Controls component (toggle, dropdown, etc) on the right
  expandedContent?: ReactNode; // Extra controls or input rows expanding underneath
  isExpanded?: boolean;
}

export function SettingsRow({
  id,
  icon,
  title,
  description,
  children,
  expandedContent,
  isExpanded = false
}: SettingsRowProps) {
  return (
    <div id={id} className="transition-all duration-300">
      {/* Primary header row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 min-h-[68px]">
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          {icon && (
            <div className="text-[#888888] shrink-0 mt-0.5 lg:mt-1">
              {icon}
            </div>
          )}
          <div className="flex flex-col min-w-0 w-full">
            <span className="text-[15px] font-bold text-[#F0F0F0] leading-snug">
              {title}
            </span>
            {description && (
              <span className="text-[13px] text-[#888888] mt-1 leading-relaxed">
                {description}
              </span>
            )}
          </div>
        </div>
        {children && (
          <div className="w-full lg:w-auto shrink-0 flex items-center justify-start lg:justify-end mt-2 lg:mt-0">
            {children}
          </div>
        )}
      </div>

      {/* Expanded sub-section */}
      {expandedContent && isExpanded && (
        <div className="px-5 pb-5 pt-1 border-t border-[rgba(255,255,255,0.04)] bg-[#0C0C0C]/50 animate-in fade-in slide-in-from-top-1 duration-200">
          {expandedContent}
        </div>
      )}
    </div>
  );
}
