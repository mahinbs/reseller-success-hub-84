import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AddonForm, AddonFormData } from './AddonForm';

interface AddonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddonFormData) => Promise<void>;
  initialData?: any;
  title: string;
  description: string;
  isLoading?: boolean;
}

export const AddonModal: React.FC<AddonModalProps> = ({
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <AddonForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};