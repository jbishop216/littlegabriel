import { Metadata } from 'next';
import GlobalLayout from '@/components/GlobalLayout';
import { getGradientForRoute } from '@/lib/gradients';

export const metadata: Metadata = {
  title: 'Privacy Policy | LittleGabriel',
  description: 'Privacy Policy for LittleGabriel - Learn how we protect your personal information.',
};

export default function PrivacyPolicyPage() {
  const gradient = getGradientForRoute('/privacy-policy');

  return (
    <GlobalLayout
      backgroundClass={gradient.className}
      containerClass="max-w-4xl mx-auto px-4 py-8"
    >
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-xl p-6 md:p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">1. Introduction</h2>
            <p>
              Welcome to LittleGabriel. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you about how we look after your personal data when you visit our website
              and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">2. Data We Collect</h2>
            <p>
              We value your privacy and have minimized data collection to only what is necessary:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Authentication Data: If you sign in using Google authentication, we receive only your email and name for the purpose of account creation.</li>
              <li>Prayer Requests: If you submit prayer requests and choose to save them, these are stored with your account.</li>
              <li>Technical Data: Basic technical information may be automatically collected by our hosting provider for security purposes.</li>
            </ul>
            <p className="mt-4 font-medium">What We DO NOT Collect or Store:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1 text-gray-800">
              <li><strong>Chat Data</strong>: None of your chat data or conversations with LittleGabriel are stored or logged.</li>
              <li><strong>Bible Study Activity</strong>: Your Bible reading habits, searches, and interactions are not tracked or stored.</li>
              <li><strong>AI Interactions</strong>: All AI interactions through OpenAI's GPT-4o-mini model are processed via API without storage of your data or usage for training.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">3. How We Use Your Data</h2>
            <p>
              We only use the minimal data we collect for the following specific purposes:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>To provide account functionality for users who choose to create accounts.</li>
              <li>To enable prayer request submissions and community prayer features for users who opt to use these features.</li>
              <li>To maintain the security and functionality of the service.</li>
            </ul>
            <p className="mt-4">
              Your faith journey is your own — we're just here to walk beside you, without unnecessarily tracking or storing your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">4. Data Sharing and Third Parties</h2>
            <p>
              We limit data sharing to only what is necessary for the operation of the service:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>OpenAI</strong>: When you interact with the AI features, your questions are sent to OpenAI for processing. However, as confirmed by OpenAI, data sent via their API is not stored or used for model training.</li>
              <li><strong>Bible API</strong>: When you use the Bible reader, requests are sent to Scripture API Bible to retrieve Bible content.</li>
              <li><strong>Google Authentication</strong>: If you choose to login with Google, basic profile information is processed by Google.</li>
              <li><strong>Hosting Provider</strong>: Basic technical information may be processed by our hosting provider.</li>
            </ul>
            <p className="mt-4 font-medium">
              We do not sell, rent, or otherwise share your personal data with third parties for marketing or commercial purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">5. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. 
              In addition, we limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know. 
              They will only process your personal data on our instructions, and they are subject to a duty of confidentiality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">6. Data Retention</h2>
            <p>
              We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, 
              including for the purposes of satisfying any legal, accounting, or reporting requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">7. Your Legal Rights</h2>
            <p>
              Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Request access to your personal data.</li>
              <li>Request correction of your personal data.</li>
              <li>Request erasure of your personal data.</li>
              <li>Object to processing of your personal data.</li>
              <li>Request restriction of processing your personal data.</li>
              <li>Request transfer of your personal data.</li>
              <li>Right to withdraw consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">8. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
              We will let you know via email and/or a prominent notice on our website, prior to the change becoming effective and update the "effective date" at the top of this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <p className="mt-2">
              By email: contact@littlegabriel.org
            </p>
          </section>

          <p className="text-sm text-gray-500 mt-8 pt-4 border-t">Last updated: April 27, 2025</p>
        </div>
      </div>
    </GlobalLayout>
  );
}