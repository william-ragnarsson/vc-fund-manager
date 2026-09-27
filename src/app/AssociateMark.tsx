/**
 * Associate's logo: the A of Associate drawn as a peak, with its crossbar reduced
 * to a single point, framed in an outlined rounded square. It sits in front of the
 * wordmark and scales with its font size; the lockup's container keeps
 * white-space: nowrap so the two never split. The tab icons copy this drawing:
 * the inline SVG in index.html (strokes a little heavier, on white) and the PNGs
 * in public/, which data/build_icons.py renders. When the drawing changes, update both.
 */
export function AssociateMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="1" width="22" height="22" rx="5.5" strokeWidth="2" />
      <path d="M6 17.5 12 6.5l6 11" strokeWidth="2.25" />
      <circle cx="12" cy="14.9" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
