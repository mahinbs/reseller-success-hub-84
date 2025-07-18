
import React, { useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';

const bundleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  discount_percentage: z.number().min(0).max(100, 'Discount must be between 0-100%'),
  total_price: z.number().min(0, 'Price must be positive'),
  is_active: z.boolean(),
  service_ids: z.array(z.string()).min(1, 'At least one service must be selected'),
});

export type BundleFormData = z.infer<typeof bundleSchema>;

interface Service {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface BundleFormProps {
  initialData?: Partial<BundleFormData>;
  onSubmit: (data: BundleFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const BundleForm: React.FC<BundleFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const form = useForm<BundleFormData>({
    resolver: zodResolver(bundleSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      discount_percentage: initialData?.discount_percentage || 0,
      total_price: initialData?.total_price || 0,
      is_active: initialData?.is_active ?? true,
      service_ids: initialData?.service_ids || [],
    },
  });

  const watchedServiceIds = form.watch('service_ids');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('id, name, price, category')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  // Auto-calculate total price based on selected services
  useEffect(() => {
    const selectedServices = services.filter(service => 
      watchedServiceIds.includes(service.id)
    );
    const subtotal = selectedServices.reduce((sum, service) => sum + Number(service.price), 0);
    const discount = form.getValues('discount_percentage');
    const totalPrice = subtotal * (1 - discount / 100);
    
    form.setValue('total_price', totalPrice);
  }, [watchedServiceIds, form, services]);

  const handleSubmit = async (data: BundleFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  if (loadingServices) {
    return <div className="p-4">Loading services...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bundle Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter bundle name" {...field} />
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
                <Textarea placeholder="Enter bundle description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discount_percentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="1" 
                    min="0"
                    max="100"
                    placeholder="0" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="total_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Price (Auto-calculated)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    {...field}
                    readOnly
                    className="bg-muted"
                  />
                </FormControl>
                <FormDescription>
                  Price is automatically calculated based on selected services and discount
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="service_ids"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Select Services</FormLabel>
                <FormDescription>
                  Choose the services to include in this bundle
                </FormDescription>
              </div>
              <div className="grid grid-cols-1 gap-4 max-h-60 overflow-y-auto border rounded-lg p-4">
                {services.map((service) => (
                  <FormField
                    key={service.id}
                    control={form.control}
                    name="service_ids"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={service.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(service.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, service.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== service.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-medium">
                              {service.name}
                            </FormLabel>
                            <FormDescription>
                              {service.category} - ${Number(service.price).toFixed(2)}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
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
                  Enable this bundle to make it available to customers
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
            {isLoading ? 'Saving...' : 'Save Bundle'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
