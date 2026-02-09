export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    PENDING = 'pending',
}

export enum UserRole {
    SUPER_ADMIN = 'super_admin',
    ADMIN = 'admin',
    EDITOR = 'editor',
    VIEWER = 'viewer',
}

export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    roles: UserRole[];
    status: UserStatus;
    avatarUrl?: string;
    emailVerified: boolean;
    twoFactorEnabled: boolean;
    lastLoginAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserListResponse {
    items: User[];
    meta: {
        total: number;
        count: number;
        limit: number;
        cursor?: string;
    };
}
