import { SiteNav } from '@/components/SiteNav'

export const metadata = {
  title: 'Privacy Policy | AusBuildCircle 澳洲建房圈',
  description: 'Privacy Policy for AusBuildCircle — how we collect, use and protect your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav backHref="/" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-widest text-orange-500 uppercase mb-2">Legal</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Last updated: 27 March 2026</p>
          <p className="mt-3 text-sm text-gray-500 bg-orange-50 border border-orange-100 rounded-lg px-4 py-3">
            本隐私政策以英文版本为准。如有疑问请通过页面底部联系方式与我们联系。
          </p>
        </div>

        <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-700">

          {/* 1 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">1. Who We Are</h2>
            <p>
              AusBuildCircle ("we", "us", "our") operates the website at <strong>ausbuildcircle.com</strong> — a platform
              connecting homeowners undertaking knock-down-rebuild or renovation projects with qualified trade professionals
              across Australia. We are committed to protecting your personal information in accordance with the
              <em> Privacy Act 1988 (Cth)</em> and the Australian Privacy Principles (APPs).
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">2. Information We Collect</h2>
            <p>We may collect the following types of personal information:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Account information:</strong> email address, name, and any details you provide when signing up or logging in via Google OAuth.</li>
              <li><strong>Professional profile data:</strong> business name, contact name, phone number, website, WeChat ID, service description, and suburb — provided when registering as a trade professional.</li>
              <li><strong>Enquiry data:</strong> name, email address, and phone number when you submit a contact request to a professional.</li>
              <li><strong>Payment information:</strong> billing details processed securely via Stripe. We do not store your card number.</li>
              <li><strong>Forum content:</strong> posts, replies, and images you voluntarily submit to our community forum.</li>
              <li><strong>Usage data:</strong> IP address, browser type, pages visited, and interaction logs collected automatically via server logs and analytics.</li>
              <li><strong>Feedback and reports:</strong> any messages you submit via our feedback widget or content report feature.</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide, operate, and improve the AusBuildCircle platform.</li>
              <li>To verify and display trade professional profiles.</li>
              <li>To facilitate enquiries between homeowners and professionals.</li>
              <li>To process subscription payments for professional listings.</li>
              <li>To send transactional emails (login links, enquiry notifications, subscription receipts).</li>
              <li>To send our newsletter to subscribers who have opted in (you may unsubscribe at any time).</li>
              <li>To detect and prevent fraud or abuse.</li>
              <li>To comply with our legal obligations.</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">4. Disclosure to Third Parties</h2>
            <p>We share personal information only with the following service providers, each bound by their own privacy policies:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Supabase</strong> — database and authentication hosting (servers in Singapore/US regions).</li>
              <li><strong>Stripe</strong> — payment processing.</li>
              <li><strong>Resend</strong> — transactional and newsletter email delivery.</li>
              <li><strong>Google</strong> — OAuth sign-in.</li>
              <li><strong>Anthropic (Claude API)</strong> — AI-generated feasibility analysis (your address data is sent to generate the report; it is not stored by Anthropic for training).</li>
              <li><strong>Vercel</strong> — website hosting infrastructure.</li>
            </ul>
            <p className="mt-2">We do not sell your personal information to any third party.</p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">5. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide services.
              If you request deletion of your account, we will remove or anonymise your data within 30 days, except where
              we are required to retain it for legal, tax, or fraud-prevention purposes.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">6. Your Rights</h2>
            <p>Under the Australian Privacy Principles, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Access the personal information we hold about you.</li>
              <li>Request correction of inaccurate or incomplete information.</li>
              <li>Request deletion of your personal information (subject to legal obligations).</li>
              <li>Opt out of marketing communications at any time.</li>
              <li>Lodge a complaint with the Office of the Australian Information Commissioner (OAIC) at <strong>oaic.gov.au</strong> if you believe we have mishandled your information.</li>
            </ul>
            <p className="mt-2">To exercise any of these rights, contact us at the address below.</p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">7. Cookies</h2>
            <p>
              We use cookies and similar technologies to maintain your session, remember your language preference, and
              analyse site usage. You can disable cookies in your browser settings, though this may affect functionality.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">8. Security</h2>
            <p>
              We implement industry-standard security measures including encrypted connections (HTTPS), row-level security
              on our database, and access controls. However, no internet transmission is completely secure and we cannot
              guarantee absolute security.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be notified via email or a notice
              on our website. Continued use of the platform after changes constitutes acceptance.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">10. Contact Us</h2>
            <p>For privacy-related enquiries or to exercise your rights, please contact:</p>
            <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm">
              <p className="font-medium text-gray-900">AusBuildCircle</p>
              <p className="text-gray-600">Email: <a href="mailto:hello@ausbuildcircle.com" className="text-orange-500 hover:underline">hello@ausbuildcircle.com</a></p>
              <p className="text-gray-600">Website: <a href="https://ausbuildcircle.com" className="text-orange-500 hover:underline">ausbuildcircle.com</a></p>
            </div>
          </section>

        </div>

        {/* Footer links */}
        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-400">
          <a href="/terms" className="hover:text-orange-500 transition-colors">Terms of Service</a>
          <a href="/" className="hover:text-orange-500 transition-colors">← Back to Home</a>
        </div>
      </main>
    </div>
  )
}
