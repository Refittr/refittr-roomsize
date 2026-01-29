import Link from 'next/link'
import { ArrowLeft, Shield, Mail, Database, ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - RoomSize by Refittr',
  description: 'Privacy policy for RoomSize by Refittr. Learn how we collect and use your data.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to RoomSize
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Privacy Policy</h1>
          <p className="text-[#64748B]">Last updated: January 2025</p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Intro */}
          <section className="bg-white rounded-xl border border-[#E2E8F0] p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#10B981]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#0F172A] mb-2">Our Commitment</h2>
                <p className="text-[#64748B]">
                  RoomSize by Refittr is committed to protecting your privacy. This policy explains how we collect,
                  use, and protect your information when you use our service.
                </p>
              </div>
            </div>
          </section>

          {/* Data We Collect */}
          <section className="bg-white rounded-xl border border-[#E2E8F0] p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#0F172A] mb-2">Data We Collect</h2>
                <div className="space-y-4 text-[#64748B]">
                  <div>
                    <h3 className="font-medium text-[#0F172A]">Anonymous Usage Data</h3>
                    <p className="mt-1">
                      We collect anonymous usage data to improve our service, including:
                    </p>
                    <ul className="mt-2 list-disc list-inside space-y-1">
                      <li>Search queries (postcodes, development names)</li>
                      <li>Pages visited and features used</li>
                      <li>Room dimension views</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-[#0F172A]">Information You Provide</h3>
                    <p className="mt-1">
                      When you submit a form, we collect:
                    </p>
                    <ul className="mt-2 list-disc list-inside space-y-1">
                      <li>Email address (for waitlist signups)</li>
                      <li>Problem reports (optional email for follow-up)</li>
                      <li>Schema requests (postcode and street information)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How We Use Your Data */}
          <section className="bg-white rounded-xl border border-[#E2E8F0] p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#0F172A] mb-2">How We Use Your Data</h2>
                <div className="space-y-3 text-[#64748B]">
                  <p>
                    <strong className="text-[#0F172A]">Email addresses</strong> are stored securely and only used for:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Waitlist notifications about the Refittr platform launch</li>
                    <li>Following up on problem reports you submit</li>
                    <li>Important service announcements</li>
                  </ul>
                  <p className="mt-4">
                    We will <strong className="text-[#0F172A]">never</strong> sell your email or share it with third parties
                    for marketing purposes.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Data Storage */}
          <section className="bg-white rounded-xl border border-[#E2E8F0] p-6">
            <h2 className="text-lg font-semibold text-[#0F172A] mb-3">Data Storage & Security</h2>
            <p className="text-[#64748B]">
              Your data is stored securely using Supabase, a SOC 2 Type II certified database platform.
              All data is encrypted in transit and at rest. We take reasonable measures to protect your
              information from unauthorized access.
            </p>
          </section>

          {/* Your Rights */}
          <section className="bg-white rounded-xl border border-[#E2E8F0] p-6">
            <h2 className="text-lg font-semibold text-[#0F172A] mb-3">Your Rights</h2>
            <p className="text-[#64748B] mb-3">
              Under GDPR and UK data protection laws, you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[#64748B]">
              <li>Request a copy of your data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of marketing communications</li>
              <li>Lodge a complaint with the ICO</li>
            </ul>
            <p className="text-[#64748B] mt-4">
              To exercise any of these rights, please contact us at{' '}
              <a href="mailto:privacy@refittr.co.uk" className="text-[#10B981] hover:underline">
                privacy@refittr.co.uk
              </a>
            </p>
          </section>

          {/* Cookies */}
          <section className="bg-white rounded-xl border border-[#E2E8F0] p-6">
            <h2 className="text-lg font-semibold text-[#0F172A] mb-3">Cookies</h2>
            <p className="text-[#64748B]">
              RoomSize uses essential cookies only for basic functionality. We do not use tracking cookies
              or third-party analytics that track you across websites.
            </p>
          </section>

          {/* Refittr Main Policy Link */}
          <section className="bg-[#0F172A] rounded-xl p-6 text-center">
            <p className="text-gray-300 mb-4">
              For more details about Refittr&apos;s broader privacy practices, see our main privacy policy.
            </p>
            <a
              href="https://refittr.co.uk/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg transition-colors"
            >
              Refittr Privacy Policy
              <ExternalLink className="w-4 h-4" />
            </a>
          </section>

          {/* Contact */}
          <section className="text-center text-[#64748B]">
            <p>
              Questions about this policy? Contact us at{' '}
              <a href="mailto:hello@refittr.co.uk" className="text-[#10B981] hover:underline">
                hello@refittr.co.uk
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
