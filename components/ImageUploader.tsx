import React, { useCallback, useRef } from 'react';
import type { ImageState } from '../types';
import { UploadIcon, XCircleIcon } from './Icons';

interface ImageUploaderProps {
  label: string;
  imageState: ImageState;
  onImageChange: (state: ImageState) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ label, imageState, onImageChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageChange({ file, preview: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageChange({ file: null, preview: null });
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.click();
  };
  
  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            onImageChange({ file, preview: e.target?.result as string });
        };
        reader.readAsDataURL(file);
    }
  }


  return (
    <div>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      <div
        className="relative group w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex justify-center items-center cursor-pointer hover:border-brand-accent transition-colors duration-300 bg-gray-50"
        onClick={handleContainerClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {imageState.preview ? (
          <>
            <img src={imageState.preview} alt={label} className="w-full h-full object-contain rounded-lg p-2" />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 left-2 p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-opacity opacity-0 group-hover:opacity-100"
              aria-label="إزالة الصورة"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </>
        ) : (
          <div className="text-center text-gray-500">
            <UploadIcon className="mx-auto h-12 w-12" />
            <p className="mt-2 text-sm">
              <span className="font-semibold text-brand-accent">اضغط للرفع</span> أو اسحب وأفلت
            </p>
            <p className="text-xs">PNG, JPG, أو WEBP</p>
          </div>
        )}
      </div>
    </div>
  );
};
