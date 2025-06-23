'use client';

import { Metadata } from 'next';
import GlobalLayout from '@/components/GlobalLayout';
import { getGradientForRoute } from '@/lib/gradients';
import { SessionProvider } from 'next-auth/react';

export default function TermsOfServiceWithProviders() {
  const gradient = getGradientForRoute('/terms-of-service');

  return (
    <SessionProvider>
      <GlobalLayout
        backgroundClass={gradient.className}
        containerClass="max-w-4xl mx-auto px-4 py-8"
      >
        <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-xl p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">Terms of Service</h1>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">1. Agreement to Terms</h2>
              <p>
                By accessing or using LittleGabriel, you agree to be bound by these Terms of Service and all applicable laws and regulations. 
                If you do not agree with any of these terms, you are prohibited from using or accessing this site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">2. Use License</h2>
              <p>
                Permission is granted to temporarily access and use the LittleGabriel platform for personal, non-commercial purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Modify or copy the materials;</li>
                <li>Use the materials for any commercial purpose;</li>
                <li>Attempt to decompile or reverse engineer any software contained on LittleGabriel;</li>
                <li>Remove any copyright or other proprietary notations from the materials; or</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
              </ul>
              <p className="mt-2">
                This license shall automatically terminate if you violate any of these restrictions and may be terminated by LittleGabriel at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">3. Disclaimer</h2>
              <p>
                The materials on LittleGabriel are provided on an 'as is' basis. LittleGabriel makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
              <p className="mt-2">
                Further, LittleGabriel does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">4. Limitations</h2>
              <p>
                In no event shall LittleGabriel or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on LittleGabriel, even if LittleGabriel or a LittleGabriel authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
              <p className="mt-2">
                Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">5. Accuracy of Materials</h2>
              <p>
                The materials appearing on LittleGabriel could include technical, typographical, or photographic errors. LittleGabriel does not warrant that any of the materials on its website are accurate, complete, or current. LittleGabriel may make changes to the materials contained on its website at any time without notice. However, LittleGabriel does not make any commitment to update the materials.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">6. Links</h2>
              <p>
                LittleGabriel has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by LittleGabriel of the site. Use of any such linked website is at the user's own risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">7. Modifications</h2>
              <p>
                LittleGabriel may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">8. User Accounts</h2>
              <p>
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
              </p>
              <p className="mt-2">
                You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.
              </p>
              <p className="mt-2">
                You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">9. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are and will remain the exclusive property of LittleGabriel and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of LittleGabriel.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">10. Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
              </p>
              <p className="mt-2">
                Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">11. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us:
              </p>
              <p className="mt-2">
                By email: contact@littlegabriel.org
              </p>
            </section>

            <p className="text-sm text-gray-500 mt-8 pt-4 border-t">Last updated: April 27, 2025</p>
          </div>
        </div>
      </GlobalLayout>
    </SessionProvider>
  );
}
