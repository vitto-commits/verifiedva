import { Turnstile } from '@marsidev/react-turnstile'

interface CaptchaProps {
  onVerify: (token: string) => void
  onError?: () => void
  onExpire?: () => void
}

export default function Captcha({ onVerify, onError, onExpire }: CaptchaProps) {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY

  // If no site key, skip CAPTCHA (for development)
  if (!siteKey) {
    // Auto-verify in development
    if (import.meta.env.DEV) {
      setTimeout(() => onVerify('dev-token'), 100)
    }
    return null
  }

  return (
    <div className="flex justify-center my-4">
      <Turnstile
        siteKey={siteKey}
        onSuccess={onVerify}
        onError={onError}
        onExpire={onExpire}
        options={{
          theme: 'light',
          size: 'normal',
        }}
      />
    </div>
  )
}
