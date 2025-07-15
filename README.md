# Portfolio Application

A full-stack portfolio application built with Flask (Backend), React (Frontend), and MySQL (Database).

## 🚀 Features

- **Backend**: Flask REST API with JWT authentication
- **Frontend**: React with Vite, Redux Toolkit, and Tailwind CSS
- **Database**: MySQL with SQLAlchemy ORM
- **Containerization**: Docker and Docker Compose
- **Authentication**: JWT-based authentication system
- **Blog System**: Posts, categories, and comments management

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
- [MySQL](https://dev.mysql.com/doc/mysql-installation-excerpt/8.0/en/) (v8.0+) - Local installation
- [Git](https://git-scm.com/)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ruizdev7/ruizdev7-portfolio.git
cd ruizdev7-portfolio
```

### 2. Database Setup

#### Option A: Using Local MySQL (Recommended for Development)

1. **Install MySQL locally** (if not already installed):
   ```bash
   # macOS (using Homebrew)
   brew install mysql
   brew services start mysql
   
   # Ubuntu/Debian
   sudo apt update
   sudo apt install mysql-server
   sudo systemctl start mysql
   
   # Windows
   # Download and install from https://dev.mysql.com/downloads/mysql/
   ```

2. **Create the database**:
   ```bash
   mysql -u root -p
   ```
   ```sql
   CREATE DATABASE portfolio_app_dev;
   EXIT;
   ```

3. **Set MySQL password** (if not already set):
   ```bash
   mysql -u root -p
   ```
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
   FLUSH PRIVILEGES;
   EXIT;
   ```

#### Option B: Using Docker MySQL

If you prefer to use the containerized MySQL:

```bash
# Use the standard docker-compose files
docker-compose -f docker-compose.yml -f docker-compose.development.yml up --build
```

### 3. Run the Application

#### For Development (with Local MySQL)

```bash
# Start the application using local MySQL
docker-compose -f docker-compose.local-mysql.yml up --build
```

#### For Production

```bash
# Start all services including MySQL container
docker-compose -f docker-compose.yml -f docker-compose.development.yml up --build
```

### 4. Access the Application

Once the containers are running, you can access:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/v1/
- **Excalidraw**: http://localhost:5001
- **Proxy Manager**: http://localhost:81

## 📁 Project Structure

```
ruizdev7-portfolio/
├── backend/
│   ├── portfolio_app/
│   │   ├── models/          # Database models
│   │   ├── resources/       # API endpoints
│   │   ├── schemas/         # Data serialization
│   │   └── __init__.py      # Flask app factory
│   ├── migrations/          # Database migrations
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── RTK_Query_app/  # Redux Toolkit setup
│   │   └── layouts/        # Layout components
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml              # Base configuration
├── docker-compose.development.yml  # Development overrides
├── docker-compose.local-mysql.yml  # Local MySQL configuration
└── README.md
```

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables:

#### Backend (.env.development)
```env
# Database Configuration
DB_USER=root
DB_PASSWORD=root
DB_HOST=host.docker.internal  # For local MySQL
DB_PORT=3306
DB_NAME=portfolio_app_dev

# Flask Configuration
SECRET_KEY=super-secret-key-development
FLASK_ENV=development
FLASK_DEBUG=1

# JWT Configuration
JWT_SECRET_KEY=default-jwt-secret
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=3600
JWT_BLACKLIST_ENABLED=True
JWT_BLACKLIST_TOKEN_CHECKS=access,refresh

# CORS Configuration
CORS_HEADERS=Content-Type
```

### Port Configuration

- **Frontend**: 5173 (mapped to 3000 in container)
- **Backend**: 8000 (mapped to 6000 in container)
- **MySQL**: 3306 (local) or containerized
- **Excalidraw**: 5001
- **Proxy Manager**: 80, 81, 443

## 🚀 Development

### Running in Development Mode

1. **Start the application**:
   ```bash
   docker-compose -f docker-compose.local-mysql.yml up --build
   ```

2. **View logs**:
   ```bash
   docker-compose -f docker-compose.local-mysql.yml logs -f
   ```

3. **Stop the application**:
   ```bash
   docker-compose -f docker-compose.local-mysql.yml down
   ```

### Database Migrations

If you need to run database migrations:

```bash
# Access the backend container
docker exec -it backend bash

# Run migrations
flask db upgrade
```

### Creating a New User

To create a new user for testing:

```bash
# Access MySQL
mysql -u root -proot -e "USE portfolio_app_dev; INSERT INTO tbl_users (email, password, full_name) VALUES ('test@example.com', 'scrypt:32768:8:1$hash$password_hash', 'Test User');"
```

## 🔍 API Endpoints

### Authentication
- `POST /api/v1/token` - Login
- `GET /api/v1/refresh-token` - Refresh token
- `DELETE /api/v1/logout` - Logout
- `GET /api/v1/whoami` - Get current user

### Posts
- `GET /api/v1/posts` - Get all posts
- `GET /api/v1/posts/featured_post` - Get featured post
- `GET /api/v1/posts-table` - Get posts for table view

### Users
- `POST /api/v1/user` - Create user
- `PUT /api/v1/users/{id}/email` - Update user email
- `PUT /api/v1/users/{id}/password` - Update user password

## 🐛 Troubleshooting

### Common Issues

1. **Port 5000 already in use (macOS)**:
   - The application is configured to use port 6000 internally to avoid conflicts with AirPlay
   - If you see port conflicts, check the Dockerfile and docker-compose files

2. **MySQL connection issues**:
   - Ensure MySQL is running locally: `brew services list | grep mysql`
   - Verify credentials: `mysql -u root -proot -e "SELECT 1;"`
   - Check if the database exists: `mysql -u root -proot -e "SHOW DATABASES;"`

3. **Frontend not connecting to backend**:
   - Verify the proxy configuration in `frontend/vite.config.js`
   - Check that the backend is running on port 8000
   - Ensure CORS is properly configured

4. **Container build issues**:
   - Clean Docker cache: `docker system prune -a`
   - Rebuild without cache: `docker-compose build --no-cache`

### Logs and Debugging

```bash
# View all logs
docker-compose -f docker-compose.local-mysql.yml logs

# View specific service logs
docker-compose -f docker-compose.local-mysql.yml logs backend
docker-compose -f docker-compose.local-mysql.yml logs frontend

# Follow logs in real-time
docker-compose -f docker-compose.local-mysql.yml logs -f
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Joseph Ruiz** - [ruizdev7](https://github.com/ruizdev7)

## 🙏 Acknowledgments

- Flask community for the excellent web framework
- React team for the amazing frontend library
- Docker team for containerization tools
- All contributors and supporters

---

**Note**: This application is configured for development use. For production deployment, ensure to:
- Change default passwords and secrets
- Configure proper SSL certificates
- Set up proper database backups
- Configure environment-specific settings 