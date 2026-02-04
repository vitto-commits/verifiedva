import { supabase } from './supabase'

/**
 * Get a signed URL for a video intro (private bucket)
 * URLs expire after the specified duration
 */
export async function getSignedVideoUrl(videoPath: string, expiresIn = 3600): Promise<string | null> {
  if (!videoPath) return null

  // Extract path from full URL if needed
  let path = videoPath
  if (videoPath.includes('/video-intros/')) {
    path = videoPath.split('/video-intros/')[1]
  }

  if (!path) return null

  const { data, error } = await supabase.storage
    .from('video-intros')
    .createSignedUrl(path, expiresIn)

  if (error) {
    console.error('Error creating signed URL:', error)
    return null
  }

  return data?.signedUrl || null
}

/**
 * Upload a video to the video-intros bucket
 * Returns the storage path (not full URL) for later signed URL generation
 */
export async function uploadVideo(
  userId: string,
  file: File
): Promise<{ path: string | null; error: Error | null }> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  const { error } = await supabase.storage
    .from('video-intros')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    return { path: null, error }
  }

  return { path: fileName, error: null }
}

/**
 * Delete a video from storage
 */
export async function deleteVideo(videoPath: string): Promise<{ error: Error | null }> {
  // Extract path from full URL if needed
  let path = videoPath
  if (videoPath.includes('/video-intros/')) {
    path = videoPath.split('/video-intros/')[1]
  }

  if (!path) {
    return { error: new Error('Invalid video path') }
  }

  const { error } = await supabase.storage
    .from('video-intros')
    .remove([path])

  return { error }
}
