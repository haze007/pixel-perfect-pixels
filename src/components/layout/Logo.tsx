interface LogoMarkProps {
  color: string;
  size?: number;
}

/**
 * Replace the SVG path(s) inside <g id="mark"> with your Quiver.ai export.
 * Keep the outer <svg> wrapper and pass `color` as fill/stroke.
 * The text "Tannery Sim" is rendered separately in AppShell.
 */
export function LogoMark({ color, size = 28 }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/*
        ── PLACEHOLDER ──────────────────────────────────────────────────────
        Replace everything inside this <g> with your Quiver.ai SVG mark.
        Scale/translate so it fits the 28×28 viewBox.
        Use `fill={color}` or `stroke={color}` on your paths.
        ─────────────────────────────────────────────────────────────────────
      */}
      <g id="mark">
        {/* Three-band leather cross-section placeholder */}
        <rect x="4" y="7" width="20" height="4" rx="2" fill={color} />
        <rect x="4" y="13" width="20" height="4" rx="2" fill={color} opacity="0.65" />
        <rect x="4" y="19" width="20" height="4" rx="2" fill={color} opacity="0.35" />
      </g>
    </svg>
  );
}

/** Favicon-sized version (32×32) for dynamic favicon injection */
export function faviconSvgString(color: string): string {
  return `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="7" fill="${color}" opacity="0.12"/>
  <rect x="5" y="9" width="22" height="4.5" rx="2.25" fill="${color}"/>
  <rect x="5" y="15.25" width="22" height="4.5" rx="2.25" fill="${color}" opacity="0.65"/>
  <rect x="5" y="21.5" width="22" height="4.5" rx="2.25" fill="${color}" opacity="0.35"/>
</svg>`;
}
