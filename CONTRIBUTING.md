# Contributing to WSO2 API Manager Apps

Thank you for your interest in contributing to the WSO2 API Manager Apps project! This guide will help you understand the project structure, coding standards, and contribution workflow.

## Project Overview

The WSO2 API Manager Apps consist of three main web applications:

- **API Publisher Portal** (`portals/publisher/`) - Create, design, implement, and manage APIs
- **API Developer Portal** (`portals/devportal/`) - Discover, explore, and consume APIs  
- **API Admin Portal** (`portals/admin/`) - Administrative functions and portal management

## Development Environment Setup

### Prerequisites

1. **Node.js** - Version 22.x or later LTS
2. **npm** - Version 10.0.0 or later
3. **Apache Maven** - For building the complete distribution (optional)
4. **JDK 1.8** - For Maven builds (optional)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/wso2/apim-apps
   cd apim-apps
   ```

2. **Set up a specific portal for development:**
   ```bash
   # For Publisher Portal
   cd portals/publisher/src/main/webapp
   npm ci
   npm start
   
   # For Developer Portal  
   cd portals/devportal/src/main/webapp
   npm ci
   npm start
   
   # For Admin Portal
   cd portals/admin/src/main/webapp
   npm ci
   npm start
   ```

3. **Development servers run on:**
   - Publisher Portal: http://localhost:8081/publisher
   - Developer Portal: http://localhost:8084/devportal
   - Admin Portal: http://localhost:8083/admin

## Coding Standards

### JavaScript/React Standards

The project follows strict coding standards enforced by ESLint and Prettier:

#### ESLint Configuration
- **Base**: Airbnb JavaScript/React style guide
- **Parser**: @babel/eslint-parser with TypeScript support
- **Indentation**: 4 spaces (not tabs)
- **Max line length**: 120 characters
- **JSX quotes**: Single quotes preferred

#### Key Rules
```javascript
// Indentation: 4 spaces
const example = {
    key: 'value',
    nested: {
        property: true,
    },
};

// JSX indentation: 4 spaces
<Component
    prop1="value1"
    prop2="value2"
>
    <ChildComponent />
</Component>

// Single quotes for strings
const message = 'Hello World';

// JSDoc comments required for functions
/**
 * Example function with JSDoc
 * @param {string} name - The name parameter
 * @returns {string} Formatted greeting
 */
function greet(name) {
    return `Hello, ${name}!`;
}
```

#### TypeScript Configuration
- **Target**: ES2015
- **Strict mode**: Enabled
- **JSX**: react-jsx
- **Module resolution**: Node

### File Structure Standards

```
portals/[portal-name]/src/main/webapp/
├── source/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/     # Reusable components
│   │   │   ├── data/          # Data management
│   │   │   └── utils/         # Utility functions
│   │   └── index.js           # Entry point
│   └── Tests/                 # Test files
├── site/                      # Static assets
├── services/                  # JSP services
└── package.json
```

### Component Standards

1. **Functional Components**: Use React functional components with hooks
2. **PropTypes**: Define PropTypes for all components (except TypeScript files)
3. **Destructuring**: Always destructure props and state
4. **JSDoc**: Document all public functions and components

```jsx
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Example component with proper structure
 * @param {Object} props - Component props
 * @param {string} props.title - Component title
 * @param {Function} props.onClick - Click handler
 * @returns {JSX.Element} Rendered component
 */
const ExampleComponent = ({ title, onClick }) => {
    return (
        <div>
            <h1>{title}</h1>
            <button onClick={onClick}>Click me</button>
        </div>
    );
};

ExampleComponent.propTypes = {
    title: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default ExampleComponent;
```

## Testing Standards

### Test Structure
- **Unit Tests**: Jest with React Testing Library
- **Integration Tests**: Cypress for E2E testing
- **Test Location**: `Tests/` directory in each portal

### Running Tests
```bash
# Unit tests
npm test

# Coverage
npm run test:coverage

# Integration tests (from tests/ directory)
npm run test
npm run test:gui
```

## Build and Linting

### Available Scripts
```bash
# Development build with watch
npm run build:dev

# Production build
npm run build:prod

# Linting
npm run lint

# Internationalization
npm run i18n:en
```

### Pre-commit Checklist
- [ ] Code follows ESLint rules
- [ ] All tests pass
- [ ] JSDoc comments added for new functions
- [ ] PropTypes defined for new components
- [ ] No console.log statements in production code
- [ ] Proper error handling implemented

## Git Workflow

### Branch Naming
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical fixes
- `improvement/description` - Code improvements

### Commit Messages
Follow conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Examples:
```
feat(publisher): add new API creation wizard
fix(devportal): resolve authentication issue
docs(readme): update installation instructions
```

### Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following coding standards
3. **Write tests** for new functionality
4. **Update documentation** if needed
5. **Run linting and tests** before committing
6. **Create a pull request** with clear description

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## Internationalization (i18n)

The project uses `react-intl` for internationalization:

1. **Extract messages**: `npm run i18n:en`
2. **Use FormattedMessage**: For user-facing text
3. **Message files**: Located in `site/public/locales/`

```jsx
import { FormattedMessage } from 'react-intl';

<FormattedMessage
    id="api.create.title"
    defaultMessage="Create New API"
/>
```

## Performance Guidelines

1. **Code Splitting**: Use React.lazy() for route-based splitting
2. **Bundle Size**: Monitor with `npm run analysis`
3. **Memory**: Production builds use `--max_old_space_size=4096`
4. **Images**: Optimize and use appropriate formats

## Security Guidelines

1. **No hardcoded secrets** in code
2. **Validate all inputs** from users
3. **Use HTTPS** for all external requests
4. **Sanitize data** before rendering

## Getting Help

- **Documentation**: Check existing README files
- **Issues**: Search existing GitHub issues
- **Community**: WSO2 Slack channels
- **Stack Overflow**: Use `wso2-am` tag

## License

This project is licensed under the Apache License 2.0. By contributing, you agree that your contributions will be licensed under the same license.

---

**Remember**: Always ensure your code maintains the high quality standards expected in this project. When in doubt, look at existing code for patterns and examples.