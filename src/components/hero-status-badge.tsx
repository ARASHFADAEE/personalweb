"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PenLine, Layers } from "lucide-react";

export function HeroStatusBadge() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="relative inline-flex"
      initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.35, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="pointer-events-none absolute -inset-3 rounded-full bg-primary/25 blur-xl"
        animate={
          reduceMotion
            ? undefined
            : { opacity: [0.35, 0.65, 0.35], scale: [0.95, 1.05, 0.95] }
        }
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="hero-status-badge relative"
        animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="hero-status-badge__border" aria-hidden />

        <span className="hero-status-badge__shine" aria-hidden />

        <span className="relative z-[2] inline-flex items-center gap-2.5 rounded-full border border-primary/35 bg-primary/12 px-3.5 py-1.5 text-xs font-medium text-primary-foreground/95 shadow-[0_8px_32px_rgba(124,29,29,0.22)] backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
            {!reduceMotion && (
              <>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
                <span className="absolute h-3.5 w-3.5 animate-[hero-badge-ripple_2.4s_ease-out_infinite] rounded-full border border-primary/50" />
              </>
            )}
            <span className="relative h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(190,18,60,0.95)]" />
          </span>

          <span className="inline-flex items-center gap-1.5">
            <motion.span
              animate={reduceMotion ? undefined : { rotate: [0, 8, 0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="text-primary/90"
            >
              <PenLine className="h-3 w-3" aria-hidden />
            </motion.span>

            <span className="hero-status-badge__text whitespace-nowrap">
              تولید محتوا و معماری نرم‌افزار
            </span>

            <motion.span
              animate={reduceMotion ? undefined : { rotate: [0, -8, 0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              className="text-primary/90"
            >
              <Layers className="h-3 w-3" aria-hidden />
            </motion.span>
          </span>
        </span>
      </motion.div>
    </motion.div>
  );
}
