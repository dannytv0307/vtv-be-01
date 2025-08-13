# VTV Backend - Docker Setup

## Tổng quan
Dự án này đã được dockerize với PostgreSQL và Redis. Dữ liệu được lưu trữ trong thư mục `./data/` trên máy host.

## Cấu trúc thư mục
```
vtv-be-01/
├── data/                    # Dữ liệu persistent
│   ├── postgres/           # Dữ liệu PostgreSQL
│   └── redis/              # Dữ liệu Redis
├── src/                    # Source code ứng dụng
├── Dockerfile              # Docker image cho ứng dụng
├── docker-compose.yml      # Docker Compose configuration
├── .dockerignore           # Files bị loại trừ khi build
└── healthcheck.js          # Health check script
```

## Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Tạo thư mục data (nếu chưa có)
```bash
mkdir -p data/postgres data/redis
```

### 3. Chạy ứng dụng với Docker Compose
```bash
# Build và chạy tất cả services
docker-compose up --build

# Chạy ở background
docker-compose up -d --build

# Chỉ chạy database và Redis
docker-compose up -d postgres redis
```

### 4. Kiểm tra trạng thái
```bash
# Xem logs
docker-compose logs -f

# Xem logs của service cụ thể
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis

# Kiểm tra trạng thái services
docker-compose ps
```

## Truy cập ứng dụng

- **NestJS App**: http://localhost:3000
- **PostgreSQL**: localhost:5432
  - Database: vtv_db
  - User: vtv-dev-1
  - Password: abc@123
- **Redis**: localhost:6379
  - Password: abc@123

## Dừng và xóa

```bash
# Dừng tất cả services
docker-compose down

# Dừng và xóa volumes (CẢNH BÁO: sẽ xóa dữ liệu)
docker-compose down -v

# Dừng và xóa images
docker-compose down --rmi all
```

## Backup và Restore

### Backup PostgreSQL
```bash
# Backup database
docker exec vtv_postgres pg_dump -U vtv-dev-1 vtv_db > backup.sql

# Backup toàn bộ thư mục data
tar -czf data-backup.tar.gz data/
```

### Restore PostgreSQL
```bash
# Restore từ file backup
docker exec -i vtv_postgres psql -U vtv-dev-1 vtv_db < backup.sql

# Restore từ thư mục data
tar -xzf data-backup.tar.gz
```

## Troubleshooting

### 1. Lỗi permission với thư mục data
```bash
# Trên Linux/Mac
sudo chown -R 999:999 data/postgres
sudo chown -R 1001:1001 data/redis
```

### 2. Reset database
```bash
# Xóa dữ liệu PostgreSQL
rm -rf data/postgres/*

# Restart services
docker-compose restart postgres
```

### 3. Kiểm tra logs
```bash
# Xem logs chi tiết
docker-compose logs --tail=100 app
```

## Environment Variables

Các biến môi trường có thể được cấu hình trong `docker-compose.yml`:

- `POSTGRES_DB`: Tên database
- `POSTGRES_USER`: Username PostgreSQL (vtv-dev-1)
- `POSTGRES_PASSWORD`: Password PostgreSQL (abc@123)
- `DATABASE_HOST`: Host database (trong container)
- `REDIS_HOST`: Host Redis (trong container)
- `REDIS_PASSWORD`: Password Redis (abc@123)

## Lưu ý quan trọng

1. **Dữ liệu persistent**: Dữ liệu được lưu trong thư mục `./data/` trên máy host
2. **Auto-sync**: TypeORM sẽ tự động tạo bảng theo entity schema
3. **Health checks**: Tất cả services đều có health check
4. **Security**: Ứng dụng chạy với non-root user trong container
