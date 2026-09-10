/**
 * Fixed aurora + grain backdrop shared by every screen.
 *
 * Frosted glass only reads as glass when there is something varied behind it to
 * refract, so this is a prerequisite for the `.glass-*` utilities rather than
 * decoration. Purely presentational and non-interactive.
 *
 * The parent must establish the pointer field (see `usePointerField`) for the
 * parallax to respond; without it the blobs simply drift on their own.
 */
export default function AuroraBackdrop({ variant = 'full' }: { variant?: 'full' | 'subtle' }) {
  // The app shell carries dense UI, so its backdrop is dialled back to keep
  // text contrast high behind the glass panels.
  const opacity = variant === 'subtle' ? 0.55 : 1;

  return (
    <>
      <div className="aurora-field" aria-hidden="true" style={{ opacity }}>
        <div className="aurora-blob aurora-blob-1" style={{ ['--depth' as string]: '26px' }} />
        <div className="aurora-blob aurora-blob-2" style={{ ['--depth' as string]: '18px' }} />
        <div className="aurora-blob aurora-blob-3" style={{ ['--depth' as string]: '34px' }} />
        <div className="aurora-blob aurora-blob-4" style={{ ['--depth' as string]: '12px' }} />
      </div>
      <div className="grain-overlay" aria-hidden="true" />
    </>
  );
}
