/**
 * Hermes-inspired wing motifs. The winged sandal (talaria) is our emblem.
 * Sweeping, swift, elegant. Three variants at different scales.
 */

type WingProps = {
  className?: string;
  strokeWidth?: number;
};

function featherPath(angleDeg: number, length: number, arch: number): string {
  const rad = (angleDeg * Math.PI) / 180;
  const tipX = Math.cos(rad) * length;
  const tipY = -Math.sin(rad) * length;
  // Perpendicular direction to lift the curve into a gentle arch
  const perpX = -Math.sin(rad) * arch;
  const perpY = -Math.cos(rad) * arch;
  const c1x = tipX * 0.28 + perpX * 0.6;
  const c1y = tipY * 0.28 + perpY * 0.6;
  const c2x = tipX * 0.72 + perpX;
  const c2y = tipY * 0.72 + perpY;
  return `M 0 0 C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${tipX.toFixed(1)} ${tipY.toFixed(1)}`;
}

function buildWingFeathers(count: number, fromAngle: number, toAngle: number) {
  const feathers: { d: string; opacity: number; width: number }[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const angle = fromAngle + t * (toAngle - fromAngle);
    // Bell curve: longer in the middle of the fan, shorter at the ends
    const lengthBase = 80 + Math.sin(t * Math.PI) * 110;
    const arch = 14 - t * 6;
    feathers.push({
      d: featherPath(angle, lengthBase, arch),
      opacity: 0.85 - Math.abs(t - 0.5) * 0.35,
      width: 1.1 + Math.sin(t * Math.PI) * 0.35,
    });
  }
  return feathers;
}

/**
 * Full pair of sweeping wings. Designed to sit as a hero backdrop.
 * Renders symmetrically around the vertical centerline.
 */
export function WingSpread({ className, strokeWidth = 1 }: WingProps) {
  const feathers = buildWingFeathers(11, -6, 72);

  return (
    <svg
      viewBox="-260 -220 520 300"
      className={`text-accent-400 ${className ?? ""}`}
      aria-hidden="true"
      fill="none"
      strokeLinecap="round"
    >
      {/* Right wing */}
      <g stroke="currentColor">
        {feathers.map((f, i) => (
          <path
            key={`r${i}`}
            d={f.d}
            strokeWidth={f.width * strokeWidth}
            opacity={f.opacity}
          />
        ))}
      </g>
      {/* Left wing — mirrored */}
      <g stroke="currentColor" transform="scale(-1 1)">
        {feathers.map((f, i) => (
          <path
            key={`l${i}`}
            d={f.d}
            strokeWidth={f.width * strokeWidth}
            opacity={f.opacity}
          />
        ))}
      </g>

      {/* Central connective spine */}
      <path
        d="M 0 -12 L 0 -180"
        stroke="currentColor"
        strokeWidth={0.8}
        opacity={0.4}
      />
    </svg>
  );
}

/**
 * Single wing, used as an accent — e.g. beside a section heading or a feature card.
 * By default faces right; pass `mirror` to flip.
 */
export function WingAccent({
  className,
  mirror = false,
  strokeWidth = 1,
}: WingProps & { mirror?: boolean }) {
  const feathers = buildWingFeathers(7, 2, 62);
  return (
    <svg
      viewBox="-20 -180 220 210"
      className={`text-accent-400 ${className ?? ""}`}
      aria-hidden="true"
      fill="none"
      strokeLinecap="round"
    >
      <g stroke="currentColor" transform={mirror ? "scale(-1 1)" : undefined}>
        {feathers.map((f, i) => (
          <path
            key={i}
            d={f.d}
            strokeWidth={f.width * strokeWidth}
            opacity={f.opacity}
          />
        ))}
      </g>
    </svg>
  );
}

/**
 * Miniature wing mark for the logotype. Compact and glyph-like.
 */
export function WingMark({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-32 -32 64 64"
      className={`text-accent-400 ${className ?? ""}`}
      aria-hidden="true"
      fill="none"
      strokeLinecap="round"
    >
      {/* Right wing — 4 feathers */}
      <g stroke="currentColor" strokeWidth={1.35}>
        <path d="M 0 0 Q 8 -8 22 -6" />
        <path d="M 0 2 Q 8 -2 24 4" opacity={0.85} />
        <path d="M 0 4 Q 6 4 22 14" opacity={0.7} />
        <path d="M 0 6 Q 4 8 16 18" opacity={0.55} />
      </g>
      <g stroke="currentColor" strokeWidth={1.35} transform="scale(-1 1)">
        <path d="M 0 0 Q 8 -8 22 -6" />
        <path d="M 0 2 Q 8 -2 24 4" opacity={0.85} />
        <path d="M 0 4 Q 6 4 22 14" opacity={0.7} />
        <path d="M 0 6 Q 4 8 16 18" opacity={0.55} />
      </g>
      {/* Central bead — suggests the caduceus staff / sandal strap */}
      <circle cx="0" cy="0" r="1.6" fill="currentColor" />
    </svg>
  );
}

/**
 * Thin sweeping streaks suggesting motion / swift flight. Purely decorative.
 */
export function MotionStreaks({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 400"
      className={`text-accent-400 ${className ?? ""}`}
      aria-hidden="true"
      fill="none"
      strokeLinecap="round"
      stroke="currentColor"
    >
      <path d="M 40 120 Q 400 80 760 140 T 1160 150" strokeWidth="1" opacity="0.35" />
      <path d="M 60 210 Q 500 190 900 230 T 1180 220" strokeWidth="0.8" opacity="0.3" />
      <path d="M 80 300 Q 420 310 820 280 T 1140 290" strokeWidth="0.6" opacity="0.22" />
    </svg>
  );
}
