'use client';

import { useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  label: string;
  hint?: string;
  previewUrl?: string | null;
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  aspect?: 'square' | 'banner' | 'avatar';
  className?: string;
}

export function ImageUpload({
  label,
  hint,
  previewUrl,
  onFileSelect,
  onClear,
  aspect = 'square',
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectClass = {
    square: 'aspect-square max-w-xs',
    banner: 'aspect-[3/1] w-full',
    avatar: 'h-28 w-28 rounded-full',
  }[aspect];

  return (
    <div className={className}>
      <label className="block text-sm font-bold text-foreground mb-1">{label}</label>
      {hint && <p className="text-xs text-muted mb-2">{hint}</p>}
      <div
        className={cn(
          'relative overflow-hidden rounded border-2 border-dashed border-border bg-muted-bg flex items-center justify-center cursor-pointer hover:border-accent transition-colors group',
          aspectClass,
          aspect === 'avatar' && 'rounded-full'
        )}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt=""
              className={cn('h-full w-full object-cover', aspect === 'avatar' && 'rounded-full')}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="h-8 w-8 text-white" />
            </div>
          </>
        ) : (
          <div className="text-center p-4">
            <Camera className="h-8 w-8 text-muted mx-auto mb-2" />
            <p className="text-xs text-muted">Click to upload</p>
          </div>
        )}
        {previewUrl && onClear && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute top-2 right-2 rounded-full bg-card p-1 shadow border border-border hover:bg-red-50"
            aria-label="Remove image"
          >
            <X className="h-4 w-4 text-muted" />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

interface MultiImageUploadProps {
  label: string;
  hint?: string;
  previews: string[];
  onAdd: (file: File) => void;
  onRemove: (index: number) => void;
  max?: number;
}

export function MultiImageUpload({
  label,
  hint,
  previews,
  onAdd,
  onRemove,
  max = 12,
}: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="block text-sm font-bold text-foreground mb-1">{label}</label>
      {hint && <p className="text-xs text-muted mb-3">{hint}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {previews.map((url, i) => (
          <div key={`${url}-${i}`} className="relative aspect-square rounded overflow-hidden border border-border group">
            <img src={url} alt={`Portfolio ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-1.5 right-1.5 rounded-full bg-card p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {previews.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded border-2 border-dashed border-border bg-muted-bg flex flex-col items-center justify-center gap-1 hover:border-accent transition-colors"
          >
            <Camera className="h-6 w-6 text-muted" />
            <span className="text-xs text-muted">Add photo</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          files.slice(0, max - previews.length).forEach(onAdd);
          e.target.value = '';
        }}
      />
    </div>
  );
}
