import React, { useState, useEffect } from 'react';
import { ImageSkeleton } from '../components/ImageSkeleton';
import { ErrorBanner } from '../components/ErrorBanner';

interface Photo {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

const Gallery: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('https://picsum.photos/v2/list?page=1&limit=12');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch photos: ${response.status}`);
        }
        
        const data = await response.json();
        setPhotos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching photos');
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  const handleImageLoad = (photoId: string) => {
    setLoadedImages(prev => new Set(prev).add(photoId));
  };

  const getImageUrl = (photo: Photo) => {
    const targetWidth = 400;
    const aspectRatio = photo.height / photo.width;
    const targetHeight = Math.round(targetWidth * aspectRatio);
    return `https://picsum.photos/id/${photo.id}/${targetWidth}/${targetHeight}`;
  };

  const getImageHeight = (photo: Photo) => {
    const targetWidth = 400;
    const aspectRatio = photo.height / photo.width;
    return Math.round(targetWidth * aspectRatio);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Photo Gallery</h1>
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="mb-4 break-inside-avoid">
              <ImageSkeleton height={Math.random() * 200 + 200} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Photo Gallery</h1>
      
      {error && <ErrorBanner message={error} />}
      
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
        {photos.map((photo) => {
          const imageHeight = getImageHeight(photo);
          const isLoaded = loadedImages.has(photo.id);
          
          return (
            <div key={photo.id} className="mb-4 break-inside-avoid">
              <div className="relative bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {!isLoaded && (
                  <ImageSkeleton height={imageHeight} />
                )}
                <img
                  src={getImageUrl(photo)}
                  alt={`Photo by ${photo.author}`}
                  className={`w-full h-auto object-cover transition-opacity duration-300 ${
                    isLoaded ? 'opacity-100' : 'opacity-0 absolute'
                  }`}
                  onLoad={() => handleImageLoad(photo.id)}
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-image-overlay p-3">
                  <p className="text-white text-sm font-medium">
                    Photo by {photo.author}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Gallery;