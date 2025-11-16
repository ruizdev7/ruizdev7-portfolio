# Data Persistence Guide

## ⚠️ Important: Docker Volumes

This project uses Docker volumes to persist database data. **Be careful with volume management commands.**

## ✅ Safe Commands

These commands **preserve** your data:

```bash
# Stop containers (keeps volumes)
docker compose down

# Start containers
docker compose up -d

# Restart containers
docker compose restart
```

## ⛔ Dangerous Commands

These commands **DELETE** your data:

```bash
# ⚠️ NEVER use this unless you want to delete ALL data
docker compose down -v

# ⚠️ Deletes the specific volume and ALL its data
docker volume rm mysql-dev-data
```

## 📊 Current Setup

### Development Environment
- **Volume Name**: `mysql-dev-data`
- **Mount Point**: `/var/lib/mysql` (inside container)
- **Configuration**: `docker-compose.development.yml`
- **Database**: `portfolio_app_dev`

### Backup Database

To backup your data:
```bash
docker compose exec mysql mysqldump -uportfolio_user -pportfolio_dev_pass portfolio_app_dev > backup.sql
```

### Restore Database

To restore from backup:
```bash
docker compose exec -T mysql mysql -uportfolio_user -pportfolio_dev_pass portfolio_app_dev < backup.sql
```

## 🔧 Volume Management

### Check Volume Status
```bash
# List all volumes
docker volume ls

# Inspect specific volume
docker volume inspect mysql-dev-data

# Check volume size
docker system df -v | grep mysql
```

### Seed Data

If you need to reset and reseed data:
```bash
# Drop and recreate database
docker compose exec backend flask db downgrade base
docker compose exec backend flask db upgrade

# Initialize roles and permissions
docker compose exec backend flask init-roles

# Seed pump data
docker compose exec backend python seed_pumps.py reset

# Create admin user
docker compose exec backend python3 -c "
from portfolio_app import create_app, db
from portfolio_app.models.tbl_users import User
from portfolio_app.models.tbl_roles import Roles
from portfolio_app.models.tbl_user_roles import UserRoles
from werkzeug.security import generate_password_hash

app = create_app()
with app.app_context():
    user = User(
        'Jorge',
        '',
        'Ruiz',
        'ruizdev7@outlook.com',
        generate_password_hash('admin123')
    )
    db.session.add(user)
    db.session.commit()
    
    admin_role = Roles.query.filter_by(role_name='admin').first()
    if admin_role:
        user_role = UserRoles(ccn_user=user.ccn_user, ccn_role=admin_role.ccn_role)
        db.session.add(user_role)
        db.session.commit()
        print('Admin user created successfully')
"
```

## 🧹 Cleanup Commands

### Safe Cleanup (preserves data)
```bash
# Remove containers but keep volumes
docker compose down

# Remove unused images
docker image prune

# Remove build cache
docker builder prune
```

### Complete Cleanup (⚠️ deletes data)
```bash
# Remove containers and volumes
docker compose down -v

# Remove all volumes
docker volume prune -a
```

## 💡 Tips

1. **Always backup before cleanup**: Use `mysqldump` before running `docker compose down -v`
2. **Check volume status**: Use `docker volume inspect mysql-dev-data` to verify data persistence
3. **Automate backups**: Consider adding a backup cron job for production
4. **Version control**: Keep your database migrations in version control
5. **Document passwords**: Keep your `.env` files secure but documented

## 📝 Production Considerations

For production environments:
- Use persistent volumes on cloud storage (AWS EBS, Azure Disk, etc.)
- Set up automated daily backups
- Implement point-in-time recovery
- Monitor disk space
- Use read replicas for high availability

