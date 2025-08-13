export const ERROR_MESSAGES = {
  AUTH: {
    EMAIL_IN_USE: {
      code: 'AUTH_001',
      message: 'Email đã được sử dụng',
    },
    INVALID_CREDENTIALS: {
      code: 'AUTH_002',
      message: 'Email hoặc mật khẩu không đúng',
    },
    TOKEN_EXPIRED: {
      code: 'AUTH_003',
      message: 'Token đã hết hạn',
    },
    INVALID_TOKEN: {
      code: 'AUTH_004',
      message: 'Token không hợp lệ',
    },
    UNAUTHORIZED: {
      code: 'AUTH_005',
      message: 'Không có quyền truy cập',
    },
    VERIFY_LINK_EXPIRED: {
      code: 'AUTH_006',
      message: 'Verify mail link đã hết hiệu lực',
    },
  },
  USER: {
    NOT_FOUND: {
      code: 'USER_001',
      message: 'Người dùng không tồn tại',
    },
    ALREADY_EXISTS: {
      code: 'USER_002',
      message: 'Người dùng đã tồn tại',
    },
  },
  VALIDATION: {
    INVALID_EMAIL: {
      code: 'VAL_001',
      message: 'Email không hợp lệ',
    },
    PASSWORD_TOO_SHORT: {
      code: 'VAL_002',
      message: 'Mật khẩu phải có ít nhất 6 ký tự',
    },
    REQUIRED_FIELD: {
      code: 'VAL_003',
      message: 'Trường này là bắt buộc',
    },
  },
} as const;
