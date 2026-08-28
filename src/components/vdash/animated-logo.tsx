import { useState, useCallback } from "react";
import logo from "@/assets/vdash-logo.png";
import { cn } from "@/lib/utils";

/**
 * Animated brand mark: a cartoon courier sprints in carrying a stack of files,
 * papers spill onto the ground, he runs into the "V", and the V morphs into
 * the V-dash logo.
 */
export function AnimatedLogo({
  className,
  size = 36,
  replayOnHover = true,
}: {
  className?: string;
  size?: number;
  replayOnHover?: boolean;
}) {
  const [run, setRun] = useState(0);

  const replay = useCallback(() => setRun((r) => r + 1), []);

  return (
    <span
      key={run}
      className={cn("vdash-logo relative inline-block shrink-0 align-middle", className)}
      style={{ width: size, height: size }}
      onMouseEnter={replayOnHover ? replay : undefined}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="vdash-logo-scene absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="vdashV" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="55%" stopColor="var(--periwinkle)" />
            <stop offset="100%" stopColor="var(--blush)" />
          </linearGradient>
        </defs>

        {/* ground */}
        <line
          x1="6"
          y1="84"
          x2="94"
          y2="84"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-border"
        />

        {/* dropped papers on the ground */}
        <g className="vdash-paper-drop">
          <rect x="12" y="76" width="13" height="8" rx="1.5" fill="var(--blush)" opacity="0.85" />
          <rect
            x="26"
            y="78"
            width="12"
            height="7"
            rx="1.5"
            fill="var(--periwinkle)"
            opacity="0.75"
          />
          <rect x="40" y="77" width="11" height="7" rx="1.5" fill="var(--primary)" opacity="0.5" />
        </g>

        {/* falling papers */}
        <g className="vdash-paper vdash-paper-1">
          <rect x="0" y="0" width="12" height="9" rx="1.5" fill="var(--periwinkle)" />
        </g>
        <g className="vdash-paper vdash-paper-2">
          <rect x="0" y="0" width="11" height="8" rx="1.5" fill="var(--blush)" />
        </g>
        <g className="vdash-paper vdash-paper-3">
          <rect x="0" y="0" width="10" height="8" rx="1.5" fill="var(--primary)" opacity="0.7" />
        </g>

        {/* runner */}
        <g className="vdash-runner" stroke="var(--primary)" strokeWidth="4.5" strokeLinecap="round">
          <circle cx="52" cy="24" r="8" fill="var(--primary)" stroke="none" />
          <line x1="50" y1="32" x2="46" y2="56" />
          {/* arms holding the file stack */}
          <line x1="50" y1="38" x2="62" y2="44" />
          <g className="vdash-arm-back">
            <line x1="50" y1="38" x2="38" y2="34" />
          </g>
          {/* stack of files */}
          <g stroke="none">
            <rect x="58" y="38" width="18" height="6" rx="1.5" fill="var(--periwinkle)" />
            <rect x="60" y="33" width="16" height="6" rx="1.5" fill="var(--blush)" />
          </g>
          {/* legs */}
          <g className="vdash-leg-front">
            <line x1="46" y1="56" x2="58" y2="72" />
            <line x1="58" y1="72" x2="66" y2="80" />
          </g>
          <g className="vdash-leg-back">
            <line x1="46" y1="56" x2="34" y2="70" />
            <line x1="34" y1="70" x2="30" y2="80" />
          </g>
        </g>

        {/* the V he runs into */}
        <path
          className="vdash-v"
          d="M22 22 L50 78 L78 22"
          fill="none"
          stroke="url(#vdashV)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <img
        src={logo}
        alt="V-dash logo"
        width={size}
        height={size}
        className="vdash-logo-final absolute inset-0 h-full w-full object-contain drop-shadow-sm"
      />
    </span>
  );
}
