import { useState, useEffect } from 'react';
import App1 from './App1';
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider } from './context/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import { SignedIn, SignedOut, SignInButton, useUser, useClerk } from '@clerk/clerk-react';
import { FileUpload } from './components/FileUpload';

const textArray = ["Welcome to CSV Analytics.", "Your data insights companion.", "Let's get started!"];

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    if (currentIndex < textArray.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      const buttonTimer = setTimeout(() => {
        setShowButton(true);
      }, 500);
      return () => clearTimeout(buttonTimer);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (isSignedIn) {
      // Set up session timeout
      const timeout = setTimeout(() => {
        signOut();
      }, 30 * 60 * 1000); // 30 minutes
      setSessionTimeout(timeout);

      return () => {
        if (sessionTimeout) {
          clearTimeout(sessionTimeout);
        }
      };
    }
  }, [isSignedIn, signOut]);

  // Reset session timeout on user activity
  const resetSessionTimeout = () => {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
    const newTimeout = setTimeout(() => {
      signOut();
    }, 30 * 60 * 1000); // 30 minutes
    setSessionTimeout(newTimeout);
  };

  useEffect(() => {
    // Add event listeners for user activity
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach(event => {
      window.addEventListener(event, resetSessionTimeout);
    });

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetSessionTimeout);
      });
    };
  }, []);

  return (
    <ThemeProvider>
      <main className="min-h-screen w-full bg-white dark:bg-gray-900 relative overflow-hidden flex flex-col items-center justify-center">
        {/* <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div> */}

        <SignedIn>
          <App1 />
        </SignedIn>

        <SignedOut>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="w-28 h-28 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-xl mb-16"
          >
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
                  <stop offset="0%" stopColor="#B85B8F" />
                  <stop offset="50%" stopColor="#9B6BFF" />
                  <stop offset="100%" stopColor="#4ECDC4" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          <div className="h-20 mb-8 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl font-light absolute text-center px-4 dark:text-white"
                style={{
                  background: "linear-gradient(90deg, #B85B8F 0%, #9B6BFF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {textArray[currentIndex]}
              </motion.h1>
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {showButton && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 mb-24"
              >
                <div className="p-[2px] bg-gradient-to-r from-[#B85B8F] to-[#9B6BFF] rounded-md">
                  <div className="px-1 py-1 bg-white dark:bg-gray-800 rounded-[4px]">
                    <SignInButton />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SignedOut>

        <motion.div
          className="absolute bottom-0 w-full h-64"
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
                <stop offset="0%" stopColor="rgba(184, 91, 143, 0.2)" />
                <stop offset="50%" stopColor="rgba(155, 107, 255, 0.2)" />
                <stop offset="100%" stopColor="rgba(184, 91, 143, 0.2)" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </main>
    </ThemeProvider>
  );
}

export default App;


// import React, { useState, useEffect } from 'react';
// import { FileUpload } from './components/FileUpload';
// import { checkHealth, uploadCSV, executeQuery, generateSQLQuery } from './services/api';

// function App() {
//   const [isDbReady, setIsDbReady] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [tableSchema, setTableSchema] = useState<any>(null);
//   const [results, setResults] = useState<any[]>([]);

//   useEffect(() => {
//     const initializeBackend = async () => {
//       try {
//         const isHealthy = await checkHealth();
//         setIsDbReady(isHealthy);
//       } catch (err) {
//         setError('Failed to connect to backend');
//         setIsDbReady(false);
//       }
//     };

//     initializeBackend();
//   }, []);

//   const handleFileSelect = async (file: File) => {
//     try {
//       setError(null);
//       const result = await uploadCSV(file);
//       setTableSchema(result);
//     } catch (err) {
//       setError((err as Error).message);
//     }
//   };

//   const handleQuerySubmit = async (prompt: string) => {
//     if (!tableSchema) {
//       setError('Please upload a CSV file first');
//       return;
//     }

//     try {
//       setError(null);
//       const query = await generateSQLQuery(prompt, {
//         tableName: tableSchema.tableName,
//         columns: tableSchema.schema.map((col: any) => `${col.column_name} (${col.data_type})`).join(', ')
//       });

//       const queryResults = await executeQuery(query);
//       setResults(queryResults);
//     } catch (err) {
//       setError((err as Error).message);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-8">
//       <div className="max-w-4xl mx-auto space-y-8">
//         {!isDbReady ? (
//           <div className="bg-yellow-50 p-4 rounded-lg">
//             Connecting to backend...
//           </div>
//         ) : (
//           <>
//             <FileUpload onFileSelect={handleFileSelect} />

//             {error && (
//               <div className="bg-red-50 p-4 rounded-lg text-red-600">
//                 {error}
//               </div>
//             )}

//             {tableSchema && (
//               <div className="bg-white p-6 rounded-lg shadow">
//                 <h2 className="text-xl font-semibold mb-4">Table: {tableSchema.tableName}</h2>
//                 <div className="space-y-2">
//                   {tableSchema.schema.map((col: any, index: number) => (
//                     <div key={index} className="flex gap-4">
//                       <span className="font-medium">{col.column_name}</span>
//                       <span className="text-gray-500">{col.data_type}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {results.length > 0 && (
//               <div className="bg-white p-6 rounded-lg shadow">
//                 <h2 className="text-xl font-semibold mb-4">Results</h2>
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full">
//                     <thead>
//                       <tr>
//                         {Object.keys(results[0]).map((key) => (
//                           <th key={key} className="px-4 py-2 text-left">{key}</th>
//                         ))}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {results.map((row, i) => (
//                         <tr key={i}>
//                           {Object.values(row).map((value: any, j) => (
//                             <td key={j} className="px-4 py-2 border-t">{value}</td>
//                           ))}
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// export default App;