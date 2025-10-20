#!/bin/bash

# WSO2 API Manager Apps - Development Environment Setup Script
# This script sets up the development environment for contributing to the project

set -e

echo "🚀 Setting up WSO2 API Manager Apps development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
        
        # Check if version is 22.x or later
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 22 ]; then
            print_warning "Node.js version $NODE_VERSION detected. Version 22.x or later is recommended."
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 22.x or later from https://nodejs.org/"
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm is installed: $NPM_VERSION"
        
        # Check if version is 10.0.0 or later
        NPM_MAJOR=$(echo $NPM_VERSION | cut -d'.' -f1)
        if [ "$NPM_MAJOR" -lt 10 ]; then
            print_warning "npm version $NPM_VERSION detected. Version 10.0.0 or later is recommended."
        fi
    else
        print_error "npm is not installed. Please install npm 10.0.0 or later."
        exit 1
    fi
}

# Setup git configuration
setup_git() {
    print_status "Setting up git configuration..."
    
    # Check if git is configured
    if ! git config --global user.name &> /dev/null; then
        print_warning "Git user.name is not configured. Please set it up:"
        echo "git config --global user.name 'Your Name'"
    fi
    
    if ! git config --global user.email &> /dev/null; then
        print_warning "Git user.email is not configured. Please set it up:"
        echo "git config --global user.email 'your.email@example.com'"
    fi
    
    # Ensure no Cursor AI references
    CURRENT_NAME=$(git config --global user.name)
    CURRENT_EMAIL=$(git config --global user.email)
    
    if [[ "$CURRENT_NAME" == *"Cursor"* ]] || [[ "$CURRENT_EMAIL" == *"cursor"* ]]; then
        print_warning "Cursor AI references detected in git config. Please update:"
        echo "git config --global user.name 'Your Name'"
        echo "git config --global user.email 'your.email@example.com'"
    else
        print_success "Git configuration looks good: $CURRENT_NAME <$CURRENT_EMAIL>"
    fi
}

# Install dependencies for all portals
install_dependencies() {
    print_status "Installing dependencies for all portals..."
    
    PORTALS=("publisher" "devportal" "admin")
    
    for portal in "${PORTALS[@]}"; do
        print_status "Installing dependencies for $portal portal..."
        cd "portals/$portal/src/main/webapp"
        
        if [ -f "package.json" ]; then
            npm ci
            print_success "Dependencies installed for $portal portal"
        else
            print_warning "package.json not found for $portal portal"
        fi
        
        cd - > /dev/null
    done
}

# Setup pre-commit hooks
setup_hooks() {
    print_status "Setting up pre-commit hooks..."
    
    # Create .git/hooks directory if it doesn't exist
    mkdir -p .git/hooks
    
    # Create pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# Pre-commit hook for WSO2 API Manager Apps
# This hook runs linting and basic checks before commits

echo "🔍 Running pre-commit checks..."

# Get the list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|jsx|ts|tsx)$')

if [ -z "$STAGED_FILES" ]; then
    echo "✅ No JavaScript/TypeScript files to check"
    exit 0
fi

# Check for Cursor AI references
echo "🔍 Checking for Cursor AI references..."
if echo "$STAGED_FILES" | xargs grep -l -i "cursor\|ai\|assistant" 2>/dev/null; then
    echo "❌ Error: Cursor AI references found in staged files"
    echo "Please remove any references to Cursor, AI, or assistant from your code"
    exit 1
fi

# Run ESLint on staged files
echo "🔍 Running ESLint..."
for file in $STAGED_FILES; do
    if [ -f "$file" ]; then
        # Find the appropriate ESLint config
        PORTAL_DIR=$(echo "$file" | cut -d'/' -f2)
        ESLINT_CONFIG="portals/$PORTAL_DIR/src/main/webapp/.eslintrc.js"
        
        if [ -f "$ESLINT_CONFIG" ]; then
            npx eslint --config "$ESLINT_CONFIG" "$file"
            if [ $? -ne 0 ]; then
                echo "❌ ESLint errors found in $file"
                exit 1
            fi
        fi
    fi
done

echo "✅ Pre-commit checks passed!"
exit 0
EOF

    # Make the hook executable
    chmod +x .git/hooks/pre-commit
    
    print_success "Pre-commit hooks installed"
}

# Create development scripts
create_dev_scripts() {
    print_status "Creating development scripts..."
    
    # Create a script to start all portals
    cat > start-all-portals.sh << 'EOF'
#!/bin/bash

# Start all WSO2 API Manager portals in development mode

echo "🚀 Starting all WSO2 API Manager portals..."

# Function to start a portal
start_portal() {
    local portal=$1
    local port=$2
    
    echo "Starting $portal portal on port $port..."
    cd "portals/$portal/src/main/webapp"
    npm start &
    cd - > /dev/null
}

# Start all portals
start_portal "publisher" "8081"
start_portal "devportal" "8084" 
start_portal "admin" "8083"

echo "✅ All portals started!"
echo "Publisher: http://localhost:8081/publisher"
echo "DevPortal: http://localhost:8084/devportal"
echo "Admin: http://localhost:8083/admin"
echo ""
echo "Press Ctrl+C to stop all portals"
wait
EOF

    chmod +x start-all-portals.sh
    
    # Create a script to run tests
    cat > run-tests.sh << 'EOF'
#!/bin/bash

# Run tests for all portals

echo "🧪 Running tests for all portals..."

PORTALS=("publisher" "devportal" "admin")

for portal in "${PORTALS[@]}"; do
    echo "Running tests for $portal portal..."
    cd "portals/$portal/src/main/webapp"
    
    if [ -f "package.json" ]; then
        npm run test:ci
        if [ $? -ne 0 ]; then
            echo "❌ Tests failed for $portal portal"
            exit 1
        fi
    fi
    
    cd - > /dev/null
done

echo "✅ All tests passed!"
EOF

    chmod +x run-tests.sh
    
    print_success "Development scripts created"
}

# Main execution
main() {
    echo "=========================================="
    echo "WSO2 API Manager Apps - Dev Setup"
    echo "=========================================="
    echo ""
    
    check_node
    check_npm
    setup_git
    install_dependencies
    setup_hooks
    create_dev_scripts
    
    echo ""
    echo "=========================================="
    print_success "Development environment setup complete!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Update your git configuration if needed:"
    echo "   git config --global user.name 'Your Name'"
    echo "   git config --global user.email 'your.email@example.com'"
    echo ""
    echo "2. Start development:"
    echo "   ./start-all-portals.sh  # Start all portals"
    echo "   cd portals/publisher/src/main/webapp && npm start  # Start specific portal"
    echo ""
    echo "3. Run tests:"
    echo "   ./run-tests.sh  # Run all tests"
    echo ""
    echo "4. Read CONTRIBUTING.md for detailed guidelines"
    echo ""
    print_success "Happy coding! 🎉"
}

# Run main function
main