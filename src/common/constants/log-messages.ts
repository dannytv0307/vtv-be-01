export const LOG_MESSAGES = {
  INFO: {
    USER_CREATED: {
      code: 'INFO_001',
      message: 'User created successfully',
    },
    USER_UPDATED: {
      code: 'INFO_002',
      message: 'User updated successfully',
    },
    USER_DELETED: {
      code: 'INFO_003',
      message: 'User deleted successfully',
    },
    EMAIL_SENT: {
      code: 'INFO_004',
      message: 'Email sent successfully',
    },
    TOKEN_GENERATED: {
      code: 'INFO_005',
      message: 'Token generated successfully',
    },
  },
  WARN: {
    CREATE_USER_FAILED: {
      code: 'WARN_001',
      message: 'Failed to create user',
    },
    UPDATE_USER_FAILED: {
      code: 'WARN_002',
      message: 'Failed to update user',
    },
    DELETE_USER_FAILED: {
      code: 'WARN_003',
      message: 'Failed to delete user',
    },
    EMAIL_SEND_FAILED: {
      code: 'WARN_004',
      message: 'Failed to send email',
    },
    TOKEN_GENERATION_FAILED: {
      code: 'WARN_005',
      message: 'Failed to generate token',
    },
  },
  ERROR: {
    DATABASE_CONNECTION_FAILED: {
      code: 'ERR_001',
      message: 'Database connection failed',
    },
    REDIS_CONNECTION_FAILED: {
      code: 'ERR_002',
      message: 'Redis connection failed',
    },
    EMAIL_SERVICE_FAILED: {
      code: 'ERR_003',
      message: 'Email service failed',
    },
    AUTHENTICATION_FAILED: {
      code: 'ERR_004',
      message: 'Authentication failed',
    },
    AUTHORIZATION_FAILED: {
      code: 'ERR_005',
      message: 'Authorization failed',
    },
  },
} as const;
