import React, { useState } from 'react';
import Modal, { ModalProps } from './Modal';
import { Loader2 } from 'lucide-react';

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
            const confirmed = window.confirm(
                'You have unsaved changes. Are you sure you want to close?'
            );
            if (!confirmed) { return; }
        }
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
        </Modal>
    );
};

export default FormModal;
