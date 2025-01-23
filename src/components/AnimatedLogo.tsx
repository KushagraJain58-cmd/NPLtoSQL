import { Waves } from 'lucide-react';

export function AnimatedLogo() {
  return (
    <div className="relative">
      <div className="bg-gradient-to-r from-blue-400 to-purple-400 dark:from-blue-500 dark:to-purple-500 p-3 rounded-full animate-pulse">
        <div className="bg-white dark:bg-gray-800 rounded-full p-2 relative">
          <Waves className="w-6 h-6 text-gray-700 dark:text-gray-300 animate-[wave_3s_ease-in-out_infinite]" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 dark:via-gray-800/80 to-transparent animate-[shine_3s_ease-in-out_infinite] -skew-x-12" />
        </div>
      </div>
    </div>
  );
}