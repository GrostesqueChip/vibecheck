"use client";

import { motion } from "framer-motion";

interface ReframePromptProps {
  visible: boolean;
  originalPhrase: string | null;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function ReframePrompt({
  visible,
  originalPhrase,
  value,
  onChange,
  onSubmit,
  disabled = false,
}: ReframePromptProps) {
  if (!visible) {
    return null;
  }

  return (
    <motion.div
      className="reframe-prompt"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.35 }}
    >
      <div className="reframe-copy">The oracle senses tension. Want to reframe it?</div>
      {originalPhrase ? <div className="reframe-original">Original: “{originalPhrase}”</div> : null}
      <div className="reframe-row">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Give the thought a kinder angle..."
          disabled={disabled}
        />
        <button onClick={onSubmit} type="button" disabled={disabled || !value.trim()}>
          Reframe
        </button>
      </div>
    </motion.div>
  );
}
