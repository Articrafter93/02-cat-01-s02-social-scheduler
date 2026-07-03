export const MEDIA_BUCKET = 'cat01s02-post-media'

/**
 * Validates that a post `media_url` really points at our Storage bucket AND at
 * the given org's path (`{orgId}/…`). This is a security boundary: without it a
 * caller could attach another org's image, or an arbitrary external URL, by
 * sending a crafted `media_url`. Kept as a pure function so it can be unit-tested
 * without a DB or network.
 */
export function isPostMediaUrlForOrg(
  url: unknown,
  orgId: string,
  supabaseUrl: string | undefined
): boolean {
  if (typeof url !== 'string' || url.length === 0) return false
  if (!supabaseUrl) return false
  const expectedPrefix = `${supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/${orgId}/`
  return url.startsWith(expectedPrefix)
}
