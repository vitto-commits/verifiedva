import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, Video, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'
import { getSignedVideoUrl, uploadVideo, deleteVideo } from '../lib/storage'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

export default function VideoIntroUpload() {
  const navigate = useNavigate()
  const { user, profile, vaProfile, loading: authLoading, refreshProfile } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
      return
    }
    if (!authLoading && profile?.user_type !== 'va') {
      navigate('/dashboard')
      return
    }
  }, [user, profile, authLoading, navigate])

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (vaProfile?.video_intro_url) {
        const signedUrl = await getSignedVideoUrl(vaProfile.video_intro_url)
        setCurrentVideoUrl(signedUrl)
      }
    }
    fetchSignedUrl()
  }, [vaProfile?.video_intro_url])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !vaProfile) return

    setError('')
    setSuccess('')

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload an MP4, WebM, or MOV video file')
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('Video must be under 50MB. Try compressing it or using a shorter clip.')
      return
    }

    setUploading(true)

    try {
      // Delete old video if exists
      if (vaProfile.video_intro_url) {
        await deleteVideo(vaProfile.video_intro_url)
      }

      // Upload new video
      const { path, error: uploadError } = await uploadVideo(user!.id, file)
      if (uploadError || !path) throw uploadError || new Error('Upload failed')

      // Store the path in the database (we'll generate signed URLs when needed)
      // Store as full path reference for consistency
      const storedPath = `video-intros/${path}`
      
      // Update VA profile with path reference
      const { error: updateError } = await supabase
        .from('vas')
        .update({ video_intro_url: storedPath })
        .eq('id', vaProfile.id)

      if (updateError) throw updateError

      // Fetch signed URL for display
      const signedUrl = await getSignedVideoUrl(storedPath)
      setCurrentVideoUrl(signedUrl)
      
      setSuccess('Video intro uploaded successfully!')
      await refreshProfile()
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload video. Please try again.')
    }

    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async () => {
    if (!currentVideoUrl || !vaProfile) return
    if (!confirm('Are you sure you want to delete your video intro?')) return

    setDeleting(true)
    setError('')
    setSuccess('')

    try {
      // Delete from storage (use stored path from profile, not signed URL)
      if (vaProfile.video_intro_url) {
        await deleteVideo(vaProfile.video_intro_url)
      }

      // Update VA profile
      const { error: updateError } = await supabase
        .from('vas')
        .update({ video_intro_url: null })
        .eq('id', vaProfile.id)

      if (updateError) throw updateError

      setCurrentVideoUrl(null)
      setSuccess('Video intro deleted')
      await refreshProfile()
    } catch (err: any) {
      console.error('Delete error:', err)
      setError(err.message || 'Failed to delete video')
    }

    setDeleting(false)
  }

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Video Introduction</h1>
            <p className="text-slate-600">
              Upload a short video to introduce yourself to potential clients
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              {success}
            </div>
          )}

          {/* Current Video */}
          {currentVideoUrl && (
            <div className="bg-white/70 border border-slate-200 rounded-xl p-4 mb-6">
              <h2 className="font-semibold mb-3">Current Video</h2>
              <div className="relative rounded-xl overflow-hidden bg-white aspect-video mb-4">
                <video
                  src={currentVideoUrl}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                />
              </div>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete Video
              </button>
            </div>
          )}

          {/* Upload Section */}
          <div className="bg-white/70 border border-slate-200 rounded-xl p-4 sm:p-6">
            <h2 className="font-semibold mb-4">
              {currentVideoUrl ? 'Replace Video' : 'Upload Video'}
            </h2>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-[hsl(var(--primary))]/30 hover:bg-white/30 transition-colors ${
                uploading ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              {uploading ? (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 mx-auto text-[hsl(var(--primary))] animate-spin" />
                  <div>
                    <p className="text-slate-900 font-medium">Uploading video...</p>
                    <p className="text-sm text-slate-500">This may take a moment</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="inline-flex p-4 rounded-2xl bg-slate-50 mb-4">
                    <Upload className="h-8 w-8 text-slate-600" />
                  </div>
                  <p className="text-slate-900 font-medium mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-slate-500">
                    MP4, WebM, or MOV (max 50MB)
                  </p>
                </>
              )}
            </div>

            {/* Tips */}
            <div className="mt-6 p-4 rounded-lg bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20">
              <h3 className="text-[hsl(var(--primary))] font-medium mb-2 flex items-center gap-2">
                <Video className="h-4 w-4" />
                Tips for a great intro video
              </h3>
              <ul className="text-sm text-slate-700 space-y-1.5">
                <li>• Keep it short: 30-90 seconds is ideal</li>
                <li>• Introduce yourself and your key skills</li>
                <li>• Show your personality and communication style</li>
                <li>• Use good lighting and clear audio</li>
                <li>• Film horizontally for best display</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
