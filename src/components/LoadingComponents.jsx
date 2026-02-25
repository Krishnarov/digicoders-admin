import React from "react";
import { Loader2 } from "lucide-react";
import { Skeleton, TableRow, TableCell } from "@mui/material";

// Button Loader Component
export const ButtonLoader = ({ loading, loadingText, children, size = 20, ...props }) => {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <div className="flex items-center gap-2">
          <Loader2 size={size} className="animate-spin" />
          {loadingText && <span>{loadingText}</span>}
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// Action Button Loader (for specific actions like Accept, Reject, Delete)
export const ActionButton = ({ 
  loading, 
  loadingKey, 
  currentLoadingKey, 
  icon: Icon, 
  onClick, 
  className = "",
  size = 20,
  disabled = false,
  ...props 
}) => {
  const isLoading = loading && currentLoadingKey === loadingKey;
  
  return (
    <button
      className={className}
      onClick={onClick}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={size} className="animate-spin" />
      ) : (
        <Icon size={size} />
      )}
    </button>
  );
};

// Table Skeleton Loader
export const TableSkeleton = ({ columns, rows = 10 }) => {
  return (
    <>
      {Array.from(new Array(rows)).map((_, index) => (
        <TableRow key={index}>
          {columns.map((col, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton animation="wave" height={24} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};

// Page Loader
export const PageLoader = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={40} className="animate-spin text-blue-600" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

// Card Skeleton Loader
export const CardSkeleton = ({ count = 1 }) => {
  return (
    <>
      {Array.from(new Array(count)).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <Skeleton animation="wave" height={20} width="60%" />
              <Skeleton animation="wave" height={32} width="40%" className="mt-2" />
              <Skeleton animation="wave" height={16} width="80%" className="mt-1" />
            </div>
            <Skeleton animation="wave" height={48} width={48} variant="rectangular" className="rounded-lg" />
          </div>
          <div className="mt-4">
            <Skeleton animation="wave" height={16} width="30%" />
          </div>
        </div>
      ))}
    </>
  );
};

// Form Skeleton Loader
export const FormSkeleton = ({ fields = 6 }) => {
  return (
    <div className="space-y-4">
      {Array.from(new Array(fields)).map((_, index) => (
        <div key={index}>
          <Skeleton animation="wave" height={20} width="25%" className="mb-2" />
          <Skeleton animation="wave" height={40} width="100%" variant="rectangular" className="rounded" />
        </div>
      ))}
      <div className="flex gap-2 mt-6">
        <Skeleton animation="wave" height={40} width={100} variant="rectangular" className="rounded" />
        <Skeleton animation="wave" height={40} width={100} variant="rectangular" className="rounded" />
      </div>
    </div>
  );
};

// Inline Loader (for small loading states)
export const InlineLoader = ({ size = 16, className = "" }) => {
  return <Loader2 size={size} className={`animate-spin ${className}`} />;
};

// Loading Overlay (for specific sections)
export const LoadingOverlay = ({ loading, children, message = "Loading..." }) => {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={24} className="animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
};