"use client";

type MascotProps = {
  size?: number;
  className?: string;
  bounce?: boolean;
};

export default function Mascot({ size, className = "", bounce = false }: MascotProps) {
  return (
    <svg
      {...(size ? { width: size, height: size } : {})}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={`${bounce ? "animate-bounce" : ""} ${!size ? "w-full h-auto" : ""} ${className}`}
    >
      <defs>
        <linearGradient id="mascotBodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id="mascotWingGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>
        <linearGradient id="mascotTailGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>

      {/* cauda */}
      <path
        d="M92 145 C80 165, 75 185, 78 198 L88 196 C88 180, 90 162, 96 148 Z"
        fill="url(#mascotTailGrad)"
      />
      <path d="M100 148 C98 170, 98 188, 100 199 L110 199 C110 182, 108 164, 108 148 Z" fill="#1e40af" />
      <path
        d="M110 147 C118 167, 124 185, 124 198 L114 197 C112 180, 108 163, 104 148 Z"
        fill="url(#mascotTailGrad)"
      />

      {/* asa dobrada */}
      <path
        d="M118 82 C140 88, 155 105, 158 130 C159 142, 152 150, 140 150
           C144 138, 142 122, 132 108 C126 100, 120 92, 116 88 Z"
        fill="url(#mascotWingGrad)"
      />
      <path
        d="M124 96 C136 104, 144 116, 147 130"
        stroke="#0f2557"
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M120 104 C130 112, 137 122, 141 134"
        stroke="#0f2557"
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />

      {/* corpo */}
      <ellipse cx="98" cy="118" rx="34" ry="40" fill="url(#mascotBodyGrad)" />
      <ellipse cx="92" cy="128" rx="16" ry="22" fill="#60a5fa" opacity="0.35" />

      {/* pata */}
      <path
        d="M90 154 L86 164 M90 154 L92 165 M90 154 L96 163"
        stroke="#3f3f46"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* câmera */}
      <g transform="translate(104,150) rotate(10)">
        <rect x="-15" y="-9" width="30" height="20" rx="4" fill="#18181b" />
        <rect x="-5" y="-13" width="10" height="5" rx="2" fill="#18181b" />
        <circle cx="0" cy="1" r="7" fill="#3f3f46" />
        <circle cx="0" cy="1" r="4.5" fill="#71717a" />
        <rect x="7" y="-6" width="3.5" height="3.5" rx="1" fill="#fbbf24" />
      </g>

      {/* cabeça */}
      <circle cx="88" cy="62" r="30" fill="url(#mascotBodyGrad)" />

      {/* topete */}
      <path d="M78 36 C76 28, 80 24, 84 30 Z" fill="#1e3a8a" />
      <path d="M88 33 C87 24, 92 21, 95 28 Z" fill="#1e3a8a" />
      <path d="M98 36 C99 28, 105 27, 106 34 Z" fill="#1e3a8a" />

      {/* bochecha amarela */}
      <path d="M100 58 C112 56, 118 64, 114 74 C108 78, 100 76, 98 68 Z" fill="#fbbf24" />

      {/* aro amarelo do olho + olho */}
      <circle cx="94" cy="58" r="11" fill="none" stroke="#fbbf24" strokeWidth="3.5" />
      <circle cx="94" cy="58" r="6.5" fill="#18181b" />
      <circle cx="96.5" cy="55.5" r="2" fill="#fff" />

      {/* bico */}
      <path
        d="M106 62 C120 60, 126 68, 122 78 C118 86, 106 86, 100 80 C104 74, 106 68, 106 62 Z"
        fill="#18181b"
      />
      <path d="M104 80 C108 84, 116 84, 120 79" stroke="#3f3f46" strokeWidth="1.5" fill="none" />

      {/* antena com "+" (identidade da marca) */}
      <line x1="88" y1="32" x2="88" y2="20" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="88" cy="15" r="8" fill="#18181b" />
      <path d="M88 11v8M84 15h8" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
