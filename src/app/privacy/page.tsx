// app/privacy/page.tsx - Privacy Policy
'use client';

import React from 'react';
import Link from 'next/link';
import { CreditCard, ArrowLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Everything Credit</span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/signup" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6">
          <ArrowLeft className="w-5 h-5" />
          Back to signup
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: January 8, 2026</p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Everything Credit ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our credit services platform.
              </p>
              <p className="text-gray-700 leading-relaxed mt-3">
                By using our services, you consent to the data practices described in this policy. This policy complies with the Nigeria Data Protection Regulation (NDPR) and other applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">2.1 Personal Information</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                We collect the following personal information during registration and account usage:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Bank Verification Number (BVN) or National Identification Number (NIN)</li>
                <li>Date of birth</li>
                <li>Residential address</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">2.2 Employment Information</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Company name</li>
                <li>Work email address</li>
                <li>Job title/occupation</li>
                <li>Monthly salary information</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">2.3 Financial Information</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Bank account details (bank name, account number)</li>
                <li>Bank statements and transaction history</li>
                <li>Credit history and payment behavior</li>
                <li>Loan and purchase records</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">2.4 Technical Information</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>IP address</li>
                <li>Device information (type, operating system, browser)</li>
                <li>Usage data (pages visited, features used, time spent)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We use your information for the following purposes:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Identity Verification:</strong> To verify your identity using BVN/NIN and prevent fraud</li>
                <li><strong>Credit Assessment:</strong> To analyze your bank statements and determine your creditworthiness</li>
                <li><strong>Loan Processing:</strong> To process loan applications and purchase requests</li>
                <li><strong>Payment Collection:</strong> To facilitate direct debit mandates and collect repayments</li>
                <li><strong>Account Management:</strong> To manage your account, track transactions, and provide customer support</li>
                <li><strong>Communication:</strong> To send account updates, payment reminders, and promotional offers</li>
                <li><strong>Service Improvement:</strong> To analyze usage patterns and improve our services</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations and regulatory requirements</li>
                <li><strong>Risk Management:</strong> To detect and prevent fraud, money laundering, and other illegal activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Third-Party Service Providers</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We share your information with trusted third-party service providers who assist us in operating our platform:
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">4.1 OnePipe (Payment Services Provider)</h3>
              <p className="text-gray-700 leading-relaxed">
                We use OnePipe to access bank statements, verify account information, create direct debit mandates, and process payments. OnePipe handles your banking information securely in accordance with their privacy policy and industry standards.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">4.2 Other Service Providers</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Credit Bureaus:</strong> To report credit activity and assess creditworthiness</li>
                <li><strong>Identity Verification Services:</strong> To verify BVN/NIN and prevent identity fraud</li>
                <li><strong>Cloud Service Providers:</strong> To securely store and process data</li>
                <li><strong>Communication Services:</strong> To send emails, SMS, and push notifications</li>
                <li><strong>Analytics Providers:</strong> To analyze platform usage and improve services</li>
                <li><strong>Collection Agencies:</strong> To recover outstanding debts in case of default</li>
              </ul>

              <p className="text-gray-700 leading-relaxed mt-3">
                All third-party service providers are contractually obligated to maintain the confidentiality and security of your information and may only use it for the specific purposes for which it was disclosed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We implement robust security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>End-to-end encryption for data transmission</li>
                <li>Secure storage with encryption at rest</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data protection practices</li>
                <li>Incident response and breach notification procedures</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by law. Financial and transaction records are retained for a minimum of 7 years in compliance with Nigerian financial regulations. After the retention period, your data will be securely deleted or anonymized.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Your Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Under the Nigeria Data Protection Regulation (NDPR), you have the following rights:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Right to Access:</strong> Request a copy of your personal information</li>
                <li><strong>Right to Rectification:</strong> Request correction of inaccurate information</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your data (subject to legal retention requirements)</li>
                <li><strong>Right to Object:</strong> Object to processing of your data for marketing purposes</li>
                <li><strong>Right to Restriction:</strong> Request restriction of processing in certain circumstances</li>
                <li><strong>Right to Data Portability:</strong> Request transfer of your data to another service provider</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for data processing (may affect service availability)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                To exercise any of these rights, please contact us at privacy@everythingcredit.ng. We will respond to your request within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We use cookies and similar tracking technologies to enhance your experience on our platform:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Required for platform functionality and security</li>
                <li><strong>Performance Cookies:</strong> Help us understand how users interact with our platform</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                You can manage cookie preferences through your browser settings. However, disabling essential cookies may affect platform functionality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child without parental consent, we will take steps to delete that information immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">10. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and processed in countries outside Nigeria where our service providers are located. We ensure that adequate safeguards are in place to protect your data in accordance with NDPR requirements, including the use of standard contractual clauses and ensuring providers comply with internationally recognized data protection standards.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">11. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on our website and updating the "Last updated" date. Your continued use of our services after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">12. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                If you have questions or concerns about this Privacy Policy or our data practices, please contact:
              </p>
              <div className="text-gray-700 space-y-1">
                <p><strong>Data Protection Officer</strong></p>
                <p>Email: privacy@everythingcredit.ng</p>
                <p>Phone: +234 XXX XXX XXXX</p>
                <p>Address: [Your business address]</p>
              </div>
              <p className="text-gray-700 leading-relaxed mt-4">
                You also have the right to lodge a complaint with the Nigeria Data Protection Bureau (NDPB) if you believe your data protection rights have been violated.
              </p>
            </section>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-gray-700">
                By using Everything Credit's services, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and disclosure of your information as described herein.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p>&copy; 2026 Everything Credit. Powered by OnePipe.</p>
        </div>
      </footer>
    </div>
  );
}