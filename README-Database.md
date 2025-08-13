# Database Setup Guide

## Cấu hình Database

### 1. Tạo file .env
Tạo file `.env` trong thư mục gốc với các cấu hình sau:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=vtv_db
DB_SSL=false

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# Password Hashing
PASSWORD_HASH_KEY=your-password-hash-key-here

# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=vu.tv0307@gmail.com
SMTP_PASS=dasv tcxn zrab xgla
SMTP_FROM=vu.tv0307@gmail.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 2. Tạo Database
Tạo database PostgreSQL với tên `vtv_db`:

```sql
CREATE DATABASE vtv_db;
```

### 3. Chạy Migrations
Chạy các migration để tạo bảng:

```bash
npm run migration:run
```

Các migration sẽ tạo:
- Bảng `users` với các trường cần thiết
- Bảng `refresh_tokens` cho JWT refresh
- Bảng `roles` và `user_roles` cho phân quyền

### 4. Chạy Seeds
Chạy seeds để tạo dữ liệu mẫu:

```bash
npm run seed:run
```

Seeds sẽ tạo:
- Các role: Admin, User, Moderator
- Tài khoản admin: `admin@vtv.com` / `admin123`

### 5. Kiểm tra Database
Sau khi chạy xong, bạn có thể kiểm tra database:

```sql
-- Kiểm tra bảng users
SELECT * FROM users;

-- Kiểm tra bảng roles
SELECT * FROM roles;

-- Kiểm tra bảng user_roles
SELECT * FROM user_roles;

-- Kiểm tra bảng refresh_tokens
SELECT * FROM refresh_tokens;
```

## Các lệnh hữu ích

### Migrations
```bash
# Chạy migrations
npm run migration:run

# Xem danh sách migrations
npm run migration:show

# Revert migration cuối cùng
npm run migration:revert
```

### Seeds
```bash
# Chạy seeds
npm run seed:run

# Revert seeds
npm run seed:revert
```

### Development
```bash
# Chạy ứng dụng ở chế độ development
npm run start:dev

# Build ứng dụng
npm run build

# Chạy ứng dụng production
npm run start:prod
```

## Cấu trúc Database

### Bảng Users
- `id`: Primary key (BIGSERIAL)
- `email`: Email người dùng (UNIQUE)
- `password_hash`: Mật khẩu đã hash
- `display_name`: Tên hiển thị
- `provider`: Loại đăng nhập (local, google, facebook)
- `provider_id`: ID từ provider bên ngoài
- `avatar_url`: URL avatar
- `deleted_at`: Thời gian xóa (soft delete)
- `created_at`: Thời gian tạo
- `updated_at`: Thời gian cập nhật

### Bảng Roles
- `id`: Primary key (BIGSERIAL)
- `type`: Loại role (admin, user, moderator)
- `name`: Tên role
- `description`: Mô tả role
- `deleted_at`: Thời gian xóa
- `created_at`: Thời gian tạo
- `updated_at`: Thời gian cập nhật

### Bảng User_Roles (Junction Table)
- `usersId`: Foreign key đến users.id
- `rolesId`: Foreign key đến roles.id

### Bảng Refresh_Tokens
- `id`: Primary key (BIGSERIAL)
- `user_id`: Foreign key đến users.id (UNIQUE)
- `token`: JWT refresh token (UNIQUE)
- `expires_at`: Thời gian hết hạn
- `is_revoked`: Trạng thái thu hồi
- `deleted_at`: Thời gian xóa
- `created_at`: Thời gian tạo
- `updated_at`: Thời gian cập nhật

## Troubleshooting

### Lỗi kết nối Database
1. Kiểm tra PostgreSQL đã chạy chưa
2. Kiểm tra thông tin kết nối trong file .env
3. Kiểm tra database `vtv_db` đã tồn tại chưa

### Lỗi Migration
1. Kiểm tra database connection
2. Xóa bảng migration nếu cần và chạy lại
3. Kiểm tra quyền của user database

### Lỗi Seed
1. Đảm bảo migrations đã chạy thành công
2. Kiểm tra dữ liệu seed có conflict không
3. Xóa dữ liệu cũ nếu cần thiết
