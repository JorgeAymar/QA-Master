# Deployment

This guide covers deploying QA Master to production environments.

## Deployment Options

### Option 1: Docker Deployment (Recommended)

Docker deployment is the easiest and most reliable method for production.

#### Prerequisites

- VPS or cloud server (Ubuntu 20.04+ recommended)
- Docker and Docker Compose installed
- Domain name pointing to your server
- SSL certificate (Let's Encrypt recommended)

#### Step-by-Step Deployment

**1. Prepare Your Server**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Add your user to docker group
sudo usermod -aG docker $USER
```

**2. Clone the Repository**

```bash
cd /opt
sudo git clone https://github.com/JorgeAymar/QA-Master.git
cd QA-Master
```

**3. Configure Environment**

```bash
# Copy example environment file
cp env.example .env

# Edit with your production values
nano .env
```

**Production `.env` example:**

```env
# Database
POSTGRES_USER=qa_user
POSTGRES_PASSWORD=GENERATE_SECURE_PASSWORD_HERE
POSTGRES_DB=qa_db
DATABASE_URL="postgresql://qa_user:SAME_PASSWORD@postgres:5432/qa_db?schema=public"

# Authentication
JWT_SECRET="GENERATE_SECURE_RANDOM_STRING_MIN_32_CHARS"

# OpenAI
OPENAI_API_KEY="your-production-openai-key"

# Email (Optional)
EMAIL_HOST="smtp.yourdomain.com"
EMAIL_PORT="587"
EMAIL_USER="noreply@yourdomain.com"
EMAIL_PASSWORD="your-email-password"
EMAIL_FROM="QA Master <noreply@yourdomain.com>"

# Application
NODE_ENV=production
APP_PORT=3001
```

> 🔒 **Security**: Generate strong passwords and secrets. Never use example values!

**4. Build and Start**

```bash
# Build containers
docker-compose build --no-cache

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

**5. Initialize Database**

```bash
# Run migrations
docker-compose exec app npx prisma migrate deploy

# Verify database
docker-compose exec app npx prisma db pull
```

**6. Configure Nginx (Reverse Proxy)**

Create nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/qamaster
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/qamaster /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**7. Set Up SSL with Let's Encrypt**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

**8. Create First Admin User**

1. Navigate to `https://your-domain.com`
2. Click "Sign Up"
3. Create your account (first user becomes ADMIN)

### Option 2: Platform as a Service (PaaS)

#### Vercel Deployment

QA Master can be deployed to Vercel with an external PostgreSQL database.

**Requirements:**
- Vercel account
- External PostgreSQL database (e.g., Supabase, Railway, Neon)

**Steps:**

1. **Connect Repository**
   - Import your GitHub repository to Vercel

2. **Configure Environment Variables**
   Add these in Vercel dashboard:
   ```
   DATABASE_URL=your-external-postgres-url
   JWT_SECRET=your-secure-secret
   OPENAI_API_KEY=your-openai-key
   NODE_ENV=production
   ```

3. **Deploy**
   - Vercel will automatically build and deploy

> ⚠️ **Note**: Playwright tests may have limitations on Vercel due to serverless constraints.

#### Railway Deployment

Railway provides both application hosting and PostgreSQL.

**Steps:**

1. **Create New Project**
   - Connect your GitHub repository

2. **Add PostgreSQL Service**
   - Railway will provide DATABASE_URL automatically

3. **Set Environment Variables**
   ```
   JWT_SECRET=your-secure-secret
   OPENAI_API_KEY=your-openai-key
   NODE_ENV=production
   ```

4. **Deploy**
   - Railway handles build and deployment

## Post-Deployment

### Health Checks

Verify your deployment:

```bash
# Check application logs
docker-compose logs -f app

# Check database connection
docker-compose exec app npx prisma db pull

# Monitor resources
docker stats
```

### Monitoring

Set up monitoring for:

- **Application uptime**: Use UptimeRobot or similar
- **Error tracking**: Configure logging
- **Resource usage**: Monitor CPU, memory, disk
- **API usage**: Track OpenAI API calls

### Backups

**Database Backups:**

```bash
# Create backup script
cat > backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U qa_user qa_db > backup_$DATE.sql
EOF

chmod +x backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /opt/QA-Master/backup-db.sh
```

**Restore from Backup:**

```bash
docker-compose exec -T postgres psql -U qa_user qa_db < backup_YYYYMMDD_HHMMSS.sql
```

### Updates

To update your deployment:

```bash
cd /opt/QA-Master

# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose build --no-cache app
docker-compose up -d

# Run migrations if needed
docker-compose exec app npx prisma migrate deploy
```

## Security Checklist

Before going to production:

- [ ] Strong database password set
- [ ] JWT_SECRET is random and secure (32+ characters)
- [ ] SSL/HTTPS enabled
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] Regular backups scheduled
- [ ] Environment variables not committed to git
- [ ] OpenAI API key secured
- [ ] Email credentials secured (if used)
- [ ] Database not exposed to public internet
- [ ] Regular security updates scheduled

## Performance Optimization

### Database

```bash
# Optimize PostgreSQL
docker-compose exec postgres psql -U qa_user -d qa_db -c "VACUUM ANALYZE;"
```

### Application

- Enable production mode: `NODE_ENV=production`
- Use CDN for static assets
- Implement caching strategies
- Monitor and optimize slow queries

### Scaling

For high-traffic scenarios:

1. **Horizontal Scaling**: Deploy multiple app instances behind a load balancer
2. **Database Scaling**: Use read replicas for better performance
3. **Caching**: Implement Redis for session and data caching

## Troubleshooting

### Application Won't Start

```bash
# Check logs
docker-compose logs app

# Common issues:
# - Database not ready: Wait a few seconds and retry
# - Port conflict: Change APP_PORT in .env
# - Missing env vars: Verify .env file
```

### Database Connection Issues

```bash
# Verify database is running
docker-compose ps postgres

# Test connection
docker-compose exec app npx prisma db pull

# Reset database (CAUTION: deletes all data)
docker-compose down -v
docker-compose up -d
docker-compose exec app npx prisma db push
```

### SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

## Maintenance

### Regular Tasks

**Weekly:**
- Review application logs
- Check disk space
- Monitor API usage

**Monthly:**
- Update dependencies
- Review security advisories
- Test backup restoration

**Quarterly:**
- Security audit
- Performance review
- Capacity planning

---

*For more help, see [Troubleshooting](Troubleshooting) or [Configuration](Configuration) guides.*
