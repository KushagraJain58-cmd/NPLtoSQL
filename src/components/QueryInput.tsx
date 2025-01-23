'use client'

import React, { useState, useEffect } from "react"
import { Search, Mic, MicOff, Users, Calendar, DollarSign } from 'lucide-react'
import { cn } from "../lib/utils"

interface QueryInputProps {
  onSubmit: (query: string) => void
  isLoading: boolean
}

export function QueryInput({ onSubmit, isLoading }: QueryInputProps) {
  const [query, setQuery] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = "en-US"

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setQuery(transcript)
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      setRecognition(recognition)
    }
  }, [])

  const toggleVoiceInput = () => {
    if (!recognition) return

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
    }
  }

  const customPrompt = (data: string) => {
    setQuery(data)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSubmit(query)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Enter a Query</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => customPrompt("Calculate average Shipping_Cost to 2 decimal points value by country")}
              className="flex items-center gap-2 p-3 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left text-gray-700 dark:text-gray-300"
            >
              <Users className="w-4 h-4 shrink-0" />
              <span className="line-clamp-2">
                Calculate average Shipping_Cost to 2 decimal points value by country
              </span>
            </button>
            <button
              type="button"
              onClick={() => customPrompt("List all Profit from the past month with limit 10")}
              className="flex items-center gap-2 p-3 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left text-gray-700 dark:text-gray-300"
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span className="line-clamp-2">
                List all Profit from the past month with limit 10
              </span>
            </button>
            <button
              type="button"
              onClick={() => customPrompt("Find Sales which is more than 20000 with limit 20")}
              className="flex items-center gap-2 p-3 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left text-gray-700 dark:text-gray-300"
            >
              <DollarSign className="w-4 h-4 shrink-0" />
              <span className="line-clamp-2">
                Find Sales which is more than 20000 with limit 20
              </span>
            </button>
            <button
              type="button"
              onClick={() => customPrompt("Compare the total Sales and Profit by Region with decimal point 2")}
              className="flex items-center gap-2 p-3 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left text-gray-700 dark:text-gray-300"
            >
              <DollarSign className="w-4 h-4 shrink-0" />
              <span className="line-clamp-2">
                Compare the total Sales and Profit by Region with decimal point 2
              </span>
            </button>
          </div>
        </div>

        <div className="relative">
          <div
            className={cn(
              "relative rounded-lg p-[2px] transition-all",
              "bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400",
              isFocused ? "opacity-100" : "opacity-70 hover:opacity-100"
            )}
          >
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Enter your natural language query"
              className="w-full h-24 px-4 py-3 pr-24 rounded-[6px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:outline-none"
            />
          </div>
          <div className="absolute right-2 bottom-2 flex gap-2">
            {recognition && (
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isListening
                    ? "text-red-500 hover:text-red-400 bg-red-500/10"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isListening && (
          <div className="text-sm text-blue-500 dark:text-blue-400 animate-pulse">
            Listening... Speak now
          </div>
        )}
      </form>
    </div>
  )
}