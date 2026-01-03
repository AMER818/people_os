/**
 * Accessibility utilities for the HCM application
 * Provides helpers for keyboard navigation, focus management, and ARIA support
 */

/**
 * Trap focus within a container (useful for modals)
 */
export const trapFocus = (element: HTMLElement): (() => void) => {
  const focusableSelectors = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  const focusableElements = Array.from(element.querySelectorAll<HTMLElement>(focusableSelectors));

  if (focusableElements.length === 0) {
    return () => {}; // No cleanup needed
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') {
      return;
    }

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  element.addEventListener('keydown', handleKeyDown);

  // Focus first element
  firstElement.focus();

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Announce message to screen readers
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Check if element is visible to screen readers
 */
export const isAriaHidden = (element: HTMLElement): boolean => {
  return element.getAttribute('aria-hidden') === 'true';
};

/**
 * Get all focusable elements within a container
 */
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableSelectors = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors));
};

/**
 * Set up keyboard navigation for a list
 */
export const setupListKeyboardNav = (
  listElement: HTMLElement,
  onSelect?: (index: number) => void
): (() => void) => {
  const items = Array.from(listElement.children) as HTMLElement[];
  let currentIndex = 0;

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        currentIndex = Math.min(currentIndex + 1, items.length - 1);
        items[currentIndex]?.focus();
        break;

      case 'ArrowUp':
        e.preventDefault();
        currentIndex = Math.max(currentIndex - 1, 0);
        items[currentIndex]?.focus();
        break;

      case 'Home':
        e.preventDefault();
        currentIndex = 0;
        items[currentIndex]?.focus();
        break;

      case 'End':
        e.preventDefault();
        currentIndex = items.length - 1;
        items[currentIndex]?.focus();
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect?.(currentIndex);
        break;
    }
  };

  listElement.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    listElement.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Generate unique ID for ARIA labels
 */
let idCounter = 0;
export const generateAriaId = (prefix: string = 'aria'): string => {
  idCounter++;
  return `${prefix}-${idCounter}-${Date.now()}`;
};
