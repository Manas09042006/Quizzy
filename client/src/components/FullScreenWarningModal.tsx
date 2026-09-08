import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Maximize2, ShieldAlert } from "lucide-react";

interface Props {
  isOpen: boolean;
  type: "fullscreen" | "tab_switch" | "critical";
  warningCount: number;
  maxWarnings: number;
  message: string;
  onRestoreFullscreen: () => void;
}

export default function FullScreenWarningModal({
  isOpen,
  type,
  warningCount,
  maxWarnings,
  message,
  onRestoreFullscreen,
}: Props) {
  if (!isOpen) return null;

  const isCritical = warningCount >= maxWarnings || type === "critical";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-red-300 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-2 bg-red-600 animate-pulse" />

          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            {isCritical ? <ShieldAlert size={36} /> : <AlertTriangle size={36} />}
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 uppercase tracking-wider mb-2">
            Warning {warningCount} of {maxWarnings}
          </span>

          <h2 className="text-2xl font-black text-gray-900 mb-2">
            {isCritical ? "Quiz Auto-Terminated" : "Suspicious Activity Detected"}
          </h2>

          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            {message}
          </p>

          {!isCritical ? (
            <div className="space-y-3">
              <button
                onClick={onRestoreFullscreen}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 flex items-center justify-center gap-2 text-sm transition"
              >
                <Maximize2 size={18} />
                Return to Full-Screen Mode
              </button>
              <p className="text-[11px] text-gray-400 font-medium">
                Note: Leaving the exam screen again may result in immediate failure.
              </p>
            </div>
          ) : (
            <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
              Maximum allowed warnings exceeded. Your answers and violation logs have been submitted to the Admin.
            </p>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
