import { useState } from 'react'
import { Check, ChevronRight, Upload, User, Briefcase, Wrench, Clock, Image } from 'lucide-react'

const steps = [
  { id: 1, name: 'Account', icon: User },
  { id: 2, name: 'Basic Info', icon: User },
  { id: 3, name: 'Professional', icon: Briefcase },
  { id: 4, name: 'Skills', icon: Wrench },
  { id: 5, name: 'Preferences', icon: Clock },
  { id: 6, name: 'Portfolio', icon: Image },
  { id: 7, name: 'Preview', icon: Check },
]

export default function VASignup() {
  const [currentStep, setCurrentStep] = useState(1)

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create Your VA Profile</h1>
            <p className="text-muted-foreground">Join hundreds of verified virtual assistants</p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Step {currentStep} of {steps.length}</span>
              <span className="text-sm text-muted-foreground">{Math.round((currentStep / steps.length) * 100)}% complete</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Steps indicator */}
          <div className="flex justify-between mb-8 overflow-x-auto pb-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center min-w-[60px] ${
                  step.id === currentStep
                    ? 'text-primary'
                    : step.id < currentStep
                    ? 'text-verified-basic'
                    : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    step.id === currentStep
                      ? 'bg-primary text-white'
                      : step.id < currentStep
                      ? 'bg-verified-basic text-white'
                      : 'bg-muted'
                  }`}
                >
                  {step.id < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                <span className="text-xs hidden sm:block">{step.name}</span>
              </div>
            ))}
          </div>

          {/* Form Content */}
          <div className="rounded-xl border border-border bg-card p-6 md:p-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Create Your Account</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                      placeholder="Min 8 characters"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Confirm Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                      placeholder="Confirm password"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input type="checkbox" className="rounded" />
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Tell Us About Yourself</h2>
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <button className="text-sm text-primary hover:underline">Upload Photo</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">First Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Last Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Country</label>
                    <select className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground">
                      <option>Philippines</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">City</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                      placeholder="e.g., Manila"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Timezone</label>
                    <select className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground">
                      <option>UTC+8 (Philippine Time)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Your Professional Background</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Professional Title</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                      placeholder="e.g., Executive Virtual Assistant"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Bio / Summary</label>
                    <textarea
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground h-32"
                      placeholder="Tell clients about yourself..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">150-500 characters</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Years of Experience</label>
                    <select className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground">
                      <option>Less than 1 year</option>
                      <option>1-2 years</option>
                      <option>3-5 years</option>
                      <option>5-10 years</option>
                      <option>10+ years</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep >= 4 && currentStep <= 6 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">
                  {currentStep === 4 && 'Select Your Skills'}
                  {currentStep === 5 && 'Work Preferences'}
                  {currentStep === 6 && 'Portfolio (Optional)'}
                </h2>
                <p className="text-muted-foreground">
                  {currentStep === 4 && 'Choose 3-15 skills that best describe your expertise.'}
                  {currentStep === 5 && 'Set your availability and rates.'}
                  {currentStep === 6 && 'Add samples of your work to showcase your abilities.'}
                </p>
                <div className="p-8 border border-dashed border-border rounded-lg text-center text-muted-foreground">
                  Form fields for step {currentStep} would go here
                </div>
              </div>
            )}

            {currentStep === 7 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Preview Your Profile</h2>
                <div className="p-6 border border-border rounded-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-muted" />
                    <div>
                      <h3 className="font-semibold text-foreground">Your Name</h3>
                      <p className="text-sm text-muted-foreground">Your Title</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/10 text-yellow-500 mt-1">
                        ⚠️ Unverified
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your profile will be live but only accessible via direct link until you complete verification.
                  </p>
                </div>
                <div className="p-4 bg-primary/5 border border-primary/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Get Verified</strong> to appear in search results and build trust with clients.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                className={`px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors ${
                  currentStep === 1 ? 'invisible' : ''
                }`}
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                {currentStep === steps.length ? 'Publish Profile' : 'Continue'}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
