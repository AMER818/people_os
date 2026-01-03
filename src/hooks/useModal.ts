import { useState, useCallback } from 'react';

export interface UseModalReturn {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
}

/**
 * Custom hook for managing modal state
 * 
 * @param defaultOpen - Initial state of the modal (default: false)
 * @returns Object with isOpen state and control functions
 * 
 * @example
 * const modal = useModal();
 * 
 * <button onClick={modal.open}>Open Modal</button>
 * <Modal isOpen={modal.isOpen} onClose={modal.close}>
 *   Content here
 * </Modal>
 */
export function useModal(defaultOpen = false): UseModalReturn {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const open = useCallback(() => {
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
    }, []);

    const toggle = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    return {
        isOpen,
        open,
        close,
        toggle,
    };
}

export default useModal;
