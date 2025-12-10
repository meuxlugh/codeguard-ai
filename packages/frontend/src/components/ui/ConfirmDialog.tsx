import { AlertCircle } from 'lucide-react';
import { Dialog } from './Dialog';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  confirmingLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isLoading: boolean;
  error?: boolean;
  errorMessage?: string;
  variant?: 'danger' | 'default';
}

export function ConfirmDialog({
  open,
  onClose,
  title,
  message,
  confirmLabel,
  confirmingLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  isLoading,
  error,
  errorMessage = 'An error occurred. Please try again.',
  variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">{message}</p>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMessage}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? confirmingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
