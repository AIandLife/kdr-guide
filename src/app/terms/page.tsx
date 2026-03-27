import { SiteNav } from '@/components/SiteNav'

export const metadata = {
  title: 'Terms of Service | AusBuildCircle 澳洲建房圈',
  description: 'Terms of Service for AusBuildCircle — please read before using our platform.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav backHref="/" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-widest text-orange-500 uppercase mb-2">Legal</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Terms of Service</h1>
          <p className="text-sm text-gray-500">Last updated: 27 March 2026</p>
          <p className="mt-3 text-sm text-gray-500 bg-orange-50 border border-orange-100 rounded-lg px-4 py-3">
            本服务条款以英文版本为准。使用本平台即表示您同意以下条款。如有疑问请通过页面底部联系方式与我们联系。
          </p>
        </div>

        <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-700">

          {/* 1 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using AusBuildCircle at <strong>ausbuildcircle.com</strong> ("the Platform"), you agree to be
              bound by these Terms of Service. If you do not agree, please do not use the Platform. These terms apply to
              all visitors, homeowners, trade professionals, and other users.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">2. Description of Service</h2>
            <p>
              AusBuildCircle is an online platform that:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Provides AI-assisted feasibility analysis for knock-down-rebuild (KDR) and renovation projects across Australian councils.</li>
              <li>Maintains a directory of trade professionals (builders, architects, planners, engineers, etc.).</li>
              <li>Facilitates contact enquiries between homeowners and trade professionals.</li>
              <li>Hosts a community forum for knowledge sharing.</li>
            </ul>
            <p className="mt-2">
              AusBuildCircle is an information and introductory service only. We are not a building company, licensed
              contractor, or financial adviser. Any AI-generated analysis is indicative only and does not constitute
              professional advice.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">3. User Accounts</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You must provide accurate information when creating an account.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You must notify us immediately of any unauthorised use of your account.</li>
              <li>One person may not maintain more than one account without our permission.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">4. Professional Listings</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Trade professionals may register a verified listing by paying the applicable subscription fee.</li>
              <li>You warrant that all information in your profile is accurate and that you hold any required licences or registrations.</li>
              <li>AusBuildCircle does not independently verify the qualifications, licences, or insurance of listed professionals. Homeowners should conduct their own due diligence.</li>
              <li>We reserve the right to remove listings that contain false or misleading information.</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">5. Payments and Refunds</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Subscription fees are charged in Australian Dollars (AUD) and processed via Stripe.</li>
              <li>Annual subscriptions are non-refundable after 14 days from the date of purchase, unless required by Australian Consumer Law (ACL).</li>
              <li>If you believe you are entitled to a refund under the ACL, please contact us within 30 days of purchase.</li>
              <li>We reserve the right to change pricing with 30 days' notice to existing subscribers.</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">6. User-Generated Content</h2>
            <p>When you post content on our forum or submit other content to the Platform:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>You retain ownership of your content but grant us a non-exclusive, royalty-free licence to display and distribute it on the Platform.</li>
              <li>You must not post content that is unlawful, defamatory, harassing, obscene, or infringes third-party rights.</li>
              <li>We may remove content that violates these Terms or applicable law without notice.</li>
            </ul>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">7. Prohibited Conduct</h2>
            <p>You must not:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Use the Platform for any unlawful purpose.</li>
              <li>Scrape, crawl, or systematically extract data from the Platform.</li>
              <li>Impersonate any person or entity.</li>
              <li>Introduce malware, viruses, or harmful code.</li>
              <li>Attempt to gain unauthorised access to our systems or other users' accounts.</li>
              <li>Use the Platform to send unsolicited commercial messages (spam).</li>
            </ul>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">8. Intellectual Property</h2>
            <p>
              All content, design, code, trademarks, and materials on the Platform (excluding user-generated content) are
              owned by or licensed to AusBuildCircle. You may not reproduce, distribute, or create derivative works without
              our prior written consent.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">9. Disclaimer of Warranties</h2>
            <p>
              The Platform is provided "as is" without warranties of any kind. We do not warrant that:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>AI-generated feasibility analysis is accurate, complete, or suitable for your specific circumstances.</li>
              <li>Listed professionals are licensed, insured, or suitable for your project.</li>
              <li>The Platform will be uninterrupted, error-free, or free of viruses.</li>
            </ul>
            <p className="mt-2">
              Nothing in these Terms excludes rights or remedies you may have under the Australian Consumer Law that
              cannot be excluded.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, AusBuildCircle's total liability to you for any claim arising from
              your use of the Platform is limited to the amount you paid us in the 12 months preceding the claim. We are
              not liable for indirect, consequential, incidental, or punitive damages.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">11. Governing Law</h2>
            <p>
              These Terms are governed by the laws of New South Wales, Australia. Any disputes will be subject to the
              exclusive jurisdiction of the courts of New South Wales, unless required otherwise by the Australian
              Consumer Law.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">12. Changes to These Terms</h2>
            <p>
              We may update these Terms at any time. We will notify you of material changes via email or a notice on the
              Platform. Continued use after the effective date constitutes acceptance of the updated Terms.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">13. Contact Us</h2>
            <p>For questions about these Terms, please contact:</p>
            <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm">
              <p className="font-medium text-gray-900">AusBuildCircle</p>
              <p className="text-gray-600">Email: <a href="mailto:noreply@ausbuildcircle.com" className="text-orange-500 hover:underline">noreply@ausbuildcircle.com</a></p>
              <p className="text-gray-600">Website: <a href="https://ausbuildcircle.com" className="text-orange-500 hover:underline">ausbuildcircle.com</a></p>
            </div>
          </section>

        </div>

        {/* Footer links */}
        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-400">
          <a href="/privacy" className="hover:text-orange-500 transition-colors">Privacy Policy</a>
          <a href="/" className="hover:text-orange-500 transition-colors">← Back to Home</a>
        </div>
      </main>
    </div>
  )
}
