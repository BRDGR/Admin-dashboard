/**
 * Mock fallback configuration.
 *
 * Read-only API helpers may substitute fixture data when an endpoint is not yet
 * implemented — but ONLY when explicitly opted in during development:
 *
 *   NEXT_PUBLIC_ENABLE_MOCK_FALLBACKS=true   (in .env.local)
 *
 * This is always disabled in production builds, so admins never see fixture
 * data presented as real. Mutations must never fake success, regardless of
 * this flag.
 */
export const MOCK_FALLBACKS_ENABLED =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_ENABLE_MOCK_FALLBACKS === "true";
