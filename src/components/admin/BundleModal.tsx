
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto glass-card border-0 rounded-2xl fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-50">
        <DialogHeader className="pb-6 flex-shrink-0">
          <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-accent-purple bg-clip-text text-transparent">
            {title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="glass-subtle rounded-xl p-6 flex-1 min-h-0">
          <BundleForm
            initialData={initialData}
            onSubmit={onSubmit}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
