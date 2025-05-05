import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white py-12 dark:bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Column 1 - About */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">About LittleGabriel</h3>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              A faith-based AI counseling service providing spiritual guidance and support through thoughtful conversation.
            </p>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/chat" className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400">
                  Chat with Gabriel
                </Link>
              </li>
              <li>
                <Link href="/prayer-requests" className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400">
                  Prayer Requests
                </Link>
              </li>
              <li>
                <Link href="/sermon-generator" className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400">
                  Sermon Generator
                </Link>
              </li>
              <li>
                <Link href="/bible-reader" className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400">
                  Bible Study
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Legal */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Legal</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/privacy-policy" className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Privacy Notice Section */}
        <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700">
          <h3 className="text-center text-lg font-semibold text-gray-900 dark:text-white mb-4">Privacy Notice</h3>
          <p className="text-center text-sm text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We value your privacy. None of your chat data or Bible activity is stored or logged by LittleGabriel. 
            Additionally, conversations are processed securely using OpenAI's GPT-4.1-mini model via API, which does not store or use your data for training. 
            Everything you share is kept private and is not saved — by us or OpenAI. This tool is here to help, not to track.
            Your faith journey is your own — we're just here to walk beside you.
          </p>
        </div>
        
        {/* Bottom Section - Copyright */}
        <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} LittleGabriel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}