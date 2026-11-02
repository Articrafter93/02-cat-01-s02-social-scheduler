import type { NextConfig } from 'next'

// No images.remotePatterns on purpose: every <Image> renders Supabase media with
// `unoptimized`, so /_next/image never needs a remote host. An allow-list such as
// **.supabase.co would turn that endpoint into a public proxy for any Supabase project.
const nextConfig: NextConfig = {}

export default nextConfig
