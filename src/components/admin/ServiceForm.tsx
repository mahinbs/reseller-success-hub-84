
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { serviceStockImages, getImagesByCategory } from '@/lib/stockImages';
import { Eye } from 'lucide-react';

const serviceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be positive'),
  billing_period: z.enum(['monthly', 'yearly', 'one-time']),
  features: z.string().optional(),
  brochure_url: z.string().url().optional().or(z.literal('')),
  deck_url: z.string().url().optional().or(z.literal('')),
  image_url: z.string().url().optional().or(z.literal('')),
  is_active: z.boolean(),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  initialData?: Partial<ServiceFormData>;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [selectedImageUrl, setSelectedImageUrl] = useState(initialData?.image_url || '');
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      price: initialData?.price || 0,
      billing_period: initialData?.billing_period || 'monthly',
      features: typeof initialData?.features === 'string' 
        ? initialData.features 
        : Array.isArray(initialData?.features) 
          ? (initialData.features as string[]).join(', ') 
          : '',
      brochure_url: initialData?.brochure_url || '',
      deck_url: initialData?.deck_url || '',
      image_url: initialData?.image_url || '',
      is_active: initialData?.is_active ?? true,
    },
  });

  const handleSubmit = async (data: ServiceFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter service name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter service description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., AI Analysis, Automation" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="billing_period"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billing Period</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select billing period" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="one-time">One-time</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="features"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Features</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter features separated by commas" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Enter features separated by commas (e.g., "Feature 1, Feature 2, Feature 3")
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="brochure_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brochure URL (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deck_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deck URL (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background Image</FormLabel>
              <div className="space-y-4">
                {/* Predefined Images */}
                <div>
                  <FormLabel className="text-sm font-medium">Select from Stock Images</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    {serviceStockImages
                      .filter(img => !form.watch('category') || img.category.includes(form.watch('category')))
                      .slice(0, 8)
                      .map((image) => (
                      <div 
                        key={image.url}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          selectedImageUrl === image.url ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => {
                          field.onChange(image.url);
                          setSelectedImageUrl(image.url);
                        }}
                      >
                        <img 
                          src={image.url} 
                          alt={image.title}
                          className="w-full h-16 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Eye className="h-4 w-4 text-white" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                          <p className="text-white text-xs truncate">{image.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom URL Input */}
                <div>
                  <FormLabel className="text-sm font-medium">Or Enter Custom URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/image.jpg" 
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        setSelectedImageUrl(e.target.value);
                      }}
                    />
                  </FormControl>
                </div>

                {/* Image Preview */}
                {selectedImageUrl && (
                  <div className="mt-3">
                    <FormLabel className="text-sm font-medium">Preview</FormLabel>
                    <div className="mt-2 rounded-lg overflow-hidden border border-border">
                      <div 
                        className="w-full h-32 bg-cover bg-center relative"
                        style={{ backgroundImage: `url(${selectedImageUrl})` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        <div className="absolute bottom-3 left-3">
                          <p className="text-white font-medium">Sample Service Card</p>
                          <p className="text-white/80 text-sm">Background preview</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <FormDescription>
                Choose a background image for this service card. Images will be displayed with a dark overlay for text readability.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <FormDescription>
                  Enable this service to make it available to customers
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Service'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
