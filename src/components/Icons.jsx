export const serviceIcons = [
  'M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4h2a2 2 0 0 1 2 2v10h-2v-10h-2v10H4Zm4-14v2h2V7H8Zm0 4v2h2v-2H8Zm0 4v2h2v-2H8Zm4-8v2h2V7h-2Zm0 4v2h2v-2h-2Z',
  'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Zm6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-4 10h8c0-2-1.8-3-4-3s-4 1-4 3Zm9-9v2h5V9h-5Zm0 4v2h5v-2h-5Z',
  'M12 2 2 7v2h20V7L12 2ZM4 11v7h3v-7H4Zm6.5 0v7h3v-7h-3ZM17 11v7h3v-7h-3ZM2 20v2h20v-2H2Z',
  'M4 3h16v18H4V3Zm3 4v2h10V7H7Zm0 4v2h4v-2H7Zm6 0v2h4v-2h-4Zm-6 4v2h4v-2H7Zm6 0v2h4v-2h-4Z',
];

// About tiles: end-to-end setup (layers), banks, tax, ongoing support (headset)
export const aboutIcons = [
  'M12 2 2 7l10 5 10-5-10-5Zm-7.8 8.9L2 12l10 5 10-5-2.2-1.1L12 14.8l-7.8-3.9Zm0 5L2 17l10 5 10-5-2.2-1.1L12 19.8l-7.8-3.9Z',
  'M12 2 2 7v2h20V7L12 2ZM4 11v7h3v-7H4Zm6.5 0v7h3v-7h-3ZM17 11v7h3v-7h-3ZM2 20v2h20v-2H2Z',
  'M5 2h11l4 4v16H5V2Zm10 1.5V7h3.5L15 3.5ZM8 10v2h9v-2H8Zm0 4v2h9v-2H8Zm0 4v2h6v-2H8Z',
  'M12 3a8 8 0 0 0-8 8v5a3 3 0 0 0 3 3h2v-7H6v-1a6 6 0 1 1 12 0v1h-3v7h3v1h-5v2h5a2 2 0 0 0 2-2v-1.2A3 3 0 0 0 20 16v-5a8 8 0 0 0-8-8Z',
];

export const Icon =({ d, className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true"><path d={d} /></svg>
);

export const ShieldIcon = () => (
  <Icon d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Zm-1 14-4-4 1.4-1.4L11 13.2l5.6-5.6L18 9l-7 7Z" />
);

export const WhatsAppIcon = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3Zm0 23.6c-2 0-4-.5-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6Zm5.8-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.7s1.2 3.2 1.3 3.4c.2.2 2.3 3.5 5.6 4.9 2.1.9 2.9 1 4 .8.6-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5l-.6-.3Z" /></svg>
);
