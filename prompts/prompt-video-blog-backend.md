# PROMPT: Video Blog — Full Backend Implementation & Frontend Integration

You are building the complete backend for the **Video Blog** feature of the VivaExcel digital products marketplace monorepo at `/Users/mac/codes/vivaexcel`. The frontend UI is already fully built — your job is to implement every backend capability it requires, then wire the frontend hooks to call real API endpoints instead of mock data.

## Tech Stack

- **Backend**: NestJS 11, TypeORM (PostgreSQL), `BaseEntity` at `apps/backend/src/entities/base.entity.ts` (uuid PK, `createdAt`, `updatedAt`, `deletedAt`). Controllers return `{ status: 'success', message: string, data: T }`. Auth uses `JwtAuthGuard` + `RolesGuard` with `Role.ADMIN`/`Role.SUPER_ADMIN`. Decorators: `@Public()`, `@CurrentUser()`, `@Roles()`. Guards at `apps/backend/src/common/guards/`. Decorators at `apps/backend/src/common/decorators/`.
- **Frontend**: Next.js 16, React 19, TanStack React Query, API client at `apps/frontend/lib/api-client.ts` exporting `apiGet<T>(url)`, `apiPost<T>(url, body)`, `apiPatch<T>(url, body)`, `apiDelete<T>(url)`. Base URL: `NEXT_PUBLIC_API_URL || http://localhost:4001/api/v1`.
- **Existing frontend files** (DO NOT modify these unless explicitly stated):
  - `apps/frontend/types/video.ts` — TypeScript interfaces
  - `apps/frontend/data/videos.ts` — Mock data (will be replaced by API)
  - `apps/frontend/app/[locale]/videos/page.tsx` — Server component page
  - `apps/frontend/components/videos/` — 11 component files (video-blog-client, video-card, video-grid, video-sidebar, video-search-bar, video-card-skeleton, video-bookmark-button, shorts-carousel, short-card, category-chips, index.ts)
  - `apps/frontend/hooks/use-videos.ts` — TanStack Query hooks (WILL be modified)

---

## PHASE 1: Backend Entities

All entities go in `apps/backend/src/modules/videos/entities/`. Each extends `BaseEntity`.

### 1a. `video-channel.entity.ts` — Table `video_channels`

| Column | Type | Details |
|--------|------|---------|
| `name` | varchar | |
| `slug` | varchar | unique, indexed |
| `avatar` | varchar | URL to avatar image |
| `subscriberCount` | int | default 0 |
| `isVerified` | boolean | default false |
| `description` | text | nullable |

### 1b. `video-category.entity.ts` — Table `video_categories`

| Column | Type | Details |
|--------|------|---------|
| `name` | varchar | |
| `slug` | varchar | unique, indexed |
| `icon` | varchar | Lucide icon name string (e.g., "Table", "Brain") |
| `color` | varchar(7) | hex color (e.g., "#217346") |
| `sortOrder` | int | default 0 |
| `isActive` | boolean | default true |

### 1c. `video.entity.ts` — Table `videos`

| Column | Type | Details |
|--------|------|---------|
| `title` | varchar | |
| `slug` | varchar | unique, indexed |
| `description` | text | |
| `thumbnailUrl` | varchar | |
| `videoUrl` | varchar | URL to actual video file/embed |
| `duration` | int | seconds, 0 for live streams |
| `viewCount` | int | default 0 |
| `likeCount` | int | default 0 |
| `commentCount` | int | default 0 |
| `publishedAt` | timestamp | nullable (null = draft) |
| `channelId` | uuid | FK → `video_channels.id`, indexed |
| `categoryId` | uuid | FK → `video_categories.id`, indexed |
| `tags` | jsonb | typed as `string[]`, default `[]` |
| `isLive` | boolean | default false |
| `isPremium` | boolean | default false |
| `isShort` | boolean | default false — distinguishes Shorts from regular videos |
| `status` | enum `VideoStatus` | `DRAFT`, `PUBLISHED`, `ARCHIVED`, default `DRAFT` |

Relations:
- `@ManyToOne(() => VideoChannel, { eager: false }) @JoinColumn({ name: 'channel_id' }) channel: VideoChannel`
- `@ManyToOne(() => VideoCategory, { eager: false }) @JoinColumn({ name: 'category_id' }) category: VideoCategory`

Indexes: `[publishedAt]`, `[isShort, publishedAt]`, `[categoryId, publishedAt]`

### 1d. `video-bookmark.entity.ts` — Table `video_bookmarks`

| Column | Type | Details |
|--------|------|---------|
| `userId` | uuid | indexed |
| `videoId` | uuid | FK → `videos.id`, indexed |

Unique composite constraint on `[userId, videoId]`.
Relation: `@ManyToOne(() => Video) @JoinColumn({ name: 'video_id' }) video: Video`

### 1e. `video-like.entity.ts` — Table `video_likes`

| Column | Type | Details |
|--------|------|---------|
| `userId` | uuid | indexed |
| `videoId` | uuid | FK → `videos.id`, indexed |

Unique composite constraint on `[userId, videoId]`.

### 1f. `video-comment.entity.ts` — Table `video_comments`

| Column | Type | Details |
|--------|------|---------|
| `videoId` | uuid | FK → `videos.id`, indexed |
| `userId` | uuid | indexed |
| `content` | text | |
| `likesCount` | int | default 0 |
| `parentId` | uuid | nullable, self-referencing FK for nested replies |

Relations:
- `@ManyToOne(() => Video) @JoinColumn({ name: 'video_id' }) video: Video`
- `@ManyToOne(() => User, { eager: false }) @JoinColumn({ name: 'user_id' }) user: User`
- `@ManyToOne(() => VideoComment, { nullable: true }) @JoinColumn({ name: 'parent_id' }) parent: VideoComment`
- `@OneToMany(() => VideoComment, (c) => c.parent) children: VideoComment[]`

### 1g. `video-view.entity.ts` — Table `video_views` (no soft delete)

| Column | Type | Details |
|--------|------|---------|
| `id` | uuid PK | |
| `createdAt` | timestamp | |
| `videoId` | uuid | FK → `videos.id`, indexed |
| `userId` | uuid | nullable (anonymous views allowed) |
| `ipHash` | varchar | hashed IP for deduplication |
| `userAgent` | varchar | nullable |

DO NOT extend BaseEntity for this — it has no `updatedAt`/`deletedAt`. Define `id` and `createdAt` manually.

### 1h. `entities/index.ts` — Barrel export all entities

---

## PHASE 2: Enums

Create `apps/backend/src/modules/videos/enums/video.enums.ts`:

```typescript
export enum VideoStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}
```

Create `apps/backend/src/modules/videos/enums/index.ts` barrel export.

---

## PHASE 3: DTOs

Create in `apps/backend/src/modules/videos/dto/`:

### 3a. `video-query.dto.ts`

```typescript
export class VideoQueryDto {
  @IsOptional() @IsString() categorySlug?: string;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsIn(['latest', 'popular', 'trending']) sortBy?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number = 24;
}
```

### 3b. `create-video.dto.ts`

```typescript
export class CreateVideoDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() description: string;
  @IsUrl() thumbnailUrl: string;
  @IsUrl() videoUrl: string;
  @IsInt() @Min(0) duration: number;
  @IsUUID() channelId: string;
  @IsUUID() categoryId: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsBoolean() isLive?: boolean;
  @IsOptional() @IsBoolean() isPremium?: boolean;
  @IsOptional() @IsBoolean() isShort?: boolean;
}
```

### 3c. `update-video.dto.ts` — PartialType of CreateVideoDto

### 3d. `create-channel.dto.ts`

```typescript
export class CreateChannelDto {
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsUrl() avatar?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() isVerified?: boolean;
}
```

### 3e. `create-category.dto.ts`

```typescript
export class CreateCategoryDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() icon: string;
  @IsString() @Matches(/^#[0-9a-fA-F]{6}$/) color: string;
  @IsOptional() @IsInt() sortOrder?: number;
}
```

### 3f. `create-comment.dto.ts`

```typescript
export class CreateVideoCommentDto {
  @IsString() @IsNotEmpty() content: string;
  @IsOptional() @IsUUID() parentId?: string;
}
```

### 3g. `report-view.dto.ts`

```typescript
export class ReportViewDto {
  @IsUUID() videoId: string;
}
```

### 3h. `index.ts` — barrel export all DTOs

---

## PHASE 4: Service

Create `apps/backend/src/modules/videos/services/videos.service.ts`. Inject TypeORM repositories for all entities. Methods:

### Videos

- `findAll(query: VideoQueryDto): Promise<{ videos: Video[]; total: number; page: number; pageSize: number; totalPages: number }>` — Query `videos` table, join `channel` and `category` relations eagerly. Filter by `categorySlug` (join category, match slug), `search` (ILIKE on title, description, or tags cast to text), sort by `latest` (publishedAt DESC), `popular` (viewCount DESC), `trending` (likeCount DESC, last 7 days weighting). Only return `status = PUBLISHED` and `isShort = false`. Paginate with page/pageSize.

- `findShorts(): Promise<{ shorts: Video[]; total: number }>` — Query `videos` where `isShort = true` and `status = PUBLISHED`, order by `publishedAt DESC`, limit 20, join channel. Return as `shorts` (the frontend `VideoShort` type is a subset of `Video`).

- `findBySlug(slug: string): Promise<Video>` — Find one video by slug with channel and category relations. Throw `NotFoundException` if not found.

- `findTrending(limit: number = 5): Promise<Video[]>` — Top videos by viewCount, published, not shorts.

- `create(dto: CreateVideoDto): Promise<Video>` — Generate slug from title using `slugify` + nanoid suffix. Set `status = PUBLISHED` and `publishedAt = new Date()`.

- `update(id: string, dto: UpdateVideoDto): Promise<Video>` — Standard update, re-slug if title changed.

- `remove(id: string): Promise<void>` — Soft delete.

- `publish(id: string): Promise<Video>` — Set `status = PUBLISHED`, `publishedAt = new Date()`.

### Categories

- `findAllCategories(): Promise<VideoCategory[]>` — Return all active categories sorted by `sortOrder`. Prepend a virtual "All" category with `{ id: 'all', name: 'All', slug: 'all', icon: 'Compass', color: '#1E4DB7', sortOrder: 0 }`.

- `createCategory(dto: CreateCategoryDto): Promise<VideoCategory>` — Generate slug from name.

### Channels

- `findAllChannels(): Promise<VideoChannel[]>` — All channels sorted by name.
- `findChannelBySlug(slug: string): Promise<VideoChannel>` — Single channel by slug.
- `createChannel(dto: CreateChannelDto): Promise<VideoChannel>` — Generate slug from name.

### Bookmarks

- `toggleBookmark(userId: string, videoId: string): Promise<{ bookmarked: boolean }>` — Check if exists: if so, delete and return `{ bookmarked: false }`; if not, create and return `{ bookmarked: true }`.

- `getUserBookmarks(userId: string): Promise<Video[]>` — Return all bookmarked videos for user, join video + channel + category.

- `isBookmarked(userId: string, videoId: string): Promise<boolean>` — Check if bookmark exists.

### Likes

- `toggleLike(userId: string, videoId: string): Promise<{ liked: boolean; likeCount: number }>` — Toggle like, increment/decrement `video.likeCount` atomically (`SET "like_count" = "like_count" + 1`).

### Comments

- `getComments(videoId: string): Promise<VideoComment[]>` — Find all root comments (parentId IS NULL), join user, load children recursively (depth 2 max), order by createdAt DESC.

- `addComment(userId: string, videoId: string, dto: CreateVideoCommentDto): Promise<VideoComment>` — Create comment, increment `video.commentCount` atomically.

- `deleteComment(userId: string, commentId: string): Promise<void>` — Only allow if userId matches comment.userId. Soft delete, decrement `video.commentCount`.

### Views

- `recordView(videoId: string, userId?: string, ipHash?: string, userAgent?: string): Promise<void>` — Insert into `video_views`. To prevent spam: check if a view from the same `ipHash` + `videoId` exists within last 30 minutes; if so, skip. Otherwise insert and increment `video.viewCount` atomically.

### Seed

- `seedDefaultData(): Promise<void>` — Called on module init (`onModuleInit`). Check if categories table is empty; if so, insert the 10 categories from mock data (excel-tips, ai-automation, data-analytics, google-sheets, presentations, cybersecurity, blockchain, tutorials, podcasts, live). Check if channels table is empty; if so, insert the 6 channels from mock data. Check if videos table is empty; if so, insert all 28 regular videos and 12 shorts from mock data, mapping `channel` and `category` by slug lookup.

---

## PHASE 5: Controller

Create `apps/backend/src/modules/videos/controllers/videos.controller.ts`. Route prefix: `videos`.

### Public endpoints (use `@Public()` decorator):

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| `GET /` | `findAll(@Query() query: VideoQueryDto)` | Return paginated videos | `{ status: 'success', message: 'Videos retrieved', data: { videos, total, page, pageSize, totalPages } }` |
| `GET /shorts` | `findShorts()` | Return shorts | `{ data: { shorts, total } }` |
| `GET /categories` | `findCategories()` | Return all categories | `{ data: categories }` |
| `GET /channels` | `findChannels()` | Return all channels | `{ data: channels }` |
| `GET /trending` | `findTrending(@Query('limit') limit)` | Top 5 trending | `{ data: videos }` |
| `GET /:slug` | `findBySlug(@Param('slug') slug)` | Single video by slug | `{ data: video }` |
| `GET /:slug/comments` | `getComments(@Param('slug') slug)` | Comments for video | `{ data: comments }` |
| `POST /:id/views` | `recordView(@Param('id') id, @Req() req)` | Record a view (public, extract IP hash) | `{ data: null }` |

### Authenticated endpoints (require JWT):

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| `POST /:id/bookmark` | `toggleBookmark(@CurrentUser() user, @Param('id') id)` | Toggle bookmark | `{ data: { bookmarked } }` |
| `GET /me/bookmarks` | `getMyBookmarks(@CurrentUser() user)` | User's bookmarked videos | `{ data: videos }` |
| `POST /:id/like` | `toggleLike(@CurrentUser() user, @Param('id') id)` | Toggle like | `{ data: { liked, likeCount } }` |
| `POST /:slug/comments` | `addComment(@CurrentUser() user, @Param('slug') slug, @Body() dto)` | Add comment | `{ data: comment }` |
| `DELETE /comments/:id` | `deleteComment(@CurrentUser() user, @Param('id') id)` | Delete own comment | `{ data: null }` |

### Admin endpoints (require `@Roles(Role.ADMIN, Role.SUPER_ADMIN)`):

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| `POST /` | `create(@Body() dto: CreateVideoDto)` | Create video | `{ data: video }` |
| `PATCH /:id` | `update(@Param('id') id, @Body() dto)` | Update video | `{ data: video }` |
| `DELETE /:id` | `remove(@Param('id') id)` | Soft delete video | `{ data: null }` |
| `POST /:id/publish` | `publish(@Param('id') id)` | Publish draft video | `{ data: video }` |
| `POST /categories` | `createCategory(@Body() dto)` | Create category | `{ data: category }` |
| `POST /channels` | `createChannel(@Body() dto)` | Create channel | `{ data: channel }` |

**IMPORTANT**: Place the static routes (`/shorts`, `/categories`, `/channels`, `/trending`, `/me/bookmarks`) BEFORE the `/:slug` param route in the controller to avoid NestJS matching them as slug parameters.

---

## PHASE 6: Module

Create `apps/backend/src/modules/videos/videos.module.ts`:

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Video, VideoChannel, VideoCategory,
      VideoBookmark, VideoLike, VideoComment, VideoView,
    ]),
  ],
  controllers: [VideosController],
  providers: [VideosService],
  exports: [VideosService],
})
export class VideosModule {}
```

---

## PHASE 7: Register in App

### 7a. Add entity exports to `apps/backend/src/entities/index.ts`:

```typescript
// Video blog entities
export * from '../modules/videos/entities/video.entity';
export * from '../modules/videos/entities/video-channel.entity';
export * from '../modules/videos/entities/video-category.entity';
export * from '../modules/videos/entities/video-bookmark.entity';
export * from '../modules/videos/entities/video-like.entity';
export * from '../modules/videos/entities/video-comment.entity';
export * from '../modules/videos/entities/video-view.entity';
```

### 7b. Add `VideosModule` to `apps/backend/src/app.module.ts` imports:

- Add import statement: `import { VideosModule } from './modules/videos/videos.module';`
- Add `VideosModule` to the `imports` array (after the last feature module, before the closing `]`).

---

## PHASE 8: Frontend Hook Rewrite

Replace `apps/frontend/hooks/use-videos.ts` to call real API endpoints instead of mock data. Keep the same exported hook names and return types so all components continue to work unchanged.

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/api-client";
import type {
  Video, VideoShort, VideoCategory, VideoChannel,
  VideoFilters, VideosResponse, VideoShortsResponse,
} from "@/types/video";

export const videoKeys = {
  all: ["videos"] as const,
  lists: () => [...videoKeys.all, "list"] as const,
  list: (filters: VideoFilters) => [...videoKeys.lists(), filters] as const,
  detail: (slug: string) => [...videoKeys.all, "detail", slug] as const,
  shorts: () => [...videoKeys.all, "shorts"] as const,
  categories: () => [...videoKeys.all, "categories"] as const,
  channels: () => [...videoKeys.all, "channels"] as const,
  trending: () => [...videoKeys.all, "trending"] as const,
  bookmarks: () => [...videoKeys.all, "bookmarks"] as const,
  comments: (slug: string) => [...videoKeys.all, "comments", slug] as const,
};

export function useVideos(filters: VideoFilters = {}) {
  const params = new URLSearchParams();
  if (filters.categorySlug && filters.categorySlug !== "all")
    params.set("categorySlug", filters.categorySlug);
  if (filters.search) params.set("search", filters.search);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  const qs = params.toString();

  return useQuery({
    queryKey: videoKeys.list(filters),
    queryFn: () =>
      apiGet<VideosResponse>(`/videos${qs ? `?${qs}` : ""}`).then((r) => r.data),
    staleTime: 2 * 60 * 1000,
  });
}

export function useVideoShorts() {
  return useQuery({
    queryKey: videoKeys.shorts(),
    queryFn: () =>
      apiGet<VideoShortsResponse>("/videos/shorts").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useVideoCategories() {
  return useQuery({
    queryKey: videoKeys.categories(),
    queryFn: () =>
      apiGet<VideoCategory[]>("/videos/categories").then((r) => r.data),
    staleTime: 30 * 60 * 1000,
  });
}

export function useVideoDetail(slug: string) {
  return useQuery({
    queryKey: videoKeys.detail(slug),
    queryFn: () => apiGet<Video>(`/videos/${slug}`).then((r) => r.data),
    enabled: !!slug,
  });
}

export function useVideoComments(slug: string) {
  return useQuery({
    queryKey: videoKeys.comments(slug),
    queryFn: () => apiGet<any[]>(`/videos/${slug}/comments`).then((r) => r.data),
    enabled: !!slug,
  });
}

export function useToggleBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (videoId: string) => apiPost(`/videos/${videoId}/bookmark`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: videoKeys.bookmarks() }),
  });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (videoId: string) => apiPost(`/videos/${videoId}/like`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: videoKeys.all }),
  });
}

export function useAddVideoComment(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { content: string; parentId?: string }) =>
      apiPost(`/videos/${slug}/comments`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: videoKeys.comments(slug) }),
  });
}

export function useMyBookmarks() {
  return useQuery({
    queryKey: videoKeys.bookmarks(),
    queryFn: () => apiGet<Video[]>("/videos/me/bookmarks").then((r) => r.data),
  });
}

export function useTrendingVideos() {
  return useQuery({
    queryKey: videoKeys.trending(),
    queryFn: () => apiGet<Video[]>("/videos/trending").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}
```

**IMPORTANT**: The `apiGet`/`apiPost` functions return `{ status, message, data }`. The hooks must unwrap `.data` from the response to match what the components expect.

---

## PHASE 9: Video Detail Page (NEW)

The frontend links to `/videos/[slug]` but that page doesn't exist yet. Create it:

### 9a. `apps/frontend/app/[locale]/videos/[slug]/page.tsx` — Server component

```typescript
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { VideoDetailClient } from "./video-detail-client";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function VideoDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  return <VideoDetailClient slug={slug} />;
}
```

### 9b. `apps/frontend/app/[locale]/videos/[slug]/video-detail-client.tsx` — Client component

Build a YouTube-style video detail page with:
- Video player area (thumbnail with play button overlay — since we have URLs but no actual streaming, show thumbnail with a centered play button)
- Title, view count, publish date, like button, bookmark button, share button
- Channel info row (avatar, name, verified badge, subscriber count)
- Description (expandable "Show more"/"Show less")
- Tags as chips
- Comments section below (load from `useVideoComments`, show `AddComment` form if authenticated)
- Right sidebar: "Up Next" — 8 related videos from same category (use `useVideos({ categorySlug })`)

Use Framer Motion for animations, Lucide icons, Tailwind styling consistent with existing components.

---

## PHASE 10: Update the Bookmark Button

Modify `apps/frontend/components/videos/video-bookmark-button.tsx` to use the real `useToggleBookmark` mutation instead of local state:

- Import `useToggleBookmark` from `@/hooks/use-videos`
- On click, call `toggleBookmark.mutate(videoId)`
- Use `useQuery` to check initial bookmark state via a lightweight endpoint or pass it as a prop

---

## PHASE 11: Verification

After implementing everything:

1. Run `cd apps/backend && npx tsc --noEmit` — expect zero errors in new video module files
2. Run `cd apps/frontend && npx tsc --noEmit` — expect zero errors in modified hooks and new detail page
3. Verify the seed data populates correctly by checking the service's `onModuleInit`

---

## Reference Patterns

- **Entity pattern**: See `apps/backend/src/entities/review.entity.ts` for ManyToOne relation pattern (`@Column({ name: 'user_id' }) @Index() userId: string` + `@ManyToOne(() => User) @JoinColumn({ name: 'user_id' }) user: User`)
- **Module pattern**: See `apps/backend/src/modules/reviews/reviews.module.ts`
- **Controller pattern**: See `apps/backend/src/modules/reviews/controllers/reviews.controller.ts`
- **Service pattern**: See `apps/backend/src/modules/reviews/services/reviews.service.ts`
- **Hook pattern**: See `apps/frontend/hooks/use-reviews.ts`
- **API client**: `apps/frontend/lib/api-client.ts` — `apiGet<T>`, `apiPost<T>`, `apiPatch<T>`, `apiDelete<T>`

---

## File Creation Summary

### Backend (~18 new files):

```
apps/backend/src/modules/videos/
├── entities/
│   ├── video.entity.ts
│   ├── video-channel.entity.ts
│   ├── video-category.entity.ts
│   ├── video-bookmark.entity.ts
│   ├── video-like.entity.ts
│   ├── video-comment.entity.ts
│   ├── video-view.entity.ts
│   └── index.ts
├── enums/
│   ├── video.enums.ts
│   └── index.ts
├── dto/
│   ├── video-query.dto.ts
│   ├── create-video.dto.ts
│   ├── update-video.dto.ts
│   ├── create-channel.dto.ts
│   ├── create-category.dto.ts
│   ├── create-comment.dto.ts
│   ├── report-view.dto.ts
│   └── index.ts
├── services/
│   └── videos.service.ts
├── controllers/
│   └── videos.controller.ts
└── videos.module.ts
```

### Frontend (~3 new files, 1 modified):

```
apps/frontend/
├── hooks/use-videos.ts                          ← MODIFY (replace mock with API calls)
└── app/[locale]/videos/[slug]/
    ├── page.tsx                                  ← NEW
    └── video-detail-client.tsx                   ← NEW
```

### Modified backend files:

```
apps/backend/src/entities/index.ts               ← ADD video entity exports
apps/backend/src/app.module.ts                    ← ADD VideosModule import
```

---

## Constraints

- Do NOT delete or modify any existing frontend component files (video-card, video-grid, etc.)
- Do NOT modify `apps/frontend/types/video.ts` — the backend response shapes must match these types
- The API response for videos list MUST return `{ videos: Video[], total, page, pageSize, totalPages }` to match `VideosResponse`
- The API response for shorts MUST return `{ shorts: Video[], total }` to match `VideoShortsResponse`
- Category list MUST include the virtual "All" category as the first item (slug: "all")
- The seed data MUST match the mock data in `apps/frontend/data/videos.ts` so the UI looks identical
- Use `slugify` (from a library or a simple `title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')`) for slug generation
- All public endpoints must use the `@Public()` decorator to bypass JWT auth
- Video view recording endpoint should be public (anonymous users can view videos)
