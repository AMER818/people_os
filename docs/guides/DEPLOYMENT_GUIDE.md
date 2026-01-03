# Deployment Guide - Hunzal People OS

**Version:** 2.0  
**Target:** Production Environment  
**Date:** 2025-12-29

---

## 📋 Pre-Deployment Checklist

### ✅ Development Complete
- [x] All core modules implemented
- [x] Tests passing (131/131)
- [x] Build succeeds without errors
- [x] Security features enabled
- [x] Documentation complete

### ⚙️ Infrastructure Requirements

**Server Specifications:**
- OS: Ubuntu 20.04+ / Windows Server 2019+
- RAM: 4GB minimum (8GB recommended)
- Storage: 20GB minimum
- Node.js: 18.x or higher
- Python: 3.9 or higher
- Database: PostgreSQL 13+ (recommended) or SQLite (development)

**Network:**
- Open ports: 80 (HTTP), 443 (HTTPS), 3001 (NestJS), 2000 (Python)
- Reverse proxy (Nginx/Apache)
- SSL/TLS certificate

---

## 🚀 Deployment Steps

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python 3.9+
sudo apt install -y python3 python3-pip

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx
```

### Step 2: Clone & Configure

```bash
# Clone repository
git clone <your-repo-url> /var/www/hunzal-hcm
cd /var/www/hunzal-hcm

# Create production .env
cp .env.example .env.production
nano .env.production
```

**`.env.production` Configuration:**
```env
# Frontend
PORT_PROD=3000
NODE_ENV=production

# NestJS Backend
PORT_API=3001
VITE_API_URL=https://api.yourcompany.com/api

# Python Backend
PORT_AI=2000
VITE_AI_API_URL=https://ai.yourcompany.com/api

# Database
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hunzal_hcm
DB_USER=hcm_user
DB_PASS=<strong_password>

# JWT Authentication (CRITICAL - Change in production!)
JWT_SECRET=<generate_strong_random_secret_min_32_chars>

# Security
CORS_ORIGIN=https://yourcompany.com
```

**Generate Strong JWT Secret:**
```bash
# Use Node.js crypto
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or use openssl
openssl rand -hex 64
```

### Step 3: Database Setup

```bash
# Create PostgreSQL database
sudo -u postgres psql
```

```sql
CREATE DATABASE hunzal_hcm;
CREATE USER hcm_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE hunzal_hcm TO hcm_user;
\q
```

**Update NestJS Database Config:**
```typescript
// hcm_api/src/app.module.ts
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [Employee, Candidate, Attendance, Payroll],
  synchronize: false, // NEVER true in production!
  migrations: ['dist/migrations/*.js'],
})
```

**Run Migrations:**
```bash
cd hcm_api
npm run migration:run
```

### Step 4: Build Frontend

```bash
# Install dependencies
npm install --production

# Build
npm run build

# Output: dist/ folder
```

### Step 5: Setup NestJS Backend

```bash
cd hcm_api

# Install dependencies
npm install --production

# Build
npm run build

# Create systemd service
sudo nano /etc/systemd/system/hunzal-nestjs.service
```

**NestJS Service File:**
```ini
[Unit]
Description=Hunzal HCM NestJS Backend
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/hunzal-hcm/hcm_api
Environment="NODE_ENV=production"
Environment="PORT=3001"
ExecStart=/usr/bin/node dist/main.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable hunzal-nestjs
sudo systemctl start hunzal-nestjs
sudo systemctl status hunzal-nestjs
```

### Step 6: Setup Python Backend

```bash
cd backend

# Install dependencies
pip3 install -r requirements.txt

# Create systemd service
sudo nano /etc/systemd/system/hunzal-python.service
```

**Python Service File:**
```ini
[Unit]
Description=Hunzal HCM Python AI Engine
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/hunzal-hcm/backend
Environment="PYTHONPATH=/var/www/hunzal-hcm/backend"
ExecStart=/usr/bin/python3 -m uvicorn main:app --host 0.0.0.0 --port 2000
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start
sudo systemctl enable hunzal-python
sudo systemctl start hunzal-python
sudo systemctl status hunzal-python
```

### Step 7: Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/hunzal-hcm
```

**Nginx Config:**
```nginx
# Frontend
server {
    listen 80;
    server_name yourcompany.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourcompany.com;
    
    ssl_certificate /etc/letsencrypt/live/yourcompany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourcompany.com/privkey.pem;
    
    root /var/www/hunzal-hcm/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}

# NestJS API
server {
    listen 443 ssl http2;
    server_name api.yourcompany.com;
    
    ssl_certificate /etc/letsencrypt/live/yourcompany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourcompany.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Python AI
server {
    listen 443 ssl http2;
    server_name ai.yourcompany.com;
    
    ssl_certificate /etc/letsencrypt/live/yourcompany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourcompany.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:2000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/hunzal-hcm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 8: SSL Certificate (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourcompany.com -d api.yourcompany.com -d ai.yourcompany.com
```

---

## 🔍 Post-Deployment Verification

### Health Checks

```bash
# Frontend
curl https://yourcompany.com

# NestJS API
curl https://api.yourcompany.com/api/employees

# Python AI
curl https://ai.yourcompany.com/docs

# Services status
sudo systemctl status hunzal-nestjs
sudo systemctl status hunzal-python
```

### Logs Monitoring

```bash
# NestJS logs
sudo journalctl -u hunzal-nestjs -f

# Python logs
sudo journalctl -u hunzal-python -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🔒 Security Hardening

### Firewall Setup (UFW)

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Database Security

```bash
# Edit PostgreSQL config
sudo nano /etc/postgresql/13/main/pg_hba.conf
```

Change to:
```
local   all             all                                     peer
host    hunzal_hcm     hcm_user       127.0.0.1/32           md5
```

```bash
sudo systemctl restart postgresql
```

### Regular Updates

```bash
# Create update script
sudo nano /opt/update-hunzal.sh
```

```bash
#!/bin/bash
cd /var/www/hunzal-hcm
git pull origin main
npm install --production
npm run build
cd hcm_api && npm run build
sudo systemctl restart hunzal-nestjs
sudo systemctl restart hunzal-python
sudo systemctl reload nginx
```

```bash
chmod +x /opt/update-hunzal.sh
```

---

## 📊 Monitoring Setup

### PM2 (Alternative to systemd)

```bash
npm install -g pm2

# NestJS
cd hcm_api
pm2 start dist/main.js --name hunzal-nestjs

# Save config
pm2 save
pm2 startup
```

### Log Rotation

```bash
sudo nano /etc/logrotate.d/hunzal-hcm
```

```
/var/log/hunzal/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}
```

---

## 🆘 Troubleshooting

### Issue: Service won't start

```bash
# Check logs
sudo journalctl -xe

# Check permissions
sudo chown -R www-data:www-data /var/www/hunzal-hcm
```

### Issue: Database connection failed

```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -h localhost -U hcm_user -d hunzal_hcm
```

### Issue: CORS errors

Update NestJS `main.ts`:
```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
});
```

---

## 🔄 Backup & Recovery

### Automated Backup Script

```bash
sudo nano /opt/backup-hunzal.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backups/hunzal-$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -U hcm_user hunzal_hcm > $BACKUP_DIR/database.sql

# Application backup
tar -czf $BACKUP_DIR/app.tar.gz /var/www/hunzal-hcm

# Cleanup old backups (keep 30 days)
find /backups -type d -mtime +30 -exec rm -rf {} \;
```

```bash
chmod +x /opt/backup-hunzal.sh

# Add to crontab
sudo crontab -e
# Add: 0 2 * * * /opt/backup-hunzal.sh
```

---

## ✅ Deployment Checklist

- [ ] Server provisioned
- [ ] SSL certificate installed
- [ ] Database created and migrated
- [ ] Environment variables configured
- [ ] All services running
- [ ] Nginx configured
- [ ] Health checks passing
- [ ] Backups configured
- [ ] Monitoring enabled
- [ ] Firewall configured
- [ ] Documentation updated

---

**Deployment Complete!** 🚀

For support, contact: support@hunzal.com
