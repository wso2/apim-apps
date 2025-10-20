# WSO2 API Manager Apps - Contributor Guide

## 🎯 Quick Start for Contributors

This guide is specifically designed for contributors to the WSO2 API Manager Apps project. Follow these steps to get started quickly and maintain high code quality standards.

## 🚀 One-Command Setup

Run the development setup script to configure everything automatically:

```bash
./setup-dev.sh
```

This script will:
- ✅ Check Node.js and npm versions
- ✅ Configure git properly (no Cursor AI references)
- ✅ Install all dependencies
- ✅ Set up pre-commit hooks
- ✅ Create development scripts

## 📁 Project Structure

```
apim-apps/
├── portals/
│   ├── publisher/          # API Publisher Portal
│   ├── devportal/         # API Developer Portal  
│   └── admin/             # API Admin Portal
├── tests/                 # Integration tests
├── CONTRIBUTING.md        # Detailed contribution guidelines
└── setup-dev.sh          # Development setup script
```

## 🛠️ Development Workflow

### 1. Choose Your Portal

Each portal is independent and can be developed separately:

```bash
# Publisher Portal (API Management)
cd portals/publisher/src/main/webapp
npm start  # Runs on http://localhost:8081/publisher

# Developer Portal (API Discovery)
cd portals/devportal/src/main/webapp  
npm start  # Runs on http://localhost:8084/devportal

# Admin Portal (Administration)
cd portals/admin/src/main/webapp
npm start  # Runs on http://localhost:8083/admin
```

### 2. Code Quality Standards

The project enforces strict coding standards:

#### ESLint Rules
- **Indentation**: 4 spaces (not tabs)
- **Max line length**: 120 characters
- **JSX quotes**: Single quotes
- **JSDoc**: Required for all functions
- **PropTypes**: Required for all components

#### Example Code Structure
```jsx
/*
 * Copyright (c) 2024, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 * Licensed under the Apache License, Version 2.0
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Example component following project standards
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

### 3. Pre-commit Checks

The project includes pre-commit hooks that automatically:
- ✅ Run ESLint on staged files
- ✅ Check for Cursor AI references
- ✅ Validate code formatting
- ✅ Ensure no console.log statements

### 4. Testing

```bash
# Run tests for specific portal
cd portals/publisher/src/main/webapp
npm test

# Run all tests
./run-tests.sh

# Run integration tests
cd tests
npm test
```

## 🔧 Available Scripts

### Development
```bash
npm start              # Start development server
npm run build:dev      # Development build with watch
npm run build:prod     # Production build
npm run lint           # Run ESLint
npm run test           # Run tests
```

### Internationalization
```bash
npm run i18n:en        # Extract English messages
npm run i18n:fr        # Extract French messages (admin only)
```

## 📝 Git Workflow

### Branch Naming
- `feature/description` - New features
- `bugfix/description` - Bug fixes  
- `hotfix/description` - Critical fixes
- `improvement/description` - Code improvements

### Commit Messages
Use conventional commit format:
```
feat(publisher): add new API creation wizard
fix(devportal): resolve authentication issue
docs(readme): update installation instructions
```

### Pull Request Process
1. Create feature branch from `main`
2. Make changes following coding standards
3. Write tests for new functionality
4. Run `npm run lint` and `npm test`
5. Create PR with clear description

## 🚫 Important Guidelines

### ❌ What NOT to do
- Don't use Cursor AI references in code or commits
- Don't commit without running linting
- Don't skip JSDoc comments
- Don't use console.log in production code
- Don't hardcode secrets or API keys

### ✅ What TO do
- Follow the established coding patterns
- Write comprehensive tests
- Update documentation
- Use proper error handling
- Follow the component structure

## 🎨 UI/UX Guidelines

### Material-UI Components
The project uses Material-UI (MUI) v5. Follow these patterns:

```jsx
import {
    Button,
    TextField,
    Box,
    Typography,
} from '@mui/material';

const MyComponent = () => (
    <Box sx={{ p: 2 }}>
        <Typography variant="h4" component="h1">
            Title
        </Typography>
        <TextField
            label="Input"
            variant="outlined"
            fullWidth
        />
        <Button variant="contained" color="primary">
            Submit
        </Button>
    </Box>
);
```

### Styling
- Use MUI's `sx` prop for styling
- Follow the established theme
- Use consistent spacing (multiples of 8px)
- Ensure responsive design

## 🌐 Internationalization

All user-facing text must be internationalized:

```jsx
import { FormattedMessage } from 'react-intl';

<FormattedMessage
    id="api.create.title"
    defaultMessage="Create New API"
/>
```

## 🔍 Code Review Checklist

Before submitting a PR, ensure:

- [ ] Code follows ESLint rules
- [ ] All tests pass
- [ ] JSDoc comments added
- [ ] PropTypes defined
- [ ] No Cursor AI references
- [ ] Proper error handling
- [ ] Internationalization implemented
- [ ] Responsive design maintained
- [ ] Performance considerations addressed

## 🆘 Getting Help

- **Documentation**: Check `CONTRIBUTING.md` for detailed guidelines
- **Code Examples**: Look at existing components for patterns
- **Issues**: Search GitHub issues for similar problems
- **Community**: Join WSO2 Slack channels

## 📊 Performance Guidelines

- Use React.lazy() for code splitting
- Monitor bundle size with `npm run analysis`
- Optimize images and assets
- Use proper memoization techniques

## 🔒 Security Guidelines

- Validate all user inputs
- Use HTTPS for external requests
- Sanitize data before rendering
- Never hardcode secrets

---

## 🎉 Ready to Contribute?

1. Run `./setup-dev.sh` to set up your environment
2. Choose a portal to work on
3. Follow the coding standards
4. Write tests for your changes
5. Submit a pull request

**Remember**: Quality over speed. Take time to write clean, maintainable code that follows the project's high standards.

Happy coding! 🚀