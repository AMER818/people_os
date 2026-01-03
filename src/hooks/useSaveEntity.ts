import { useState } from 'react';
import { useToast } from '../components/ui/Toast';

interface UseSaveEntityOptions<T, P> {
  onSave: (data: T) => Promise<any> | void;
  onSuccess?: () => void;
  onAfterSave?: () => Promise<void> | void;
  successMessage?: string | ((data: T) => string);
  errorMessage?: string;
  initialState: P;
  validate?: (data: P) => boolean;
  transform?: (data: P) => T;
}

/**
 * A custom hook to standardize save/create operations across modules.
 * Handles loading state, success/error toasts, form state management, and post-save actions.
 *
 * @template T The final entity type being saved to the API
 * @template P The internal form state type (defaults to T if not provided)
 */
export function useSaveEntity<T, P = T>({
  onSave,
  onSuccess,
  onAfterSave,
  successMessage = 'Action completed successfully',
  errorMessage = 'An error occurred during save',
  initialState,
  validate,
  transform,
}: UseSaveEntityOptions<T, P>) {
  const [formData, setFormData] = useState<P>(initialState);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error: showError } = useToast();

  const resetForm = () => setFormData(initialState);

  const updateField = <K extends keyof P>(field: K, value: P[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (validate && !validate(formData)) {
      return;
    }

    setIsSaving(true);
    try {
      // Transform form data if needed, otherwise cast it
      const dataToSave = transform ? transform(formData) : (formData as unknown as T);

      await onSave(dataToSave);

      const msg =
        typeof successMessage === 'function' ? successMessage(dataToSave) : successMessage;
      success(msg);

      if (onAfterSave) {
        await onAfterSave();
      }

      if (onSuccess) {
        onSuccess();
      }

      resetForm();
    } catch (err: any) {
      console.error('Save failed:', err);
      showError(err.message || errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    formData,
    setFormData,
    updateField,
    isSaving,
    handleSave,
    resetForm,
  };
}
