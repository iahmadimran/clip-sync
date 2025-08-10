'use server';

import { currentUser } from "@clerk/nextjs/server";
import { apiFetch, getEnv, getOrderByClause, withErrorHandling } from "../utils";
import { BUNNY } from "@/constants";
import { db } from "@/drizzle/db";
import { user, videos } from "@/drizzle/schema";
import { revalidatePath } from "next/cache";
import { and, eq, ilike, or, sql } from "drizzle-orm";

const VIDEO_STREAM_BASE_URL = BUNNY.STREAM_BASE_URL
const THUMBNAIL_STORAGE_BASE_URL = BUNNY.STORAGE_BASE_URL
const THUMBNAIL_CDN_URL = BUNNY.CDN_URL
const BUNNY_LIBRARY_ID = getEnv('BUNNY_LIBRARY_ID')

const ACCESS_KEYS = {
  streamAccessKey: getEnv('BUNNY_STREAM_ACCESS_KEY'),
  storageAccessKey: getEnv('BUNNY_STORAGE_ACCESS_KEY'),
}

// Helper functions

const getUserId = async () => {
  const user = await currentUser()
  if (!user) throw new Error('Unauthenticated')

  return user.id
}

const revalidatesPaths = (paths: string[]) => {
  paths.map((path) => revalidatePath(path))
}

const buildVideoWithUserQuery = () => {
  return db.select({
    video: videos,
    user: { id: user.id, name: user.name, image: user.image }
  })
  .from(videos)
  .leftJoin(user, eq(videos.userId, user.id))
}

// Server Actions
export const getVideoUploadUrl = withErrorHandling(async () => {
  await getUserId()

  const videoResponse = await apiFetch<BunnyVideoResponse>(
    `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos`,
    {
      method: 'POST',
      bunnyType: 'stream',
      body: { title: 'Temporary Title', collectionId: '' }
    }
  )

  const uploadUrl = `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoResponse.guid}`

  return {
    videoId: videoResponse.guid,
    uploadUrl,
    accessKey: ACCESS_KEYS.streamAccessKey
  }
})

export const getThumbnailUploadUrl = withErrorHandling(async (videoId: string) => {
  const fileName = `${Date.now()}-${videoId}-thumbnail`;
  const uploadUrl = `${THUMBNAIL_STORAGE_BASE_URL}/thumbnails/${fileName}`
  const cdnUrl = `${THUMBNAIL_CDN_URL}/thumbnails/${fileName}`

  return {
    uploadUrl,
    cdnUrl,
    accessKey: ACCESS_KEYS.storageAccessKey
  }
})

export const saveVideoDetails = withErrorHandling(async (videoDetails: VideoDetails) => {
  const userId = await getUserId()

  await apiFetch(
    `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoDetails.videoId}`,
    {
      method: 'POST',
      bunnyType: 'stream',
      body: {
        title: videoDetails.title,
        description: videoDetails.description
      }
    }
  )

  await db.insert(videos).values({
    ...videoDetails,
    videoUrl: `${BUNNY.EMBED_URL}/${BUNNY_LIBRARY_ID}/${videoDetails.videoId}`,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  revalidatesPaths(['/'])

  return { videoId: videoDetails.videoId }
})

export const getAllVideos = withErrorHandling(
  async (
    searchQuery: string = "",
    sortFilter?: string,
    pageNumber: number = 1,
    pageSize: number = 8
  ) => {
    const user = await currentUser()
    const currentUserId = user?.id

    // Base visibility: public or owned by current user
    const visibilityCondition = or(
      eq(videos.visibility, "public"),
      eq(videos.userId, currentUserId!)
    );

    // Optional search by normalized title
    const whereCondition = searchQuery.trim()
      ? and(
        visibilityCondition,
        ilike(
          sql`REPLACE(REPLACE(REPLACE(LOWER(${videos.title}), '-', ''), '.', ''), ' ', '')`,
          `%${searchQuery.replace(/[-. ]/g, "").toLowerCase()}%`
        )
      )
      : visibilityCondition;

    // Count total for pagination
    const [{ totalCount }] = await db
      .select({ totalCount: sql<number>`count(*)` })
      .from(videos)
      .where(whereCondition);
    const totalVideos = Number(totalCount || 0);
    const totalPages = Math.ceil(totalVideos / pageSize);

    // Fetch paginated, sorted results
    const videoRecords = await buildVideoWithUserQuery()
      .where(whereCondition)
      .orderBy(
        sortFilter
          ? getOrderByClause(sortFilter)
          : sql`${videos.createdAt} DESC`
      )
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize);

    return {
      videos: videoRecords,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalVideos,
        pageSize,
      },
    };
  }
);