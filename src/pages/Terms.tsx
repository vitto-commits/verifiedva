import Layout from '../components/Layout'

export default function Terms() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-sm text-slate-500 mb-8">Last updated: February 2026</p>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                By accessing or using VA Marketplace ("the Platform"), you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, do not use the Platform. We may update these terms from time to time, 
                and continued use constitutes acceptance of any changes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. About the Platform</h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                VA Marketplace is an online platform that connects clients with pre-vetted Filipino virtual assistants. 
                We are a <strong>marketplace</strong>, not an employer. We do not employ the VAs listed on our platform. 
                Any working relationship is directly between the client and the VA. We facilitate discovery and connection 
                but are not a party to any employment or service agreement between users.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">3. Account Responsibilities</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base text-slate-600">
                <li>You must provide accurate, current, and complete information during registration</li>
                <li>You are responsible for maintaining the security of your account credentials</li>
                <li>You must not share your account with others or create multiple accounts</li>
                <li>You must be at least 18 years old to create an account</li>
                <li>You are responsible for all activity that occurs under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. Content Guidelines</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base text-slate-600">
                <li><strong>Accuracy:</strong> All profile information, skills, and experience must be truthful and accurate</li>
                <li><strong>No spam:</strong> Do not use the platform for unsolicited marketing or deceptive practices</li>
                <li><strong>No impersonation:</strong> Do not misrepresent your identity or qualifications</li>
                <li><strong>Respectful communication:</strong> Treat all users with respect and professionalism</li>
                <li><strong>No prohibited content:</strong> Do not upload illegal, harmful, or offensive content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. Fees & Payments</h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Creating an account and browsing the Platform is free for both clients and VAs. 
                Payment terms between clients and VAs are agreed upon directly between the parties. 
                VA Marketplace is not responsible for processing payments, collecting fees, or mediating 
                payment disputes between clients and VAs. We may introduce premium features or services 
                in the future, which will be clearly communicated before any charges apply.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">6. Verification & Trust</h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Our verification system (Verified, Pro, Elite tiers) is designed to increase trust, but 
                does not constitute a guarantee of any VA's performance, reliability, or suitability for a 
                specific task. Verification indicates that certain checks have been completed at the time of 
                verification. Clients should still exercise due diligence when hiring.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">7. Dispute Resolution</h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Disputes between clients and VAs are between those parties. VA Marketplace may offer mediation 
                at its discretion but is not obligated to resolve disputes. We may investigate reported violations 
                of these terms and take action including warning, suspending, or terminating accounts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">8. Limitation of Liability</h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                The Platform is provided "as is" without warranties of any kind. VA Marketplace is not liable 
                for any direct, indirect, incidental, or consequential damages arising from the use of the platform, 
                including but not limited to: losses from hiring decisions, quality of work performed, disputes 
                between users, or unavailability of the platform. Our total liability shall not exceed the amount 
                you've paid us (if any) in the 12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">9. Intellectual Property</h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                The Platform, including its design, features, and content (excluding user-generated content), 
                is owned by VA Marketplace. You retain ownership of content you create (profiles, reviews, messages). 
                By posting content on the Platform, you grant us a license to display, distribute, and promote 
                that content as part of the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">10. Termination</h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                You may delete your account at any time. We reserve the right to suspend or terminate accounts 
                that violate these terms, engage in fraudulent activity, or are inactive for extended periods. 
                Upon termination, your right to use the Platform ceases immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">11. Contact</h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                For questions about these terms, contact us at{' '}
                <a href="mailto:legal@verticestaffing.com" className="text-[hsl(var(--primary))] hover:opacity-80">
                  legal@verticestaffing.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  )
}
