function NoReviewsIllustration() {
  return (
    <svg
      className="mx-auto h-40 w-40 md:h-48 md:w-48"
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="110" cy="110" r="88" fill="#FDF2F8" />
      <rect x="62" y="56" width="96" height="120" rx="14" fill="white" stroke="#F9A8D4" strokeWidth="4" />
      <rect x="78" y="82" width="64" height="10" rx="5" fill="#FBCFE8" />
      <rect x="78" y="104" width="48" height="10" rx="5" fill="#FBCFE8" />
      <rect x="78" y="126" width="56" height="10" rx="5" fill="#FBCFE8" />
      <circle cx="166" cy="70" r="18" fill="#F472B6" />
      <path d="M159 70L164 75L173 66" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NoMatchesIllustration() {
  return (
    <svg
      className="mx-auto h-40 w-40 md:h-48 md:w-48"
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="110" cy="110" r="88" fill="#F8FAFC" />
      <circle cx="98" cy="98" r="46" fill="white" stroke="#CBD5E1" strokeWidth="4" />
      <line x1="131" y1="131" x2="164" y2="164" stroke="#94A3B8" strokeWidth="8" strokeLinecap="round" />
      <rect x="79" y="84" width="38" height="8" rx="4" fill="#E2E8F0" />
      <rect x="79" y="102" width="28" height="8" rx="4" fill="#E2E8F0" />
      <path d="M86 120L110 96" stroke="#F472B6" strokeWidth="5" strokeLinecap="round" />
      <path d="M110 120L86 96" stroke="#F472B6" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export default function EmptyStateIllustration({ type }) {
  if (type === "no-matches") {
    return <NoMatchesIllustration />;
  }
  return <NoReviewsIllustration />;
}
