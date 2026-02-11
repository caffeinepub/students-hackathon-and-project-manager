import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
import { Achievement, AchievementCategory } from '../backend';
import { useState, useRef } from 'react';
import { ExternalBlob } from '../backend';
import { fileToUint8Array, isImageFile } from '../lib/file';

type AchievementFormData = {
  title: string;
  category: AchievementCategory;
  description: string;
  date: string;
};

interface AchievementFormProps {
  achievement?: Achievement;
  onSubmit: (data: AchievementFormData & { links?: string[]; certificateImage?: ExternalBlob }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function AchievementForm({ achievement, onSubmit, onCancel, isSubmitting }: AchievementFormProps) {
  const [links, setLinks] = useState<string[]>(achievement?.links || []);
  const [newLink, setNewLink] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory>(
    achievement?.category || AchievementCategory.project
  );
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificatePreview, setCertificatePreview] = useState<string | null>(null);
  const [certificateError, setCertificateError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<AchievementFormData>({
    defaultValues: achievement
      ? {
          title: achievement.title,
          category: achievement.category,
          description: achievement.description,
          date: new Date(Number(achievement.date) / 1000000).toISOString().split('T')[0],
        }
      : undefined,
  });

  const addLink = () => {
    if (newLink.trim()) {
      setLinks([...links, newLink.trim()]);
      setNewLink('');
    }
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCertificateError(null);

    if (!file) return;

    // Validate file type
    if (!isImageFile(file)) {
      setCertificateError('Please select a valid image file (JPEG, PNG, WebP, etc.)');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setCertificatePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    setCertificateFile(file);
  };

  const clearCertificate = () => {
    setCertificateFile(null);
    setCertificatePreview(null);
    setCertificateError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFormSubmit = async (data: AchievementFormData) => {
    let certificateBlob: ExternalBlob | undefined;

    if (certificateFile) {
      try {
        const bytes = await fileToUint8Array(certificateFile);
        certificateBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      } catch (error) {
        setCertificateError('Failed to process certificate image');
        return;
      }
    }

    await onSubmit({
      ...data,
      category: selectedCategory,
      links: links.length > 0 ? links : undefined,
      certificateImage: certificateBlob,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          {...register('title', { required: 'Title is required', minLength: 3 })}
          placeholder="Project name or achievement title"
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as AchievementCategory)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={AchievementCategory.project}>Project</SelectItem>
            <SelectItem value={AchievementCategory.researchPaper}>Research Paper</SelectItem>
            <SelectItem value={AchievementCategory.hackathon}>Hackathon</SelectItem>
            <SelectItem value={AchievementCategory.certificate}>Certificate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          {...register('description', { required: 'Description is required', minLength: 10 })}
          placeholder="Describe your achievement..."
          rows={4}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="certificate">Certificate Image (Optional)</Label>
        <div className="space-y-3">
          {!certificateFile ? (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                id="certificate"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="certificate" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">
                  Click to upload certificate image
                </p>
                <p className="text-xs text-muted-foreground">
                  JPEG, PNG, WebP (max 10MB)
                </p>
              </label>
            </div>
          ) : (
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                {certificatePreview && (
                  <img
                    src={certificatePreview}
                    alt="Certificate preview"
                    className="w-24 h-24 object-cover rounded border"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm font-medium truncate">{certificateFile.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(certificateFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Uploading: {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={clearCertificate}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          {certificateError && (
            <p className="text-sm text-destructive">{certificateError}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date *</Label>
        <Input
          id="date"
          type="date"
          {...register('date', { required: 'Date is required' })}
        />
        {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Links (Optional)</Label>
        <div className="flex gap-2">
          <Input
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder="https://github.com/..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addLink();
              }
            }}
          />
          <Button type="button" onClick={addLink} variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {links.length > 0 && (
          <div className="space-y-1 mt-2">
            {links.map((link, index) => (
              <div key={index} className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
                <span className="flex-1 truncate">{link}</span>
                <Button
                  type="button"
                  onClick={() => removeLink(index)}
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            achievement ? 'Update Achievement' : 'Create Achievement'
          )}
        </Button>
        <Button type="button" onClick={onCancel} variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  );
}
