import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors dark:bg-gray-800 bg-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
                <Sun className="w-5 h-5 text-gray-400" />
            )}
        </button>
    );
}