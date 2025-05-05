'use client';

export default function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1.5 py-2">
      <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-current opacity-75" style={{ animationDelay: '0ms' }}></div>
      <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-current opacity-75" style={{ animationDelay: '175ms' }}></div>
      <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-current opacity-75" style={{ animationDelay: '350ms' }}></div>
    </div>
  );
}