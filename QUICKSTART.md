# 🚀 Quick Start Guide

Get your portfolio application running in 5 minutes!

## Prerequisites Check

Make sure you have these installed:
- ✅ Docker & Docker Compose
- ✅ MySQL (local installation)
- ✅ Git

## ⚡ Quick Setup

### 1. Clone and Navigate
```bash
git clone https://github.com/ruizdev7/ruizdev7-portfolio.git
cd ruizdev7-portfolio
```

### 2. Setup MySQL (if not already done)
```bash
# Start MySQL
brew services start mysql

# Create database
mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS portfolio_app_dev;"
```

### 3. Start the Application
```bash
docker-compose -f docker-compose.local-mysql.yml up --build
```

### 4. Access Your App
- 🌐 **Frontend**: http://localhost:5173
- 🔧 **Backend API**: http://localhost:8000
- 📊 **API Test**: http://localhost:8000/api/v1/posts

## 🎯 What's Running

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React application |
| Backend | http://localhost:8000 | Flask API |
| Excalidraw | http://localhost:5001 | Diagram tool |
| Proxy Manager | http://localhost:81 | Nginx proxy |

## 🔑 Default Credentials

For testing, you can use:
- **Email**: `ruizdev7@outlook.com`
- **Password**: (Check your database or create a new user)

## 🛠️ Useful Commands

```bash
# View logs
docker-compose -f docker-compose.local-mysql.yml logs -f

# Stop application
docker-compose -f docker-compose.local-mysql.yml down

# Rebuild containers
docker-compose -f docker-compose.local-mysql.yml up --build

# Access backend container
docker exec -it backend bash

# Check MySQL connection
mysql -u root -proot -e "USE portfolio_app_dev; SHOW TABLES;"
```

## 🐛 Common Issues

**Port 5000 conflict on macOS?**
- ✅ Already solved! Using port 6000 internally

**MySQL connection failed?**
```bash
# Check if MySQL is running
brew services list | grep mysql

# Test connection
mysql -u root -proot -e "SELECT 1;"
```

**Frontend not loading?**
- Check if containers are running: `docker ps`
- Verify proxy configuration in `frontend/vite.config.js`

## 📚 Next Steps

1. **Explore the API**: Visit http://localhost:8000/api/v1/posts
2. **Check the frontend**: Navigate to http://localhost:5173
3. **Read the full documentation**: See [README.md](README.md)
4. **Start developing**: Modify code and see changes in real-time!

---

**Need help?** Check the [full README](README.md) for detailed troubleshooting and configuration options. 