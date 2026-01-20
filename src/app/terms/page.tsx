// app/terms/page.tsx - Terms and Conditions
'use client';

import React from 'react';
import Link from 'next/link';
import { CreditCard, ArrowLeft } from 'lucide-react';

export default function Terms() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms and Conditions</h1>
          <p className="text-gray-600 mb-8">Last updated: January 8, 2026</p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using Everything Credit's services, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, you should not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Eligibility</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                To be eligible for our credit services, you must:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Be at least 18 years of age</li>
                <li>Be a resident of Nigeria</li>
                <li>Have a valid Bank Verification Number (BVN) or National Identification Number (NIN)</li>
                <li>Have a verified salary account with a recognized Nigerian bank</li>
                <li>Receive regular monthly salary payments</li>
                <li>Provide accurate and complete information during registration</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Bank Statement Verification</h2>
              <p className="text-gray-700 leading-relaxed">
                By using our services, you authorize Everything Credit and its third-party service providers (including but not limited to OnePipe) to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-3">
                <li>Access and retrieve your bank account statements and transaction history</li>
                <li>Analyze your financial data to verify your stated income</li>
                <li>Assess your creditworthiness and ability to repay loans</li>
                <li>Monitor your account activity for fraud prevention purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Direct Debit Mandate</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                By submitting your application, you consent to the creation of a direct debit mandate on your specified bank account. This mandate authorizes Everything Credit to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Automatically debit your account for loan repayments on their due dates</li>
                <li>Collect installment payments for purchases made through our platform</li>
                <li>Deduct any applicable fees, charges, or penalties as outlined in these terms</li>
                <li>Retry failed payment attempts in accordance with our payment retry policy</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Credit Limits and Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Your credit limit is determined based on 35% of your verified monthly salary, subject to a maximum cap of ₦500,000. Credit terms include:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Cash Loans:</strong> 1-month repayment term with a 5% service fee</li>
                <li><strong>Installment Purchases:</strong> 1-6 month payment terms with a 3% service fee</li>
                <li>Monthly installment payments must not exceed your approved credit limit</li>
                <li>You may only have one active loan or purchase at any given time</li>
                <li>Credit limits are subject to periodic review and may be adjusted</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Repayment Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                You agree to the following repayment terms:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Payments are automatically debited from your salary account on or around your salary payment date</li>
                <li>You must maintain sufficient funds in your account to cover payment obligations</li>
                <li>Failed payments may result in late fees of ₦1,000 per day after a 3-day grace period</li>
                <li>Repeated payment failures may result in suspension of credit privileges</li>
                <li>Early repayment is allowed without penalties</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Data Privacy and Third-Party Services</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                You consent to Everything Credit sharing your personal and financial information with:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Third-party payment processors and banking service providers (OnePipe)</li>
                <li>Credit bureaus and financial reporting agencies</li>
                <li>Identity verification services</li>
                <li>Fraud prevention and security services</li>
                <li>Legal and regulatory authorities when required by law</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                All data sharing is conducted in accordance with applicable data protection regulations and our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Credit Reporting</h2>
              <p className="text-gray-700 leading-relaxed">
                Your credit activity with Everything Credit, including payment history, defaults, and outstanding balances, may be reported to credit bureaus. This information may affect your credit score and future ability to access credit from other financial institutions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Default and Collections</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                In the event of payment default:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Your account will be suspended and credit privileges revoked</li>
                <li>Late fees and penalties will continue to accrue</li>
                <li>The default will be reported to credit bureaus</li>
                <li>We may engage collection agencies to recover outstanding amounts</li>
                <li>Legal action may be taken to recover debts</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">10. Communication Consent</h2>
              <p className="text-gray-700 leading-relaxed">
                By using our services, you consent to receive communications from Everything Credit via email, SMS, phone calls, push notifications, and other channels regarding your account, payment reminders, promotional offers, and service updates. You may opt out of promotional communications but will continue to receive essential account-related messages.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">11. Accuracy of Information</h2>
              <p className="text-gray-700 leading-relaxed">
                You represent and warrant that all information provided to Everything Credit is accurate, complete, and current. Providing false or misleading information may result in immediate account suspension, credit revocation, and potential legal action.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">12. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                Everything Credit shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of our services. Our total liability shall not exceed the amount of credit extended to you.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">13. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on our website. Continued use of our services after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">14. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of Nigerian courts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">15. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                For questions or concerns about these Terms and Conditions, please contact us at:
              </p>
              <div className="mt-3 text-gray-700">
                <p>Email: support@everythingcredit.ng</p>
                <p>Phone: +234 XXX XXX XXXX</p>
              </div>
            </section>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-gray-700">
                By clicking "I agree to the Terms and Conditions" during signup, you acknowledge that you have read, understood, and agree to be bound by these terms.
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