import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUpload } from './components/FileUpload';
import { QueryInput } from './components/QueryInput';
import { ResultsView } from './components/ResultsView';
import { LogOut } from 'lucide-react';
import { ThemeToggle } from './components/ThemeToggle';
import { useClerk, useUser } from '@clerk/clerk-react';
import { uploadCSV, queryData, checkHealth, dropTable } from './services/api';

const textArray = ["Welcome to CSV Analytics.", "Upload your CSV and ask questions.", "Let's analyze your data!"];

function App1() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [tableSchema, setTableSchema] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [sqlQuery, setSqlQuery] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { user } = useUser();
  const { signOut } = useClerk();
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const healthCheckResult = await checkHealth();
        setIsDbReady(true);
        console.log('Health check result:', healthCheckResult);
      } catch (err) {
        setError('Unable to connect to the backend service.');
        setIsDbReady(false);
      }
    };

    checkBackendHealth();
    const healthCheckInterval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(healthCheckInterval);
  }, []);

  useEffect(() => {
    if (currentIndex < textArray.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (user) {
      const gender = user.gender === 'female' ? 'female' : 'male';
      const seed = user.id || user.primaryEmailAddress?.emailAddress || 'default';
      const url = `https://api.dicebear.com/6.x/avataaars/svg?seed=${seed}&gender=${gender}`;
      setAvatarUrl(url);
    }
  }, [user]);

  const handleLogout = () => {
    signOut();
  };

  const handleFileSelect = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await uploadCSV(file);
      setTableSchema({ tableName: result });
      setIsDbReady(true);
      alert("File Uploaded Successfully")
    } catch (err) {
      setError('Error loading file: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuerySubmit = async (prompt: string) => {
    if (!tableSchema) {
      setError('Please upload a CSV file first');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const queryResult = await queryData(prompt);
      setSqlQuery(queryResult.query);
      setResults(JSON.parse(queryResult.result));
    } catch (err) {
      setError('Error executing query: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDropTable = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await dropTable();
      setTableSchema(null);
      setResults([]);
      setSqlQuery(null);
    } catch (err) {
      setError('Error dropping table: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-900 relative overflow-hidden flex flex-col items-center justify-center">
      <header className="container mx-auto px-4 py-8 relative z-10">
        <div className="absolute right-4 top-4 flex items-center gap-4">
          <ThemeToggle />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
          >
            <img src={avatarUrl || "/placeholder.svg"} alt="User Avatar" className="w-8 h-8 rounded-full" />
            <span className="font-medium">Logout</span>
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex items-center justify-center mb-6"
        >
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl">
            <svg viewBox="0 0 100 20" className="w-8 h-8">
              <motion.path
                d="M0,10 C20,20 40,0 60,10 C80,20 100,0 120,10"
                stroke="url(#gradient)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4ECDC4" />
                  <stop offset="50%" stopColor="#9B6BFF" />
                  <stop offset="100%" stopColor="#FF6B6B" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </motion.div>

        <div className="h-20 mb-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.h1
              key={currentIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-light text-center absolute"
              style={{
                background: "linear-gradient(90deg, #4ECDC4 0%, #9B6BFF 50%, #FF6B6B 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {textArray[currentIndex]}
            </motion.h1>
          </AnimatePresence>
        </div>

        <div className="text-sm text-gray-400 text-center">
          Welcome back, {user.firstName || user.username || 'User'}!
        </div>
      </header>

      <main className="container mx-auto px-4 flex-grow z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg shadow-gray-100 dark:shadow-gray-900/30"
            >
              <FileUpload onFileSelect={handleFileSelect} />
            </motion.div>

            {tableSchema && (
              <>
                {/* <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDropTable}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Drop Table
                </motion.button> */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg shadow-gray-100 dark:shadow-gray-900/30"
                >
                  <QueryInput
                    onSubmit={handleQuerySubmit}
                    isLoading={isLoading}
                  />
                </motion.div>
              </>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-500 dark:text-red-400 p-6 rounded-2xl"
              >
                {error}
              </motion.div>
            )}

            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg shadow-gray-100 dark:shadow-gray-900/30"
              >
                <ResultsView
                  data={results}
                  sqlQuery={sqlQuery}
                />
              </motion.div>
            )}
          </>
        </div>
      </main>

      <motion.div
        className="absolute bottom-0 w-full h-64 z-0"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <svg className="w-full h-full" viewBox="0 0 1200 200" preserveAspectRatio="none">
          <motion.path
            d="M0,100 C300,150 450,50 600,100 C750,150 900,50 1200,100 L1200,200 L0,200 Z"
            fill="url(#wave-gradient)"
            initial={{ d: "M0,100 C300,150 450,50 600,100 C750,150 900,50 1200,100 L1200,200 L0,200 Z" }}
            animate={{
              d: [
                "M0,100 C300,150 450,50 600,100 C750,150 900,50 1200,100 L1200,200 L0,200 Z",
                "M0,100 C300,50 450,150 600,100 C750,50 900,150 1200,100 L1200,200 L0,200 Z",
                "M0,100 C300,150 450,50 600,100 C750,150 900,50 1200,100 L1200,200 L0,200 Z",
              ],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(78, 205, 196, 0.2)" />
              <stop offset="50%" stopColor="rgba(155, 107, 255, 0.2)" />
              <stop offset="100%" stopColor="rgba(255, 107, 107, 0.2)" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
}

export default App1;

