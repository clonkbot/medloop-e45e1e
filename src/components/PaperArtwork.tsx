import { useMemo } from "react";

interface PaperArtworkProps {
  specialty: string;
  size?: "small" | "medium" | "large";
}

// Generate procedural SVG artwork based on specialty
export function PaperArtwork({ specialty, size = "medium" }: PaperArtworkProps) {
  const artwork = useMemo(() => {
    const seed = specialty.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (n: number) => ((seed * 9301 + 49297) % 233280) / 233280 * n;

    const colors: Record<string, { primary: string; secondary: string; accent: string; bg: string }> = {
      Cardiology: { primary: "#ef4444", secondary: "#f87171", accent: "#fca5a5", bg: "#1a0505" },
      Oncology: { primary: "#f59e0b", secondary: "#fbbf24", accent: "#fcd34d", bg: "#1a1205" },
      Neurology: { primary: "#8b5cf6", secondary: "#a78bfa", accent: "#c4b5fd", bg: "#0f0a1a" },
      Pharmacology: { primary: "#3b82f6", secondary: "#60a5fa", accent: "#93c5fd", bg: "#050a15" },
      Immunology: { primary: "#10b981", secondary: "#34d399", accent: "#6ee7b7", bg: "#051a12" },
      Orthopedics: { primary: "#6b7280", secondary: "#9ca3af", accent: "#d1d5db", bg: "#0a0a0a" },
      Ophthalmology: { primary: "#0ea5e9", secondary: "#38bdf8", accent: "#7dd3fc", bg: "#051520" },
      Pediatrics: { primary: "#ec4899", secondary: "#f472b6", accent: "#f9a8d4", bg: "#1a0510" },
    };

    const c = colors[specialty] || colors.Cardiology;

    // Generate different patterns based on specialty
    if (specialty === "Cardiology") {
      // Heart-rate / ECG style pattern with anatomical nodes
      return (
        <svg viewBox="0 0 400 300" className="w-full h-full">
          <defs>
            <linearGradient id={`grad-${specialty}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={c.bg} />
              <stop offset="100%" stopColor={c.primary} stopOpacity="0.2" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect fill={`url(#grad-${specialty})`} width="400" height="300" />
          {/* ECG line */}
          <path
            d="M0,150 L80,150 L100,150 L110,100 L120,200 L130,80 L140,150 L200,150 L220,150 L230,100 L240,200 L250,80 L260,150 L320,150 L340,150 L350,100 L360,200 L370,80 L380,150 L400,150"
            stroke={c.primary}
            strokeWidth="2"
            fill="none"
            filter="url(#glow)"
          />
          {/* Pulsing nodes */}
          {[60, 140, 260, 340].map((x, i) => (
            <circle key={i} cx={x} cy={150} r={4 + random(3)} fill={c.secondary} opacity="0.8">
              <animate attributeName="r" values={`${4 + i};${8 + i};${4 + i}`} dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.4;0.8" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </svg>
      );
    }

    if (specialty === "Oncology") {
      // Orbital cell diagrams
      return (
        <svg viewBox="0 0 400 300" className="w-full h-full">
          <defs>
            <linearGradient id={`grad-${specialty}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={c.bg} />
              <stop offset="100%" stopColor={c.primary} stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <rect fill={`url(#grad-${specialty})`} width="400" height="300" />
          {/* Orbital paths */}
          {[1, 2, 3].map((i) => (
            <ellipse
              key={i}
              cx="200"
              cy="150"
              rx={40 * i}
              ry={25 * i}
              fill="none"
              stroke={c.secondary}
              strokeWidth="1"
              opacity={0.3 + i * 0.1}
              transform={`rotate(${i * 30} 200 150)`}
            />
          ))}
          {/* Center cell */}
          <circle cx="200" cy="150" r="20" fill={c.primary} opacity="0.8">
            <animate attributeName="r" values="20;25;20" dur="3s" repeatCount="indefinite" />
          </circle>
          {/* Orbiting particles */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <circle key={i} cx="0" cy="0" r="6" fill={c.accent}>
              <animateMotion
                dur={`${3 + i * 0.5}s`}
                repeatCount="indefinite"
                path={`M200,${150 - 30 * (i % 3 + 1)} A${30 * (i % 3 + 1)},${30 * (i % 3 + 1)} 0 1,1 200,${150 + 30 * (i % 3 + 1)} A${30 * (i % 3 + 1)},${30 * (i % 3 + 1)} 0 1,1 200,${150 - 30 * (i % 3 + 1)}`}
              />
            </circle>
          ))}
        </svg>
      );
    }

    if (specialty === "Neurology") {
      // Brain-wave neural network
      return (
        <svg viewBox="0 0 400 300" className="w-full h-full">
          <defs>
            <linearGradient id={`grad-${specialty}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={c.bg} />
              <stop offset="100%" stopColor={c.primary} stopOpacity="0.2" />
            </linearGradient>
            <filter id="glow-neuro">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect fill={`url(#grad-${specialty})`} width="400" height="300" />
          {/* Neural nodes */}
          {Array.from({ length: 15 }).map((_, i) => {
            const x = 50 + (i % 5) * 75 + random(30);
            const y = 50 + Math.floor(i / 5) * 80 + random(30);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={6 + random(4)} fill={c.primary} opacity="0.7" filter="url(#glow-neuro)">
                  <animate attributeName="opacity" values="0.4;0.9;0.4" dur={`${2 + random(2)}s`} repeatCount="indefinite" />
                </circle>
                {/* Connections */}
                {i < 12 && (
                  <line
                    x1={x}
                    y1={y}
                    x2={50 + ((i + 1) % 5) * 75 + random(30)}
                    y2={50 + Math.floor((i + 1) / 5) * 80 + random(30)}
                    stroke={c.secondary}
                    strokeWidth="1"
                    opacity="0.3"
                  />
                )}
              </g>
            );
          })}
          {/* Wave pattern */}
          <path
            d={`M0,250 Q100,${220 + random(40)} 200,250 T400,250`}
            stroke={c.accent}
            strokeWidth="2"
            fill="none"
            opacity="0.5"
          >
            <animate
              attributeName="d"
              values={`M0,250 Q100,${220} 200,250 T400,250;M0,250 Q100,${260} 200,250 T400,250;M0,250 Q100,${220} 200,250 T400,250`}
              dur="4s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      );
    }

    if (specialty === "Pharmacology") {
      // Molecular geometry
      return (
        <svg viewBox="0 0 400 300" className="w-full h-full">
          <defs>
            <linearGradient id={`grad-${specialty}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={c.bg} />
              <stop offset="100%" stopColor={c.primary} stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <rect fill={`url(#grad-${specialty})`} width="400" height="300" />
          {/* Hexagonal molecular structure */}
          {[
            { cx: 200, cy: 150 },
            { cx: 140, cy: 115 },
            { cx: 140, cy: 185 },
            { cx: 260, cy: 115 },
            { cx: 260, cy: 185 },
            { cx: 200, cy: 80 },
            { cx: 200, cy: 220 },
          ].map((pos, i) => (
            <g key={i}>
              <circle cx={pos.cx} cy={pos.cy} r={12} fill={c.primary} opacity="0.8">
                <animate attributeName="r" values="12;15;12" dur={`${2 + i * 0.2}s`} repeatCount="indefinite" />
              </circle>
              {i > 0 && (
                <line
                  x1={200}
                  y1={150}
                  x2={pos.cx}
                  y2={pos.cy}
                  stroke={c.secondary}
                  strokeWidth="3"
                  opacity="0.6"
                />
              )}
            </g>
          ))}
          {/* Additional bonds */}
          <line x1="140" y1="115" x2="200" y2="80" stroke={c.accent} strokeWidth="2" opacity="0.4" />
          <line x1="260" y1="115" x2="200" y2="80" stroke={c.accent} strokeWidth="2" opacity="0.4" />
          <line x1="140" y1="185" x2="200" y2="220" stroke={c.accent} strokeWidth="2" opacity="0.4" />
          <line x1="260" y1="185" x2="200" y2="220" stroke={c.accent} strokeWidth="2" opacity="0.4" />
        </svg>
      );
    }

    if (specialty === "Immunology") {
      // Antibody / cell defense pattern
      return (
        <svg viewBox="0 0 400 300" className="w-full h-full">
          <defs>
            <linearGradient id={`grad-${specialty}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={c.bg} />
              <stop offset="100%" stopColor={c.primary} stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <rect fill={`url(#grad-${specialty})`} width="400" height="300" />
          {/* Y-shaped antibodies */}
          {[
            { x: 100, y: 100 },
            { x: 200, y: 150 },
            { x: 300, y: 100 },
            { x: 150, y: 220 },
            { x: 250, y: 220 },
          ].map((pos, i) => (
            <g key={i} transform={`translate(${pos.x}, ${pos.y}) rotate(${i * 20})`}>
              <path
                d="M0,0 L-20,-30 M0,0 L20,-30 M0,0 L0,30"
                stroke={c.primary}
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="-20" cy="-30" r="8" fill={c.secondary}>
                <animate attributeName="r" values="8;10;8" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
              <circle cx="20" cy="-30" r="8" fill={c.secondary}>
                <animate attributeName="r" values="8;10;8" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
            </g>
          ))}
        </svg>
      );
    }

    // Default pattern for other specialties
    return (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        <defs>
          <linearGradient id={`grad-${specialty}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c.bg} />
            <stop offset="100%" stopColor={c.primary} stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <rect fill={`url(#grad-${specialty})`} width="400" height="300" />
        {/* Abstract grid pattern */}
        {Array.from({ length: 6 }).map((_, i) => (
          <g key={i}>
            <circle
              cx={100 + (i % 3) * 100}
              cy={100 + Math.floor(i / 3) * 100}
              r={20 + random(20)}
              fill="none"
              stroke={c.primary}
              strokeWidth="2"
              opacity="0.5"
            >
              <animate attributeName="r" values={`${20 + i * 5};${30 + i * 5};${20 + i * 5}`} dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
      </svg>
    );
  }, [specialty]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {artwork}
    </div>
  );
}
