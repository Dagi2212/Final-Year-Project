'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onSubmit: () => Promise<void>;
  onCancel?: () => void;
  children: React.ReactNode;
  submitLabel?: string;
  loading?: boolean;
  isEdit?: boolean;
}

export function FormModal({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  onCancel,
  children,
  submitLabel = 'Save',
  loading = false,
  isEdit = false,
}: FormModalProps) {
  const handleSubmit = async () => {
    try {
      await onSubmit();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit' : 'Create'} {title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="py-4">
          {children}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
