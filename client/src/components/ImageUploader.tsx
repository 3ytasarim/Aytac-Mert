import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  currentImageUrl?: string | null;
  onImageChange: (imageUrl: string | null) => void;
  label?: string;
}

export function ImageUploader({ currentImageUrl, onImageChange, label = "Resim" }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Geçersiz Dosya",
        description: "Lütfen bir resim dosyası seçin.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Dosya Çok Büyük",
        description: "Resim boyutu 5MB'dan küçük olmalıdır.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Get upload URL from backend
      const response = await fetch('/api/admin/images/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Upload URL alınamadı');
      }

      const { uploadURL, imageId } = await response.json();

      // Upload file to object storage
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Dosya yüklenemedi');
      }

      // Get the public URL for the uploaded image with timestamp to avoid cache
      const publicURL = `/public-objects/images/${imageId}?t=${Date.now()}`;
      onImageChange(publicURL);

      toast({
        title: "Başarılı",
        description: "Resim başarıyla yüklendi.",
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Yükleme Hatası",
        description: "Resim yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onImageChange(urlInput.trim());
      setUrlInput("");
      setShowUrlInput(false);
      toast({
        title: "Başarılı",
        description: "Resim URL'si eklendi.",
      });
    }
  };

  const removeImage = () => {
    onImageChange(null);
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {currentImageUrl ? (
        <div className="relative">
          <img 
            src={currentImageUrl} 
            alt="Yüklenen resim"
            className="w-full max-w-xs h-32 object-cover rounded border"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={removeImage}
            className="absolute top-2 right-2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <div className="text-gray-500 mb-4">Henüz resim eklenmemiş</div>
          
          <div className="space-y-3">
            {/* File Upload */}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                id="image-upload"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Yükleniyor..." : "Dosya Seç"}
              </Button>
            </div>

            {/* URL Input Toggle */}
            {!showUrlInput ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowUrlInput(true)}
                className="text-sm"
              >
                veya URL girin
              </Button>
            ) : (
              <div className="space-y-2">
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleUrlSubmit}
                    disabled={!urlInput.trim()}
                  >
                    Ekle
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowUrlInput(false);
                      setUrlInput("");
                    }}
                  >
                    İptal
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}