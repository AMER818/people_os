# Contributing to Enterprise HCM

Thank you for your interest in contributing to the Enterprise HCM project! This document provides guidelines and best practices for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Collaborate openly and transparently
- Prioritize code quality and maintainability

## Getting Started

1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature`
5. Make your changes
6. Run tests: `npm test`
7. Run linter: `npm run lint`
8. Commit your changes
9. Push to your fork
10. Create a Pull Request

## Development Process

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `refactor/*` - Code improvements
- `docs/*` - Documentation updates

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(employee): add bulk import via CSV
fix(payroll): correct overtime calculation
docs(readme): update installation steps
refactor(api): extract error handling to utility
test(employee): add integration tests for CRUD operations
```

## Coding Standards

### TypeScript

- **Strict Mode**: Always use strict TypeScript
- **No `any`**: Avoid using `any` type
- **Explicit Types**: Define explicit return types for functions
- **Interfaces**: Use interfaces for object shapes
- **Enums**: Use const enums for better performance

```typescript
// ✅ Good
interface Employee {
  id: string;
  name: string;
  department: string;
}

function getEmployee(id: string): Employee | null {
  // implementation
}

// ❌ Bad
function getEmployee(id: any): any {
  // implementation
}
```

### React

- **Functional Components**: Use functional components with hooks
- **PropTypes**: Define prop types with TypeScript interfaces
- **Memoization**: Use `React.memo` for expensive components
- **Custom Hooks**: Extract reusable logic into custom hooks

```typescript
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => {
  return (
    <button onClick={onClick} className={`btn btn-${variant}`}>
      {label}
    </button>
  );
};

export default React.memo(Button);
```

### Accessibility

- **ARIA Labels**: Include proper ARIA attributes
- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
- **Focus Management**: Manage focus for modals and dialogs
- **Semantic HTML**: Use semantic HTML elements

```typescript
// ✅ Good
<button
  aria-label="Close dialog"
  onClick={handleClose}
  type="button"
>
  <X size={20} />
</button>

// ❌ Bad
<div onClick={handleClose}>
  <X size={20} />
</div>
```

### Security

- **Input Sanitization**: Always sanitize user inputs
- **Environment Variables**: Never commit sensitive data
- **API Calls**: Use proper error handling
- **Rate Limiting**: Implement rate limiting for API calls

## Testing Guidelines

### Unit Tests

- Test individual functions and components
- Mock external dependencies
- Aim for >80% coverage

```typescript
describe('calculateTax', () => {
  it('should calculate correct tax for salary below threshold', () => {
    const result = calculateTax(50000);
    expect(result).toBe(5000);
  });

  it('should handle negative values', () => {
    const result = calculateTax(-1000);
    expect(result).toBe(0);
  });
});
```

### Integration Tests

- Test component interactions
- Test user workflows
- Use Testing Library queries

```typescript
describe('Employee Form', () => {
  it('should submit employee data correctly', async () => {
    render(<EmployeeForm onSubmit={mockSubmit} />);

    await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
    await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
    await userEvent.click(screen.getByText('Submit'));

    expect(mockSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
    });
  });
});
```

## Pull Request Process

1. **Update Documentation**: Ensure README and docs are updated
2. **Add Tests**: Include tests for new features
3. **Run Linter**: `npm run lint:fix`
4. **Check Types**: `npm run type-check`
5. **Run Tests**: `npm run test:coverage`
6. **Update Changelog**: Add entry to CHANGELOG.md
7. **Create PR**: Use the PR template
8. **Request Review**: Tag appropriate reviewers
9. **Address Feedback**: Make requested changes
10. **Merge**: Squash and merge after approval

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist

- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Linting passes
- [ ] Type checking passes
- [ ] No console errors

## Screenshots (if applicable)

Add screenshots here

## Related Issues

Closes #issue_number
```

## Questions?

If you have questions, please:

1. Check existing documentation
2. Search closed issues
3. Create a new discussion
4. Contact the maintainers

Thank you for contributing!
