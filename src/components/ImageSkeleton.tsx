import React from 'react';

interface ImageSkeletonProps {
  height: number;
}

export const ImageSkeleton: React.FC<ImageSkeletonProps> = ({ height }) => {
  return (
    <div 
      className="bg-skeleton animate-pulse rounded-lg w-full"
      style={{ height: `${height}px` }}
    >
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    </div>
  );
};