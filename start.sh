#!/bin/bash

# ===========================================
# Portfolio Application - Quick Start Script
# ===========================================

set -e  # Exit on any error

echo "🚀 Starting Portfolio Application..."
echo "=================================="

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

# Check if Docker is running
check_docker() {
    print_status "Checking Docker..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Check if MySQL is running (macOS)
check_mysql() {
    print_status "Checking MySQL..."
    if command -v brew >/dev/null 2>&1; then
        if brew services list | grep mysql | grep started > /dev/null 2>&1; then
            print_success "MySQL is running"
        else
            print_warning "MySQL is not running. Starting MySQL..."
            brew services start mysql
            sleep 3
            print_success "MySQL started"
        fi
    else
        print_warning "Homebrew not found. Please ensure MySQL is running manually."
    fi
}

# Check if database exists
check_database() {
    print_status "Checking database..."
    if mysql -u root -proot -e "USE portfolio_app_dev;" 2>/dev/null; then
        print_success "Database 'portfolio_app_dev' exists"
    else
        print_warning "Database 'portfolio_app_dev' does not exist. Creating..."
        mysql -u root -proot -e "CREATE DATABASE portfolio_app_dev;"
        print_success "Database created"
    fi
}

# Stop existing containers
stop_containers() {
    print_status "Stopping existing containers..."
    docker-compose -f docker-compose.local-mysql.yml down 2>/dev/null || true
    print_success "Containers stopped"
}

# Start the application
start_application() {
    print_status "Starting application..."
    docker-compose -f docker-compose.local-mysql.yml up --build -d
    
    # Wait for containers to be ready
    print_status "Waiting for containers to be ready..."
    sleep 10
    
    # Check if containers are running
    if docker ps | grep -q "ruizdev7-portfolio-backend" && docker ps | grep -q "ruizdev7-portfolio-frontend"; then
        print_success "Application started successfully!"
    else
        print_error "Failed to start application. Check logs with: docker-compose -f docker-compose.local-mysql.yml logs"
        exit 1
    fi
}

# Show application URLs
show_urls() {
    echo ""
    echo "🎉 Application is ready!"
    echo "========================"
    echo -e "${GREEN}Frontend:${NC} http://localhost:5173"
    echo -e "${GREEN}Backend API:${NC} http://localhost:8000"
    echo -e "${GREEN}API Test:${NC} http://localhost:8000/api/v1/posts"
    echo -e "${GREEN}Excalidraw:${NC} http://localhost:5001"
    echo ""
    echo "📋 Useful commands:"
    echo "  View logs: docker-compose -f docker-compose.local-mysql.yml logs -f"
    echo "  Stop app:  docker-compose -f docker-compose.local-mysql.yml down"
    echo "  Rebuild:   docker-compose -f docker-compose.local-mysql.yml up --build"
    echo ""
}

# Main execution
main() {
    echo "Starting Portfolio Application setup..."
    echo ""
    
    check_docker
    check_mysql
    check_database
    stop_containers
    start_application
    show_urls
}

# Run main function
main "$@" 