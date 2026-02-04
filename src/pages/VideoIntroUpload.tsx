import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, Video, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'

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
    if (vaProfile?.video_intro_url) {
      setCurrentVideoUrl(vaProfile.video_intro_url)
    }
  }, [vaProfile])

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
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user!.id}/${Date.now()}.${fileExt}`

      // Delete old video if exists
      if (currentVideoUrl) {
        const oldPath = currentVideoUrl.split('/video-intros/')[1]
        if (oldPath) {
          await supabase.storage.from('video-intros').remove([oldPath])
        }
      }

      // Upload new video
      const { error: uploadError } = await supabase.storage
        .from('video-intros')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('video-intros')
        .getPublicUrl(fileName)

      // Update VA profile
      const { error: updateError } = await supabase
        .from('vas')
        .update({ video_intro_url: publicUrl })
        .eq('id', vaProfile.id)

      if (updateError) throw updateError

      setCurrentVideoUrl(publicUrl)
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
      // Delete from storage
      const path = currentVideoUrl.split('/video-intros/')[1]
      if (path) {
        await supabase.storage.from('video-intros').remove([path])
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
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
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
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Video Introduction</h1>
            <p className="text-gray-400">
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
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              {success}
            </div>
          )}

          {/* Current Video */}
          {currentVideoUrl && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
              <h2 className="font-semibold mb-3">Current Video</h2>
              <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video mb-4">
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
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 sm:p-6">
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
              className={`border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-gray-800/30 transition-colors ${
                uploading ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              {uploading ? (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 mx-auto text-emerald-500 animate-spin" />
                  <div>
                    <p className="text-white font-medium">Uploading video...</p>
                    <p className="text-sm text-gray-500">This may take a moment</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="inline-flex p-4 rounded-2xl bg-gray-700/50 mb-4">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-white font-medium mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">
                    MP4, WebM, or MOV (max 50MB)
                  </p>
                </>
              )}
            </div>

            {/* Tips */}
            <div className="mt-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <h3 className="text-emerald-400 font-medium mb-2 flex items-center gap-2">
                <Video className="h-4 w-4" />
                Tips for a great intro video
              </h3>
              <ul className="text-sm text-gray-300 space-y-1.5">
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
