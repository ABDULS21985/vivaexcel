"use client";

// =============================================================================
// Voice Search Button
// =============================================================================
// Microphone button that uses the Web Speech API for voice-to-text input.
// Shows a pulsing animation when actively listening. Gracefully hides
// itself on browsers that do not support SpeechRecognition.

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@ktblog/ui/components";

// =============================================================================
// Types
// =============================================================================

interface VoiceSearchProps {
  /** Callback invoked with the recognized transcript */
  onResult: (transcript: string) => void;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function VoiceSearchButton({ onResult, className }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(
    null,
  );

  // Check browser support on mount
  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    setIsSupported(supported);
  }, []);

  const startListening = useCallback(() => {
    const recognition = createRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);
  }, [onResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Do not render if unsupported
  if (!isSupported) return null;

  return (
    <div className={cn("relative", className)}>
      {/* Pulse ring when listening */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.6, opacity: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeOut",
            }}
            className="absolute inset-0 rounded-full bg-red-500/30"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={toggleListening}
        whileTap={{ scale: 0.9 }}
        className={cn(
          "relative z-10 flex items-center justify-center",
          "w-9 h-9 rounded-full",
          "transition-colors duration-200",
          "outline-none focus-visible:ring-2 focus-visible:ring-[#1E4DB7] focus-visible:ring-offset-2",
          isListening
            ? "bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400"
            : "text-slate-400 hover:text-[#1E4DB7] hover:bg-slate-100 dark:hover:text-blue-400 dark:hover:bg-slate-800",
        )}
        aria-label={isListening ? "Stop voice search" : "Start voice search"}
        aria-pressed={isListening}
      >
        {isListening ? (
          <MicOff size={18} aria-hidden="true" />
        ) : (
          <Mic size={18} aria-hidden="true" />
        )}
      </motion.button>
    </div>
  );
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Creates a SpeechRecognition instance across browsers.
 */
function createRecognition(): SpeechRecognition | null {
  if (typeof window === "undefined") return null;

  const SpeechRecognitionConstructor =
    (window as unknown as { SpeechRecognition?: typeof SpeechRecognition })
      .SpeechRecognition ||
    (
      window as unknown as {
        webkitSpeechRecognition?: typeof SpeechRecognition;
      }
    ).webkitSpeechRecognition;

  if (!SpeechRecognitionConstructor) return null;

  return new SpeechRecognitionConstructor();
}
