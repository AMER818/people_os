import React, { useState } from 'react';
import Modal, { ModalProps } from './Modal';
import { Loader2, AlertTriangle } from 'lucide-react';

export interface FormModalProps extends Omit<ModalProps, 'children'> {
  onSave: () => Promise<void> | void;
  children: React.ReactNode;
  saveLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  isDirty?: boolean;
  showFooter?: boolean;
}

/**
 * Specialized modal component for forms with save/cancel buttons
 * Built on top of the base Modal component
 */
export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  size = 'md',
  children,
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  isLoading: externalLoading,
  isDirty = false,
  showFooter = true,
  showCloseButton = true,
  closeOnBackdrop = false, // Prevent accidental close for forms
  closeOnEscape = true,
  className = '',
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const isLoading = externalLoading ?? internalLoading;

  const handleSave = async () => {
    try {
      setInternalLoading(true);
      await onSave();
      // Note: onClose should be called by parent after successful save
    } catch (error) {
      console.error('Form save error:', error);
      // Error handling should be done in parent component
    } finally {
      setInternalLoading(false);
    }
  };

  const handleClose = () => {
    if (isDirty && !isLoading) {
      setShowConfirmClose(true);
      return;
    }
    onClose();
  };

  const confirmClose = () => {
    setShowConfirmClose(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size={size}
      showCloseButton={showCloseButton}
      closeOnBackdrop={closeOnBackdrop}
      closeOnEscape={closeOnEscape && !isLoading}
      className={className}
    >
      <div className="space-y-6">
        {/* Form Content */}
        <div>{children}</div>

        {/* Footer with Save/Cancel buttons */}
        {showFooter && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-3 bg-muted-bg text-text-primary rounded-lg font-bold text-sm hover:bg-muted-bg/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={cancelLabel}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-3 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              aria-label={saveLabel}
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {saveLabel}
            </button>
          </div>
        )}
      </div>

      {/* Nested Confirmation Modal */}
      <Modal
        isOpen={showConfirmClose}
        onClose={() => setShowConfirmClose(false)}
        title="Unsaved Changes"
        size="sm"
        className="z-[60]" // Ensure it sits above the form modal
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-200">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <p className="text-sm font-medium">Discard changes?</p>
          </div>
          <p className="text-xs text-slate-400">
            You have unsaved changes in this form. Closing it now will discard your progress.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowConfirmClose(false)}
              className="px-4 py-2 bg-muted-bg text-text-primary rounded-lg font-bold text-xs hover:bg-muted-bg/80 transition-colors"
            >
              Keep Editing
            </button>
            <button
              type="button"
              onClick={confirmClose}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-bold text-xs hover:bg-yellow-700 transition-colors shadow-lg shadow-yellow-600/20"
            >
              Discard & Close
            </button>
          </div>
        </div>
      </Modal>
    </Modal>
  );
};

export default FormModal;
