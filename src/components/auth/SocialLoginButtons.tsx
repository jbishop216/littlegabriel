import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { GoogleIcon, AppleIcon } from '@/components/ui/auth-provider-icons';

interface SocialLoginButtonsProps {
  callbackUrl: string;
  disabled?: boolean;
}

export default function SocialLoginButtons({ 
  callbackUrl, 
  disabled = false 
}: SocialLoginButtonsProps) {
  return (
    <div className="space-y-3">
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="flex w-full items-center justify-center gap-2"
        onClick={() => {
          const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
          const fullCallbackUrl = callbackUrl.startsWith('http') ? callbackUrl : `${baseUrl}${callbackUrl}`;
          signIn('google', { callbackUrl: fullCallbackUrl });
        }}
        disabled={disabled}
      >
        <GoogleIcon className="h-5 w-5" />
        <span>Sign in with Google</span>
      </Button>

      <Button
        type="button"
        variant="outline"
        className="flex w-full items-center justify-center gap-2 bg-black text-white hover:bg-gray-800 hover:text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
        onClick={() => {
          const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
          const fullCallbackUrl = callbackUrl.startsWith('http') ? callbackUrl : `${baseUrl}${callbackUrl}`;
          signIn('apple', { callbackUrl: fullCallbackUrl });
        }}
        disabled={disabled}
      >
        <AppleIcon className="h-5 w-5" />
        <span>Sign in with Apple</span>
      </Button>
    </div>
  );
}