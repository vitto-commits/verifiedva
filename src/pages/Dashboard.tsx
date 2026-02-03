import { MessageCircle, Users, Briefcase, Star } from 'lucide-react'

export default function Dashboard() {
  const stats = [
    { label: 'Profile Views', value: '124', icon: Users, change: '+12%' },
    { label: 'Messages', value: '8', icon: MessageCircle, change: '+3' },
    { label: 'Active Contracts', value: '2', icon: Briefcase, change: '0' },
    { label: 'Avg Rating', value: '4.9', icon: Star, change: '+0.1' },
  ]

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-8">Dashboard</h1>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Recent Messages</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">John Smith</p>
                    <p className="text-sm text-muted-foreground truncate">Hi, I'm interested in your services...</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2h ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground truncate">Thanks for the quick turnaround!</p>
                  </div>
                  <span className="text-xs text-muted-foreground">1d ago</span>
                </div>
              </div>
              <button className="w-full mt-4 py-2 text-sm text-primary hover:underline">
                View all messages →
              </button>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Profile Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Verification Status</span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-verified-pro/10 text-verified-pro">
                    ✓✓ Verified Pro
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Profile Completeness</span>
                  <span className="text-foreground font-medium">95%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Response Rate</span>
                  <span className="text-foreground font-medium">98%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Avg Response Time</span>
                  <span className="text-foreground font-medium">1.5 hours</span>
                </div>
              </div>
              <button className="w-full mt-4 py-2 text-sm text-primary hover:underline">
                Edit profile →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
