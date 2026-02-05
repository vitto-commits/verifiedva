import Layout from '../components/Layout'

export default function Privacy() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-sm text-slate-500 mb-8">Last updated: February 2026</p>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. Information We Collect</h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-3">
                We collect information you provide directly when creating an account or using our platform:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base text-slate-600">
                <li><strong>Account information:</strong> Name, email address, password (encrypted)</li>
                <li><strong>Profile data:</strong> Skills, experience, hourly rate, bio, location, timezone, video intros</li>
                <li><strong>Company data (clients):</strong> Company name, website, industry, company size</li>
                <li><strong>Usage data:</strong> Pages visited, search queries, features used (anonymized)</li>
                <li><strong>Communications:</strong> Messages sent between clients and VAs through the platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base text-slate-600">
                <li><strong>Provide our service:</strong> Display profiles, enable search, facilitate connections between clients and VAs</li>
                <li><strong>Improve the platform:</strong> Analyze usage patterns to improve features and user experience</li>
                <li><strong>Communication:</strong> Send account notifications, platform updates, and relevant opportunities</li>
                <li><strong>Verification:</strong> Validate VA identities, skills, and references as part of our trust system</li>
                <li><strong>Security:</strong> Detect and prevent fraud, abuse, and unauthorized access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">3. Data Sharing</h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-3">
                We do <strong>not</strong> sell your personal data to third parties. We only share information in these circumstances:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base text-slate-600">
                <li><strong>With your consent:</strong> When you choose to share your profile publicly or connect with a client/VA</li>
                <li><strong>Service providers:</strong> Trusted partners who help operate our platform (hosting, email delivery) under strict data protection agreements</li>
                <li><strong>Legal requirements:</strong> When required by law, court order, or to protect the rights and safety of our users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. Data Security</h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                We take data security seriously. Your data is stored on Supabase with encryption at rest and in transit. 
                Passwords are hashed using industry-standard algorithms. We implement row-level security policies 
                to ensure users can only access data they're authorized to see. We conduct regular security reviews 
                of our codebase and infrastructure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. Cookies</h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                We use minimal, functional cookies only. These are essential for authentication and maintaining your session. 
                We do not use third-party advertising cookies or tracking pixels. We may use anonymous analytics to 
                understand platform usage patterns.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">6. Your Rights</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base text-slate-600">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                <li><strong>Data portability:</strong> Request your data in a machine-readable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from non-essential communications at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">7. Data Retention</h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                We retain your data for as long as your account is active. If you delete your account, we will remove 
                your personal data within 30 days, except where we're required to retain it for legal or compliance purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">8. Contact Us</h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                If you have questions about this privacy policy or your data, contact us at{' '}
                <a href="mailto:privacy@verticestaffing.com" className="text-[hsl(var(--primary))] hover:opacity-80">
                  privacy@verticestaffing.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  )
}
