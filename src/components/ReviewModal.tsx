import { useState } from 'react'
import { IconX, IconStar, IconLoader } from './icons'
import { supabase } from '../lib/supabase'

const REVIEW_ATTRIBUTES = [
  'Professional',
  'Fast Learner',
  'Great Communication',
  'Problem Solver',
  'Detail Oriented',
  'Proactive',
  'Reliable',
  'Team Player',
  'Creative',
  'Organized',
]

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  vaId: string
  vaName: string
  clientId: string
  jobId?: string
  onSuccess?: () => void
}

export default function ReviewModal({ 
  isOpen, 
  onClose, 
  vaId, 
  vaName, 
  clientId, 
  jobId,
  onSuccess 
}: ReviewModalProps) {
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const toggleAttribute = (attr: string) => {
    if (selectedAttributes.includes(attr)) {
      setSelectedAttributes(selectedAttributes.filter(a => a !== attr))
    } else if (selectedAttributes.length < 5) {
      setSelectedAttributes([...selectedAttributes, attr])
    }
  }

  const handleSubmit = async () => {
    if (rating < 1) {
      setError('Please select a rating')
      return
    }

    setSubmitting(true)
    setError('')

    const { error: submitError } = await supabase
      .from('reviews')
      .insert({
        va_id: vaId,
        client_id: clientId,
        job_id: jobId || null,
        rating,
        comment: comment.trim() || null,
        attributes: selectedAttributes,
      })

    if (submitError) {
      setError(submitError.message)
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    onSuccess?.()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold">Leave a Review</h2>
            <p className="text-sm text-slate-600">for {vaName}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <IconX className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Overall Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <IconStar 
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Attribute Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              What stood out? <span className="font-normal text-slate-500">(pick up to 5)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {REVIEW_ATTRIBUTES.map((attr) => {
                const isSelected = selectedAttributes.includes(attr)
                return (
                  <button
                    key={attr}
                    onClick={() => toggleAttribute(attr)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-[hsl(var(--primary))] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    } ${
                      !isSelected && selectedAttributes.length >= 5
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                    disabled={!isSelected && selectedAttributes.length >= 5}
                  >
                    {attr}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Comment <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience working with this VA..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[hsl(var(--primary))] text-white font-semibold hover:bg-[hsl(var(--primary))]/90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {submitting ? (
                <IconLoader className="h-5 w-5 animate-spin" />
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
