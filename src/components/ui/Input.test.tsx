import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from './Input';
import React from 'react';

describe('Input Component', () => {
  it('renders with label correctly', () => {
    render(<Input label="Username" placeholder="Enter username" />);
    expect(screen.getByText('Username')).toBeDefined();
    expect(screen.getByPlaceholderText('Enter username')).toBeDefined();
  });

  it('handles change events', () => {
    const handleChange = vi.fn();
    render(<Input label="Username" onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'testuser' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error message when provided', () => {
    render(<Input label="Username" error="Required field" />);
    expect(screen.getByText('Required field')).toBeDefined();
  });
});
