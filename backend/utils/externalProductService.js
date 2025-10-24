const axios = require('axios');
const { URL } = require('url');

const PROVIDER_SCRAPERAPI = 'scraperapi';
const PROVIDER_SCRAPINGBEE = 'scrapingbee';
const PROVIDER_APIFY = 'apify';
const PROVIDER_DIRECT = 'direct';
const DEMO_DATASET_DUMMYJSON = 'dummyjson';
const DEMO_DATASET_FAKESTORE = 'fakestore';

const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_PROVIDER =
  (process.env.PRODUCT_SCRAPER_PROVIDER || PROVIDER_SCRAPERAPI).toLowerCase();

const pick = (...candidates) =>
  candidates.find(
    (value) =>
      typeof value === 'string' &&
      value.trim().length > 0 &&
      value.trim().toLowerCase() !== 'undefined'
  )?.trim() || null;

conts pick = (...candidates) =>
  candidate.find(
    (value) =>
      typeof value ==='string' &&
      value 
  )
const stripTags = (text = '') =>
  typeof text === 'string'
    ? text.replace(/<\/?[^>]+(>|$)/g, '').replace(/\s+/g, ' ').trim()
    : '';

const truncate = (text, maxLength = 240) => {
  if (!text || typeof text !== 'string') {
    return null;
  }
  const cleaned = stripTags(text);
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return `${cleaned.slice(0, maxLength - 3)}...`;
};

const slugify = (value) =>
  typeof value === 'string'
    ? value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    : null;

const decodeBasicEntities = (value) =>
  typeof value === 'string'
    ? value
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
    : value;

const resolveToAbsoluteUrl = (value, sourceUrl) => {
  if (!value || typeof value !== 'string') {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith('//')) {
    return `https:${value}`;
  }

  try {
    return new URL(value, sourceUrl).toString();
  } catch (_error) {
    return value;
  }
};

const extractMeta = (html, property) => {
  if (!html || !property) {
    return null;
  }

  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      'i'
    ),
    new RegExp(
      `<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      'i'
    ),
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(html);
    if (match && match[1]) {
      return decodeBasicEntities(match[1]).trim();
    }
  }

  return null;
};

const extractBetween = (html, startToken, endToken) => {
  if (!html || !startToken || !endToken) {
    return null;
  }

  const start = html.indexOf(startToken);
  if (start === -1) return null;

  const end = html.indexOf(endToken, start + startToken.length);
  if (end === -1) return null;

  return html
    .slice(start + startToken.length, end)
    .replace(/\s+/g, ' ')
    .trim();
};

const parseJsonSafely = (payload) => {
  if (!payload || typeof payload !== 'string') {
    return null;
  }

  try {
    return JSON.parse(payload);
  } catch (error) {
    return null;
  }
};

const extractJsonLdProduct = (html) => {
  if (!html) return null;

  const scriptRegex =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match = scriptRegex.exec(html);

  while (match) {
    const json = parseJsonSafely(match[1]);
    if (json) {
      const candidates = Array.isArray(json) ? json : [json];
      // eslint-disable-next-line no-restricted-syntax
      for (const entry of candidates) {
        const types = []
          .concat(entry['@type'] || [])
          .map((type) => String(type).toLowerCase());

        if (types.includes('product')) {
          return entry;
        }
      }
    }
    match = scriptRegex.exec(html);
  }

  return null;
};

const normalizeCurrency = (value, fallback) => {
  if (typeof value === 'string' && value.trim()) {
    return value.trim().slice(0, 8).toUpperCase();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return fallback || null;
};

const parsePriceValue = (rawPrice) => {
  if (rawPrice === null || rawPrice === undefined) {
    return null;
  }

  if (typeof rawPrice === 'number' && Number.isFinite(rawPrice)) {
    return rawPrice;
  }

  if (typeof rawPrice !== 'string') {
    return null;
  }

  const sanitized = rawPrice.replace(/\s/g, '');

  // Detect format like 1.234,56 or 1,234.56
  const digitsAndSeparators = sanitized.replace(/[^0-9.,-]/g, '');
  if (!digitsAndSeparators) {
    return null;
  }

  const commaCount = (digitsAndSeparators.match(/,/g) || []).length;
  const dotCount = (digitsAndSeparators.match(/\./g) || []).length;

  let normalized = digitsAndSeparators;

  if (commaCount === 1 && dotCount === 0) {
    normalized = digitsAndSeparators.replace(',', '.');
  } else if (commaCount > 1 && dotCount === 0) {
    normalized = digitsAndSeparators.replace(/,/g, '');
  } else if (dotCount > 1 && commaCount === 0) {
    normalized = digitsAndSeparators.replace(/\./g, '');
  } else if (dotCount === 1 && commaCount > 0) {
    // Assume comma is thousand separator
    normalized = digitsAndSeparators.replace(/,/g, '');
  } else if (commaCount === 1 && dotCount > 0) {
    // Assume dot is thousand separator
    normalized = digitsAndSeparators.replace(/\./g, '').replace(',', '.');
  }

  const numericValue = Number(normalized);

  return Number.isFinite(numericValue) ? numericValue : null;
};

const deriveSkuFromUrl = (targetUrl, fallbackName) => {
  try {
    const url = new URL(targetUrl);
    const segments = url.pathname.split('/').filter(Boolean);
    const candidate = decodeBasicEntities(
      segments.pop() || url.hostname || fallbackName || ''
    );

    const cleaned = candidate
      .replace(/\.html?$/i, '')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toUpperCase();

    if (cleaned.length >= 4) {
      return cleaned.slice(0, 36);
    }

    if (fallbackName) {
      return fallbackName
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-+|-+$/g, '')
        .toUpperCase()
        .slice(0, 36);
    }

    return `IMPORTED-${Date.now()}`;
  } catch (error) {
    if (fallbackName) {
      return fallbackName
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-+|-+$/g, '')
        .toUpperCase()
        .slice(0, 36);
    }
    return `IMPORTED-${Date.now()}`;
  }
};

const ensureValidUrl = (value) => {
  try {
    const parsed = new URL(value);
    if (!/^https?:$/.test(parsed.protocol)) {
      throw new Error('Only HTTP and HTTPS URLs are allowed');
    }
    return parsed.toString();
  } catch (error) {
    throw new Error('Provide a valid product URL (must start with http or https).');
  }
};

const parseHtmlProduct = (html, sourceUrl, structuredData = null) => {
  const jsonLdProduct = structuredData || extractJsonLdProduct(html);

  const name = pick(
    jsonLdProduct?.name,
    extractMeta(html, 'product:name'),
    extractMeta(html, 'og:title'),
    extractMeta(html, 'twitter:title'),
    extractBetween(html, '<title>', '</title>')
  );

  const description = pick(
    jsonLdProduct?.description,
    extractMeta(html, 'description'),
    extractMeta(html, 'og:description'),
    extractMeta(html, 'twitter:description')
  );

  const image = pick(
    Array.isArray(jsonLdProduct?.image)
      ? jsonLdProduct.image[0]
      : jsonLdProduct?.image,
    jsonLdProduct?.image?.url,
    extractMeta(html, 'product:image'),
    extractMeta(html, 'og:image'),
    extractMeta(html, 'twitter:image')
  );

  const normalisedImage = image ? resolveToAbsoluteUrl(image, sourceUrl) : null;

  const currency = normalizeCurrency(
    jsonLdProduct?.offers?.priceCurrency ||
      jsonLdProduct?.offers?.pricecurrency ||
      jsonLdProduct?.offers?.currency ||
      extractMeta(html, 'product:price:currency') ||
      extractMeta(html, 'og:price:currency'),
    null
  );

  const rawPrice = pick(
    jsonLdProduct?.offers?.price,
    jsonLdProduct?.offers?.priceAmount,
    jsonLdProduct?.price,
    jsonLdProduct?.offers?.highPrice,
    extractMeta(html, 'product:price:amount'),
    extractMeta(html, 'og:price:amount')
  );

  let salePrice = parsePriceValue(rawPrice);

  if (salePrice === null) {
    const priceMatch =
      html &&
      html.match(
        /(₱|\$|€|£)\s?(?:\d{1,3}(?:[,.\s]\d{3})*|\d+)(?:[.,]\d{2})?/
      );
    if (priceMatch) {
      salePrice = parsePriceValue(priceMatch[0]);
    }
  }

  const shortDescription =
    description && description.length > 240
      ? `${description.slice(0, 237)}...`
      : description;

  return {
    name: name ? stripTags(decodeBasicEntities(name)) : null,
    description: description ? stripTags(decodeBasicEntities(description)) : null,
    shortDescription: shortDescription
      ? stripTags(decodeBasicEntities(shortDescription))
      : null,
    longDescription: description ? stripTags(decodeBasicEntities(description)) : null,
    image: normalisedImage ? decodeBasicEntities(normalisedImage) : null,
    currency,
    salePrice,
    priceText: rawPrice || null,
    suggestedSku: deriveSkuFromUrl(sourceUrl, name),
  };
};

const providers = {
  async [PROVIDER_SCRAPERAPI](targetUrl) {
    const apiKey = process.env.SCRAPER_API_KEY;
    if (!apiKey) {
      throw new Error('SCRAPER_API_KEY is not configured.');
    }

    const baseUrl =
      process.env.SCRAPER_API_BASE_URL || 'https://api.scraperapi.com';

    const params = {
      api_key: apiKey,
      url: targetUrl,
      render: process.env.SCRAPER_API_RENDER || 'true',
      device_type: process.env.SCRAPER_API_DEVICE || 'desktop',
      country_code: process.env.SCRAPER_API_COUNTRY || undefined,
      autoparse: process.env.SCRAPER_API_AUTOPARSE || undefined,
    };

    const response = await axios.get(baseUrl, {
      params,
      timeout: DEFAULT_TIMEOUT_MS,
      responseType: 'text',
      validateStatus: (status) => status >= 200 && status < 500,
    });

    if (response.status >= 400) {
      throw new Error(
        `ScraperAPI request failed with status ${response.status}: ${response.data}`
      );
    }

    let structured = null;
    let html = response.data;

    if (typeof response.data === 'object') {
      structured = response.data;
      html = response.data?.html || null;
    }

    const contentType = response.headers['content-type'] || '';
    if (contentType.includes('application/json') && typeof response.data === 'string') {
      structured = parseJsonSafely(response.data);
      html = structured?.html || null;
    }

    return {
      provider: PROVIDER_SCRAPERAPI,
      html,
      structured,
    };
  },

  async [PROVIDER_SCRAPINGBEE](targetUrl) {
    const apiKey = process.env.SCRAPER_API_KEY || process.env.SCRAPINGBEE_API_KEY;
    if (!apiKey) {
      throw new Error('SCRAPER_API_KEY or SCRAPINGBEE_API_KEY must be set for ScrapingBee.');
    }

    const response = await axios.get(
      process.env.SCRAPER_API_BASE_URL || 'https://app.scrapingbee.com/api/v1/',
      {
        params: {
          api_key: apiKey,
          url: targetUrl,
          render_js: process.env.SCRAPINGBEE_RENDER_JS || 'false',
          premium_proxy: process.env.SCRAPINGBEE_PREMIUM || undefined,
        },
        timeout: DEFAULT_TIMEOUT_MS,
        responseType: 'text',
      }
    );

    return {
      provider: PROVIDER_SCRAPINGBEE,
      html: response.data,
      structured: null,
    };
  },

  async [PROVIDER_APIFY](targetUrl) {
    const apiKey = process.env.APIFY_TOKEN || process.env.SCRAPER_API_KEY;
    if (!apiKey) {
      throw new Error('APIFY_TOKEN (or SCRAPER_API_KEY) must be set for Apify.');
    }

    const baseUrl =
      process.env.APIFY_ACTOR_WEBHOOK ||
      process.env.SCRAPER_API_BASE_URL ||
      null;

    if (!baseUrl) {
      throw new Error(
        'Set APIFY_ACTOR_WEBHOOK or SCRAPER_API_BASE_URL to the Apify actor invocation URL.'
      );
    }

    const response = await axios.post(
      baseUrl,
      { url: targetUrl },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: DEFAULT_TIMEOUT_MS,
      }
    );

    return {
      provider: PROVIDER_APIFY,
      html: response.data?.html || null,
      structured: response.data,
    };
  },

  async [PROVIDER_DIRECT](targetUrl) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Direct fetching is disabled in production.');
    }

    const response = await axios.get(targetUrl, {
      timeout: DEFAULT_TIMEOUT_MS,
      responseType: 'text',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      },
    });

    return {
      provider: PROVIDER_DIRECT,
      html: response.data,
      structured: null,
    };
  },
};

const normaliseStructuredProduct = (structured) => {
  if (!structured || typeof structured !== 'object') {
    return null;
  }

  if (structured.product || structured.productTitle || structured.title) {
    return structured.product || structured;
  }

  return structured;
};

const buildProductPayload = ({ html, structured, sourceUrl, provider }) => {
  const structuredProduct = normaliseStructuredProduct(structured);
  const parsed = parseHtmlProduct(html, sourceUrl, structuredProduct);

  const price =
    parsePriceValue(
      structuredProduct?.price ||
        structuredProduct?.priceValue ||
        structuredProduct?.price_amount ||
        structuredProduct?.offers?.price
    ) || parsed.salePrice;

  const currency =
    normalizeCurrency(
      structuredProduct?.currency ||
        structuredProduct?.priceCurrency ||
        structuredProduct?.offers?.priceCurrency,
      parsed.currency
    ) || null;

  const bestName = pick(
    structuredProduct?.title,
    structuredProduct?.name,
    structuredProduct?.productTitle,
    parsed.name
  );

  const bestDescription = pick(
    structuredProduct?.shortDescription,
    structuredProduct?.description,
    parsed.description
  );

  const bestImage = pick(
    structuredProduct?.mainImage,
    structuredProduct?.image,
    structuredProduct?.imageUrl,
    parsed.image
  );

  const resolvedImage = bestImage
    ? resolveToAbsoluteUrl(bestImage, sourceUrl)
    : parsed.image;

  const shortDescription =
    bestDescription && bestDescription.length > 240
      ? `${bestDescription.slice(0, 237)}...`
      : bestDescription;

  return {
    product: {
      name: bestName,
      salePrice: price,
      regularPrice: null,
      priceText: parsed.priceText || structuredProduct?.priceText || null,
      currency,
      image: resolvedImage,
      shortDescription,
      longDescription: structuredProduct?.longDescription || bestDescription,
      description: structuredProduct?.description || bestDescription,
      category:
        structuredProduct?.category ||
        structuredProduct?.categoryName ||
        null,
      sourceUrl,
      suggestedSku: parsed.suggestedSku,
      metadata: {
        importedFrom: sourceUrl,
        importedAt: new Date().toISOString(),
        provider,
        currency,
        priceText: parsed.priceText || structuredProduct?.priceText || null,
        structuredSnapshot: structuredProduct
          ? {
              name: structuredProduct.name || structuredProduct.title || null,
              price: structuredProduct.price || null,
              priceCurrency:
                structuredProduct.priceCurrency ||
                structuredProduct.currency ||
                null,
              image:
                resolveToAbsoluteUrl(
                  structuredProduct.image || structuredProduct.imageUrl || null,
                  sourceUrl
                ) || null,
              category:
                structuredProduct.category || structuredProduct.categoryName || null,
            }
          : null,
      },
    },
    raw: {
      provider,
      structuredAvailable: Boolean(structuredProduct),
      htmlUsed: Boolean(html),
    },
  };
};

const fetchExternalProduct = async (productUrl) => {
  if (!productUrl) {
    throw new Error('Provide a product URL to import.');
  }

  const targetUrl = ensureValidUrl(productUrl);

  const providerName =
    (process.env.PRODUCT_SCRAPER_PROVIDER || DEFAULT_PROVIDER).toLowerCase();

  const provider = providers[providerName];
  if (!provider) {
    throw new Error(
      `Unsupported PRODUCT_SCRAPER_PROVIDER "${providerName}". Supported providers: ${Object.keys(
        providers
      ).join(', ')}`
    );
  }

  const { html, structured, provider: resolvedProvider } = await provider(targetUrl);

  const payload = buildProductPayload({
    html,
    structured,
    sourceUrl: targetUrl,
    provider: resolvedProvider || providerName,
  });

  if (!payload.product.name) {
    throw new Error(
      'Failed to determine the product name from the provided URL. Try a different URL or provider.'
    );
  }

  if (payload.product.salePrice === null) {
    payload.product.salePrice = 0;
  }

  return payload;
};

const mapDatasetProduct = ({ dataset, sourceUrl, product, currency = 'USD' }) => {
  if (!product || typeof product !== 'object') {
    throw new Error('The dataset response did not include product information.');
  }

  const name = pick(product.title, product.name, product.productName);
  const description = pick(
    product.description,
    product.longDescription,
    product.shortDescription
  );
  const image = pick(product.thumbnail, product.image, product.images?.[0]);

  if (!name) {
    throw new Error(`The ${dataset} dataset response did not contain a product title.`);
  }

  const salePrice = product.price !== undefined ? Number(product.price) : null;
  const regularPrice =
    product.originalPrice !== undefined
      ? Number(product.originalPrice)
      : product.regularPrice !== undefined
        ? Number(product.regularPrice)
        : null;

  const stock =
    product.stock !== undefined && product.stock !== null
      ? Math.max(0, Math.round(Number(product.stock)))
      : null;

  const brand = pick(product.brand, product.manufacturer, product.maker);
  const category = pick(product.categorySlug, product.category);

  const normalizedCategory = category
    ? slugify(String(category))
    : brand
      ? slugify(brand)
      : null;

  const shortDescription =
    truncate(product.shortDescription || description, 200) || truncate(description, 200);

  const longDescription = description || product.longDescription || product.details || null;

  const skuCandidate = pick(
    product.sku,
    product.code,
    `${dataset}-${product.id || product.slug || Date.now()}`
  );
  const suggestedSku = skuCandidate
    ? skuCandidate
        .toString()
        .replace(/[^a-z0-9-]+/gi, '-')
        .replace(/^-+|-+$/g, '')
        .toUpperCase()
        .slice(0, 48)
    : `${dataset}-${Date.now()}`;

  const metadata = {
    importedFrom: sourceUrl,
    importedAt: new Date().toISOString(),
    provider: dataset,
    dataset,
    datasetProductId: product.id || null,
    datasetSlug: product.slug || null,
    currency,
    priceText: product.priceText || null,
    brand: brand || null,
    rating: product.rating || product.rate || null,
  };

  Object.keys(metadata).forEach((key) => {
    if (metadata[key] === undefined || metadata[key] === null || metadata[key] === '') {
      delete metadata[key];
    }
  });

  return {
    product: {
      name,
      salePrice,
      regularPrice,
      currency,
      image: image ? resolveToAbsoluteUrl(image, sourceUrl) : null,
      shortDescription,
      longDescription,
      description: description || longDescription || shortDescription || null,
      category: normalizedCategory,
      manufacturer: brand || null,
      stock,
      sourceUrl,
      suggestedSku,
      metadata,
    },
    raw: {
      dataset,
      sourceUrl,
    },
  };
};

const fetchDummyJsonProduct = async (reference) => {
  const baseUrl = 'https://dummyjson.com/products';
  const normalizedRef = reference ? String(reference).trim().toLowerCase() : null;

  const enrichAndMap = (product, refSource) => {
    if (!product || typeof product !== 'object') {
      throw new Error('DummyJSON returned an unexpected response.');
    }

    const enrichment = { ...product };
    if (!enrichment.shortDescription && product.description) {
      enrichment.shortDescription = truncate(product.description, 180);
    }
    if (enrichment.stock === undefined && product.stock !== undefined) {
      enrichment.stock = product.stock;
    }
    if (!enrichment.categorySlug && product.category) {
      enrichment.categorySlug = slugify(product.category);
    }

    const mapped = mapDatasetProduct({
      dataset: DEMO_DATASET_DUMMYJSON,
      sourceUrl: `${baseUrl}/${product.id ?? refSource ?? 'random'}`,
      product: enrichment,
    });

    if (!mapped.product.regularPrice && product.discountPercentage) {
      const discount = Number(product.discountPercentage);
      if (Number.isFinite(discount) && discount > 0 && discount < 100) {
        const expected = mapped.product.salePrice / (1 - discount / 100);
        mapped.product.regularPrice = Number(expected.toFixed(2));
        mapped.product.metadata.discountPercentage = discount;
      }
    }

    return mapped;
  };

  const fetchById = async (id) => {
    const response = await axios
      .get(`${baseUrl}/${id}`, { timeout: DEFAULT_TIMEOUT_MS })
      .catch((error) => {
        if (error.response?.status === 404) {
          const friendly = new Error(
            `No DummyJSON product matched "${id}". Try IDs 1-100 or the keyword "random".`
          );
          friendly.status = 404;
          throw friendly;
        }
        throw error;
      });
    return enrichAndMap(response.data, id);
  };

  if (!normalizedRef || normalizedRef === 'random') {
    let total = 100;
    try {
      const summary = await axios.get(`${baseUrl}?limit=1`, {
        timeout: DEFAULT_TIMEOUT_MS,
      });
      if (Number.isFinite(summary.data?.total)) {
        total = summary.data.total;
      }
    } catch (err) {
      console.warn(
        '[DummyJSON] Failed to determine total product count. Defaulting to 100.',
        err?.message || err
      );
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const skip = Math.max(0, Math.floor(Math.random() * Math.max(total, 1)));
      try {
        const listResponse = await axios.get(`${baseUrl}?limit=1&skip=${skip}`, {
          timeout: DEFAULT_TIMEOUT_MS,
        });
        const randomProduct = listResponse.data?.products?.[0];
        if (randomProduct) {
          return enrichAndMap(randomProduct, randomProduct.id);
        }
      } catch (err) {
        console.warn(
          `[DummyJSON] Random fetch attempt ${attempt + 1} failed.`,
          err?.message || err
        );
      }
    }

    // Fallback to first product if random attempts keep failing
    return fetchById(1);
  }

  if (/^\d+$/.test(normalizedRef)) {
    const numericId = Number(normalizedRef);
    if (Number.isFinite(numericId) && numericId > 0) {
      return fetchById(numericId);
    }
  }

  const searchResponse = await axios.get(`${baseUrl}/search`, {
    params: { q: reference, limit: 1 },
    timeout: DEFAULT_TIMEOUT_MS,
  });
  const [firstMatch] = searchResponse.data?.products || [];
  if (!firstMatch) {
    throw new Error(
      `No DummyJSON product matched "${reference}". Try a different keyword or numeric ID.`
    );
  }

  return enrichAndMap(firstMatch, firstMatch.id);
};

const fetchFakeStoreProduct = async (reference) => {
  const baseUrl = 'https://fakestoreapi.com/products';
  let endpoint = `${baseUrl}/1`;

  if (reference && reference !== 'random') {
    const numericId = Number(reference);
    if (Number.isFinite(numericId) && numericId > 0) {
      endpoint = `${baseUrl}/${numericId}`;
    } else {
      const listResponse = await axios.get(baseUrl, {
        timeout: DEFAULT_TIMEOUT_MS,
      });
      const products = listResponse.data;
      if (!Array.isArray(products) || products.length === 0) {
        throw new Error('Fake Store API returned no products.');
      }
      const target = products.find((item) =>
        item.title?.toLowerCase().includes(reference.toLowerCase())
      );
      if (!target) {
        throw new Error(
          `No FakeStore product matched "${reference}". Try a numeric ID between 1 and ${products.length}.`
        );
      }
      return mapDatasetProduct({
        dataset: DEMO_DATASET_FAKESTORE,
        sourceUrl: `${baseUrl}/${target.id}`,
        product: {
          ...target,
          stock: target.rating?.count ?? null,
          brand: target.brand || null,
        },
      });
    }
  } else if (reference === 'random') {
    endpoint = `${baseUrl}/${Math.floor(Math.random() * 20) + 1}`;
  }

  const response = await axios
    .get(endpoint, { timeout: DEFAULT_TIMEOUT_MS })
    .catch((error) => {
      if (error.response?.status === 404) {
        const friendly = new Error(
          `No FakeStore product matched "${reference || endpoint.split('/').pop()}". Try IDs 1-20 or the keyword "random".`
        );
        friendly.status = 404;
        throw friendly;
      }
      throw error;
    });
  const product = response.data;

  if (!product || typeof product !== 'object') {
    throw new Error('Fake Store API returned an unexpected response.');
  }

  const mapped = mapDatasetProduct({
    dataset: DEMO_DATASET_FAKESTORE,
    sourceUrl: `${baseUrl}/${product.id ?? reference ?? '1'}`,
    product: {
      ...product,
      stock: product.rating?.count ?? null,
    },
  });

  return mapped;
};

const fetchDemoDatasetProduct = async (dataset, reference) => {
  if (!dataset) {
    throw new Error('Specify a dataset to import from.');
  }

  const normalized = String(dataset).trim().toLowerCase();
  switch (normalized) {
    case DEMO_DATASET_DUMMYJSON:
      return fetchDummyJsonProduct(reference);
    case DEMO_DATASET_FAKESTORE:
      return fetchFakeStoreProduct(reference);
    default:
      throw new Error(
        `Unsupported dataset "${dataset}". Supported datasets: ${[
          DEMO_DATASET_DUMMYJSON,
          DEMO_DATASET_FAKESTORE,
        ].join(', ')}.`
      );
  }
};

module.exports = {
  fetchExternalProduct,
  fetchDemoDatasetProduct,
  PROVIDER_SCRAPERAPI,
  PROVIDER_SCRAPINGBEE,
  PROVIDER_APIFY,
  PROVIDER_DIRECT,
  DEMO_DATASET_DUMMYJSON,
  DEMO_DATASET_FAKESTORE,
};
