import { Helmet } from 'react-helmet-async'

/**
 * SEO helper for unique page titles, meta descriptions, canonical URLs,
 * Open Graph metadata, and JSON-LD structured schemas.
 */
export function SEO({
  title,
  description = 'Free, beginner-friendly financial calculators and learning hub for young Indians. Plan SIP, loans, taxes, and retirement with clarity.',
  canonical,
  ogType = 'website',
  jsonLd = null,
}) {
  const siteTitle = 'InFinance'
  const fullTitle = title ? `${title} | ${siteTitle}` : 'InFinance | Smart Financial Planning & Learning for India'
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://infinance-home.netlify.app'
  const canonicalUrl = canonical || currentUrl

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />

      {/* Structured Data (JSON-LD) */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  )
}

export default SEO
