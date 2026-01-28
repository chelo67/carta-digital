import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  restaurantId: string;
}

export function ImageUpload({ value, onChange, restaurantId }: ImageUploadProps) {
  const [urlInput, setUrlInput] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(value ? 'url' : 'upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona un archivo de imagen válido',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'La imagen no debe superar los 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${restaurantId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      onChange(publicUrl);
      setUrlInput(publicUrl);
      toast({ title: 'Imagen subida correctamente' });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Error al subir imagen',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <Label>Imagen del Producto (opcional)</Label>
      
      {value && (
        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Subir archivo
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            URL
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="cursor-pointer"
            />
            {uploading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          <p className="text-xs text-muted-foreground">
            Formatos: JPG, PNG, GIF, WebP. Máximo 5MB.
          </p>
        </TabsContent>
        
        <TabsContent value="url" className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              onBlur={handleUrlSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Ingresa la URL completa de la imagen.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
