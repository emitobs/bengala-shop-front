import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Bengala Max';
const SITE_URL = 'https://bengalamax.uy';
const DEFAULT_DESCRIPTION =
  'Tu tienda online de variedades en Uruguay. Envios a todo el pais. Fray Bentos y Mercedes.';
const DEFAULT_IMAGE = `${SITE_URL}/android-chrome-512x512.png`;

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product';
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noindex = false,
  jsonLd,
}: SeoProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Tienda Online`;
  const canonicalUrl = url ? `${SITE_URL}${url}` : undefined;
  const absoluteImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:type" content={type} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content={type === 'product' ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

// ── JSON-LD helpers ──────────────────────────────────────────

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bengala Max',
    url: SITE_URL,
    logo: `${SITE_URL}/android-chrome-512x512.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'contacto@bengalamax.uy',
      contactType: 'customer service',
      areaServed: 'UY',
      availableLanguage: 'Spanish',
    },
    sameAs: [
      'https://www.instagram.com/bengala_max/',
      'https://www.facebook.com/BengalaMax/',
    ],
  };
}

export function buildLocalBusinessSchema() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: 'Bengala Max - Fray Bentos (Rincon)',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Rincon 1783',
        addressLocality: 'Fray Bentos',
        addressCountry: 'UY',
      },
      telephone: '+59898161513',
      url: SITE_URL,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: 'Bengala Max - Fray Bentos (18 de Julio)',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '18 de Julio 1174',
        addressLocality: 'Fray Bentos',
        addressCountry: 'UY',
      },
      telephone: '+59891423838',
      url: SITE_URL,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: 'Bengala Max - Mercedes',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Colon 442',
        addressLocality: 'Mercedes',
        addressCountry: 'UY',
      },
      telephone: '+59891423854',
      url: SITE_URL,
    },
  ];
}

export function buildProductSchema(product: {
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  compareAtPrice?: number | null;
  images: { url: string }[];
  averageRating?: number | null;
  reviewCount?: number;
  category?: { name: string } | null;
  variants: { stock: number }[];
}) {
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const image = product.images[0]?.url;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description?.slice(0, 200) || product.name,
    url: `${SITE_URL}/productos/${product.slug}`,
    ...(image && { image }),
    ...(product.category && { category: product.category.name }),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'UYU',
      price: product.basePrice,
      availability: totalStock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Bengala Max',
      },
    },
  };

  if (product.averageRating && product.reviewCount && product.reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

export function buildBreadcrumbSchema(
  items: { name: string; url: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}
