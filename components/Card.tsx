import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = "", title, action }) => {
  return (
    <div className={`bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
          {title && <h3 className="font-semibold text-gray-200">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};
