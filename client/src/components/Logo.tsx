export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-label="ByteTrack Retail"
      role="img"
      data-testid="img-logo"
    >
      <rect x="1" y="1" width="30" height="30" rx="6" fill="currentColor" opacity="0.08" />
      <rect x="1.5" y="1.5" width="29" height="29" rx="5.5" stroke="currentColor" strokeOpacity="0.25" />
      <path
        d="M8 23 L16 9 L24 23"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="square"
      />
      <circle cx="16" cy="9" r="2.2" fill="currentColor" />
      <circle cx="8" cy="23" r="1.4" fill="currentColor" opacity="0.5" />
      <circle cx="24" cy="23" r="1.4" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
