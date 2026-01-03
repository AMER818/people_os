import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from './Badge';
import React from 'react';

describe('Badge Component', () => {
  it('renders correctly with children', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeDefined();
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Badge variant="emerald">Success</Badge>);
    expect(screen.getByText('Success').className).toContain('text-success');

    rerender(<Badge variant="rose">Danger</Badge>);
    expect(screen.getByText('Danger').className).toContain('text-danger');
  });
});
