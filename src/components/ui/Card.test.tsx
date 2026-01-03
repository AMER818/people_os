import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from './Card';
import React from 'react';

describe('Card Component', () => {
  it('renders correctly with children', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeDefined();
  });

  it('applies glassmorphism class when variant is glass', () => {
    const { container } = render(<Card variant="glass">Content</Card>);
    expect(container.firstChild).toHaveClass('backdrop-blur-3xl');
  });
});
