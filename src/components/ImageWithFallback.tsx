import React, { useState } from 'react';
import { Scissors } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
  fallbackCategory?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle,
  fallbackCategory,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError || !src) {
    return (
      <div
        className={`bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-950 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden select-none border border-neutral-800/80 ${className}`}
      >
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-2 shadow-inner">
          <Scissors className="w-6 h-6 stroke-[1.75]" />
        </div>
        <p className="text-xs font-semibold text-neutral-200 line-clamp-1">
          {fallbackTitle || alt || 'Estilo Clásico'}
        </p>
        <span className="text-[10px] tracking-wider uppercase text-amber-400/80 mt-0.5">
          {fallbackCategory || 'Corte de Autor'}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-neutral-900 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-neutral-800/60 animate-pulse flex items-center justify-center">
          <Scissors className="w-5 h-5 text-neutral-600 animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt || 'Corte de cabello'}
        referrerPolicy="no-referrer"
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        {...props}
      />
    </div>
  );
};
