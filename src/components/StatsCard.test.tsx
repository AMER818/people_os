import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import StatsCard from './StatsCard';

// Mock lucide-react
vi.mock('lucide-react', () => {
  const icons = ['TrendingUp', 'TrendingDown', 'Minus', 'User'];
  const mock: any = {};
  icons.forEach((icon) => {
    mock[icon] = (props: any) => <span data-testid={`icon-${icon.toLowerCase()}`} {...props} />;
  });
  return mock;
});

describe('StatsCard', () => {
  const MockIcon = (props: any) => <span data-testid="mock-icon" {...props} />;

  it('renders correctly with basic props', () => {
    render(
      <StatsCard
        label="Total Employees"
        value="1,234"
        change={5}
        trend="up"
        icon={MockIcon}
        color="blue"
      />
    );

    expect(screen.getByText('Total Employees')).toBeDefined();
    expect(screen.getByText('1,234')).toBeDefined();
    expect(screen.getByText('5%')).toBeDefined();
    expect(screen.getByTestId('mock-icon')).toBeDefined();
    expect(screen.getByTestId('icon-trendingup')).toBeDefined();
  });

  it('renders trend down correctly', () => {
    render(
      <StatsCard
        label="Attrition"
        value="10"
        change={-2}
        trend="down"
        icon={MockIcon}
        color="rose"
      />
    );

    expect(screen.getByText('2%')).toBeDefined(); // Math.abs(-2)
    expect(screen.getByTestId('icon-trendingdown')).toBeDefined();
  });

  it('renders neutral trend correctly', () => {
    render(
      <StatsCard
        label="Stability"
        value="99%"
        change={0}
        trend="neutral"
        icon={MockIcon}
        color="gray"
      />
    );

    expect(screen.getByText('0%')).toBeDefined();
    expect(screen.getByTestId('icon-minus')).toBeDefined();
  });

  it('maps colors correctly', () => {
    const { container, rerender } = render(
      <StatsCard
        label="Test"
        value="0"
        change={0}
        trend="neutral"
        icon={MockIcon}
        color="emerald"
      />
    );

    // Check for success color class (bg-success/5, text-success, etc.)
    // Since classes are dynamic, we might check if the element has the class.
    // However, Tailwind classes like `bg-${semanticColor}/5` might not be fully generated if not safelisted, 
    // but in test environment we check the string presence in className.

    // The component logic:
    // if color is 'emerald', semanticColor is 'success'.
    // className contains `bg-success/5`

    const bgCircle = container.querySelector('.rounded-full');
    expect(bgCircle?.className).toContain('bg-success-soft/20');

    rerender(
      <StatsCard
        label="Test"
        value="0"
        change={0}
        trend="neutral"
        icon={MockIcon}
        color="rose"
      />
    );
    const bgCircle2 = container.querySelector('.rounded-full');
    expect(bgCircle2?.className).toContain('bg-danger-soft/20');
  });
});
