
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BundleForm, BundleFormData } from './BundleForm';

interface BundleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BundleFormData) => Promise<void>;
  initialData?: any;
  title: string;
  description: string;
  isLoading?: boolean;
}

export const BundleModal: React.FC<BundleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
  description,
  isLoading = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <BundleForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};
