import { describe, it, expect } from 'vitest'
import { isPostMediaUrlForOrg } from './media'

// This is the multi-tenant boundary for post images: a caller must not be able
// to attach another org's image or an arbitrary external URL by sending a
// crafted media_url. These tests would fail if that check were weakened.
const BASE = 'https://proj.supabase.co'
const ORG = '10000000-0000-0000-0000-000000000001'
const OTHER_ORG = '20000000-0000-0000-0000-000000000002'

describe('isPostMediaUrlForOrg', () => {
  it('accepts an image in our bucket under the org path', () => {
    const url = `${BASE}/storage/v1/object/public/cat01s02-post-media/${ORG}/abc.png`
    expect(isPostMediaUrlForOrg(url, ORG, BASE)).toBe(true)
  })

  it("rejects another org's image (no cross-tenant image attach)", () => {
    const url = `${BASE}/storage/v1/object/public/cat01s02-post-media/${OTHER_ORG}/abc.png`
    expect(isPostMediaUrlForOrg(url, ORG, BASE)).toBe(false)
  })

  it('rejects an arbitrary external URL', () => {
    expect(isPostMediaUrlForOrg('https://evil.example.com/x.png', ORG, BASE)).toBe(false)
  })

  it('rejects a URL in a different bucket', () => {
    const url = `${BASE}/storage/v1/object/public/some-other-bucket/${ORG}/abc.png`
    expect(isPostMediaUrlForOrg(url, ORG, BASE)).toBe(false)
  })

  it('rejects non-string, empty, or missing base', () => {
    expect(isPostMediaUrlForOrg(null, ORG, BASE)).toBe(false)
    expect(isPostMediaUrlForOrg('', ORG, BASE)).toBe(false)
    expect(isPostMediaUrlForOrg(`${BASE}/storage/v1/object/public/cat01s02-post-media/${ORG}/a.png`, ORG, undefined)).toBe(false)
  })
})
