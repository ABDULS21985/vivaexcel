/**
 * Entity Types
 *
 * This file contains TypeScript types for all dashboard entities.
 * These types are used throughout the application for type safety.
 */

// ============================================================================
// Products
// ============================================================================

export interface Product {
    id: string;
    name: string;
    tagline: string;
    description: string;
    status: "draft" | "published" | "archived";
    accentColor: string;
    websiteUrl: string;
    features: string[];
    createdAt: string;
    updatedAt?: string;
}

export interface CreateProductDto {
    name: string;
    tagline: string;
    description: string;
    status?: "draft" | "published" | "archived";
    accentColor?: string;
    websiteUrl?: string;
    features?: string[];
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

// ============================================================================
// Services
// ============================================================================

export interface Service {
    id: string;
    name: string;
    slug: string;
    shortDescription: string;
    fullDescription: string;
    category: string;
    status: "draft" | "published" | "archived";
    icon: string;
    features: string[];
    benefits: string[];
    createdAt: string;
    updatedAt?: string;
}

export interface CreateServiceDto {
    name: string;
    slug: string;
    shortDescription: string;
    fullDescription?: string;
    category: string;
    status?: "draft" | "published" | "archived";
    icon?: string;
    features?: string[];
    benefits?: string[];
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {}

// ============================================================================
// Posts
// ============================================================================

export interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage?: string;
    category: PostCategory;
    tag?: PostTag;
    author: PostAuthor;
    status: "draft" | "published" | "archived";
    publishedAt?: string;
    readingTime?: number;
    views?: number;
    createdAt: string;
    updatedAt?: string;
}

export interface PostCategory {
    id: string;
    name: string;
    slug: string;
}

export interface PostTag {
    id: string;
    name: string;
    slug: string;
}

export interface PostAuthor {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
    twitter?: string;
    linkedin?: string;
}

export interface CreatePostDto {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage?: string;
    categoryId: string;
    tagId?: string;
    authorId: string;
    status?: "draft" | "published" | "archived";
    publishedAt?: string;
}

export interface UpdatePostDto extends Partial<CreatePostDto> {}

// ============================================================================
// Contacts
// ============================================================================

export interface Contact {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    subject: string;
    message: string;
    status: "new" | "read" | "in_progress" | "replied" | "closed" | "spam";
    notes?: string;
    assignedTo?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface UpdateContactDto {
    status?: Contact["status"];
    notes?: string;
    assignedTo?: string;
}

export interface SendReplyDto {
    message: string;
}

// ============================================================================
// Users
// ============================================================================

export interface User {
    id: string;
    email: string;
    name: string;
    role: "admin" | "editor" | "viewer";
    avatar?: string;
    isActive: boolean;
    lastLoginAt?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateUserDto {
    email: string;
    name: string;
    password: string;
    role?: "admin" | "editor" | "viewer";
    avatar?: string;
}

export interface UpdateUserDto {
    email?: string;
    name?: string;
    password?: string;
    role?: "admin" | "editor" | "viewer";
    avatar?: string;
    isActive?: boolean;
}

// ============================================================================
// Media
// ============================================================================

export interface Media {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    thumbnailUrl?: string;
    alt?: string;
    caption?: string;
    folder?: string;
    uploadedBy: string;
    createdAt: string;
    updatedAt?: string;
}

export interface UpdateMediaDto {
    alt?: string;
    caption?: string;
    folder?: string;
}

// ============================================================================
// Dashboard Stats
// ============================================================================

export interface DashboardStats {
    products: {
        total: number;
        published: number;
        draft: number;
    };
    services: {
        total: number;
        published: number;
    };
    posts: {
        total: number;
        published: number;
        views: number;
    };
    contacts: {
        total: number;
        new: number;
        pending: number;
    };
    users: {
        total: number;
        active: number;
    };
    media: {
        total: number;
        storageUsed: number;
    };
}

// ============================================================================
// Job Applications
// ============================================================================

export interface JobApplication {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    positionId: string;
    positionTitle: string;
    department: string;
    location?: string;
    coverLetter?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    resumeUrl: string;
    resumeFilename: string;
    resumeSize: number;
    status: ApplicationStatus;
    notes?: string;
    reviewedAt?: string;
    statusChangedAt?: string;
    createdAt: string;
    updatedAt?: string;
}

export type ApplicationStatus =
    | 'new'
    | 'reviewed'
    | 'shortlisted'
    | 'interview'
    | 'offered'
    | 'hired'
    | 'rejected'
    | 'withdrawn';

export interface UpdateApplicationDto {
    status?: ApplicationStatus;
    notes?: string;
}

// ============================================================================
// Pagination
// ============================================================================

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    search?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
