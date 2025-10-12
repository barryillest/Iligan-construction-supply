const express = require('express');
const axios = require('axios');
const { authenticateToken } = require('./auth');

const router = express.Router();

// BestBuy API configuration
const BESTBUY_API_KEY = process.env.BESTBUY_API_KEY;
const BESTBUY_BASE_URL = 'https://api.bestbuy.com/v1';

// Mock products database for construction supplies
const mockProducts = [
  // Power Tools
  {
    sku: 'DRILL001',
    name: 'DEWALT 20V MAX Cordless Drill/Driver Kit',
    salePrice: 7499.50,
    regularPrice: 8999.00,
    image: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=800&q=80',
    shortDescription: 'Powerful 20V MAX cordless drill/driver with 2 batteries and charger',
    longDescription: 'The DEWALT 20V MAX Cordless Drill/Driver features a high-performance motor that delivers 300 unit watts out (UWO) of power, completing a wide range of applications.',
    categoryPath: [{ name: 'Tools' }, { name: 'Power Tools' }],
    manufacturer: 'DEWALT',
    category: 'tools'
  },
  {
    sku: 'SAW001',
    name: 'SKILSAW 7-1/4" Circular Saw',
    salePrice: 4499.50,
    regularPrice: 5499.50,
    image: 'https://images.unsplash.com/photo-1590587784591-2f02ad8e71a0?w=800&q=80',
    shortDescription: 'Professional-grade circular saw with carbide-tipped blade',
    longDescription: 'SKILSAW 7-1/4" Circular Saw delivers power and durability in a lightweight saw designed for all-day use.',
    categoryPath: [{ name: 'Tools' }, { name: 'Power Tools' }],
    manufacturer: 'SKILSAW',
    category: 'tools'
  },
  {
    sku: 'HAMMER001',
    name: 'Estwing 16oz Straight Claw Hammer',
    salePrice: 1749.75,
    regularPrice: 1999.50,
    image: 'https://images.unsplash.com/photo-1580493575651-9ae31c8e2fc5?w=800&q=80',
    shortDescription: 'Forged steel hammer with shock-absorbing grip',
    longDescription: 'Estwing hammers integrate the head and handle using a patented shock-absorbing grip.',
    categoryPath: [{ name: 'Tools' }, { name: 'Hand Tools' }],
    manufacturer: 'Estwing',
    category: 'tools'
  },
  {
    sku: 'LEVEL001',
    name: 'STABILA 48" Box Level',
    salePrice: 6499.50,
    regularPrice: 7499.50,
    image: 'https://images.unsplash.com/photo-1588346454716-b97558be4744?w=800&q=80',
    shortDescription: 'Professional-grade aluminum level with magnetic base',
    longDescription: 'STABILA levels are known for their accuracy and durability in professional construction.',
    categoryPath: [{ name: 'Tools' }, { name: 'Measuring Tools' }],
    manufacturer: 'STABILA',
    category: 'tools'
  },

  // Hardware & Fasteners
  {
    sku: 'SCREW001',
    name: 'Deck Screws 2-1/2" (5 lb box)',
    salePrice: 1249.50,
    regularPrice: 1499.50,
    image: 'https://images.unsplash.com/photo-1621570958245-0c3d6d5ddf24?w=800&q=80',
    shortDescription: 'Corrosion-resistant deck screws for outdoor construction',
    longDescription: 'Premium quality deck screws with star drive for superior torque and reduced cam-out.',
    categoryPath: [{ name: 'Hardware' }, { name: 'Fasteners' }],
    manufacturer: 'FastenMaster',
    category: 'hardware'
  },
  {
    sku: 'BOLT001',
    name: 'Galvanized Carriage Bolts 1/2" x 6" (Pack of 10)',
    salePrice: 949.50,
    regularPrice: 1149.50,
    image: 'https://images.unsplash.com/photo-1606571801761-d9751c3c4c3a?w=800&q=80',
    shortDescription: 'Heavy-duty galvanized carriage bolts with nuts and washers',
    longDescription: 'Galvanized finish provides corrosion resistance for outdoor applications.',
    categoryPath: [{ name: 'Hardware' }, { name: 'Bolts' }],
    manufacturer: 'Hillman',
    category: 'hardware'
  },

  // Building Materials
  {
    sku: 'LUMBER001',
    name: '2x4x8 Pressure Treated Lumber',
    salePrice: 449.50,
    regularPrice: 549.50,
    image: 'https://images.unsplash.com/photo-1601975094768-0c890d69b42e?w=800&q=80',
    shortDescription: 'Pressure treated lumber for outdoor construction projects',
    longDescription: 'Ground contact pressure treated lumber rated for structural use and outdoor applications.',
    categoryPath: [{ name: 'Building Materials' }, { name: 'Lumber' }],
    manufacturer: 'Southern Pine',
    category: 'materials'
  },
  {
    sku: 'PLYWOOD001',
    name: '3/4" CDX Plywood 4x8 Sheet',
    salePrice: 2749.50,
    regularPrice: 3249.50,
    image: 'https://images.unsplash.com/photo-1601975094768-0c890d69b42e?w=800&q=85',
    shortDescription: 'Construction-grade CDX plywood for subflooring and sheathing',
    longDescription: 'CDX plywood with C-grade face and D-grade back, ideal for structural applications.',
    categoryPath: [{ name: 'Building Materials' }, { name: 'Sheet Goods' }],
    manufacturer: 'Weyerhaeuser',
    category: 'materials'
  },

  // Electrical
  {
    sku: 'WIRE001',
    name: '12 AWG THHN Wire 500ft Roll',
    salePrice: 4499.50,
    regularPrice: 5499.50,
    image: 'https://images.unsplash.com/photo-1594737625785-f0f5f76e0d2f?w=800&q=80',
    shortDescription: 'THHN building wire for electrical installations',
    longDescription: 'High-quality copper THHN wire suitable for conduit and general building wiring.',
    categoryPath: [{ name: 'Electrical' }, { name: 'Wire & Cable' }],
    manufacturer: 'Southwire',
    category: 'electrical'
  },
  {
    sku: 'OUTLET001',
    name: 'GFCI Outlet 20A Tamper Resistant',
    salePrice: 1249.50,
    regularPrice: 1499.50,
    image: 'https://images.unsplash.com/photo-1621905253845-c8536ba5b89b?w=800&q=80',
    shortDescription: 'GFCI outlet with ground fault protection and tamper resistance',
    longDescription: 'UL listed GFCI outlet provides electrical shock protection in wet locations.',
    categoryPath: [{ name: 'Electrical' }, { name: 'Outlets & Switches' }],
    manufacturer: 'Leviton',
    category: 'electrical'
  },

  // Plumbing
  {
    sku: 'PIPE001',
    name: '1/2" Copper Pipe 10ft Length',
    salePrice: 999.50,
    regularPrice: 1249.50,
    image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80',
    shortDescription: 'Type L copper pipe for water supply lines',
    longDescription: 'Premium copper pipe suitable for hot and cold water distribution systems.',
    categoryPath: [{ name: 'Plumbing' }, { name: 'Pipe & Fittings' }],
    manufacturer: 'Mueller',
    category: 'plumbing'
  },
  {
    sku: 'FITTING001',
    name: 'Copper 90° Elbow 1/2" (Pack of 10)',
    salePrice: 649.50,
    regularPrice: 799.50,
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&q=80',
    shortDescription: 'Copper pipe fittings for water line connections',
    longDescription: 'High-quality copper fittings for professional plumbing installations.',
    categoryPath: [{ name: 'Plumbing' }, { name: 'Pipe & Fittings' }],
    manufacturer: 'Mueller',
    category: 'plumbing'
  },

  // Safety Equipment
  {
    sku: 'HELMET001',
    name: 'Hard Hat with Ratchet Suspension',
    salePrice: 1499.50,
    regularPrice: 1749.50,
    image: 'https://images.unsplash.com/photo-1618609378039-b572f64c5b42?w=800&q=80',
    shortDescription: 'ANSI-approved hard hat with adjustable suspension',
    longDescription: 'Type I hard hat provides protection from falling objects and electrical hazards.',
    categoryPath: [{ name: 'Safety' }, { name: 'Head Protection' }],
    manufacturer: 'MSA',
    category: 'safety'
  },
  {
    sku: 'GLASSES001',
    name: 'Safety Glasses Clear Anti-Fog',
    salePrice: 499.50,
    regularPrice: 649.50,
    image: 'https://images.unsplash.com/photo-1577741314755-048d8525d31e?w=800&q=80',
    shortDescription: 'ANSI Z87.1 safety glasses with anti-fog coating',
    longDescription: 'Comfortable safety glasses with wraparound design and impact resistance.',
    categoryPath: [{ name: 'Safety' }, { name: 'Eye Protection' }],
    manufacturer: '3M',
    category: 'safety'
  },

  // Additional Power Tools
  {
    sku: 'GRINDER001',
    name: 'DEWALT 4-1/2" Angle Grinder',
    salePrice: 3999.50,
    regularPrice: 4999.50,
    image: 'https://images.unsplash.com/photo-1635805737707-575885ab0a0b?w=800&q=80',
    shortDescription: 'High-performance angle grinder with 11 amp motor',
    longDescription: 'Powerful 11 amp motor provides overload protection and increases performance.',
    categoryPath: [{ name: 'Tools' }, { name: 'Power Tools' }],
    manufacturer: 'DEWALT',
    category: 'tools'
  },
  {
    sku: 'ROUTER001',
    name: 'Bosch 2.25HP Variable Speed Router',
    salePrice: 9999.50,
    regularPrice: 11499.50,
    image: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=800&q=85',
    shortDescription: 'Professional router with variable speed control',
    longDescription: 'Precision engineered for smooth operation and accurate cuts.',
    categoryPath: [{ name: 'Tools' }, { name: 'Power Tools' }],
    manufacturer: 'Bosch',
    category: 'tools'
  },

  // More Hand Tools
  {
    sku: 'WRENCH001',
    name: 'Adjustable Wrench Set (3-piece)',
    salePrice: 1999.50,
    regularPrice: 2499.50,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85',
    shortDescription: 'Chrome vanadium adjustable wrench set',
    longDescription: 'Includes 6", 8", and 10" adjustable wrenches with comfortable grips.',
    categoryPath: [{ name: 'Tools' }, { name: 'Hand Tools' }],
    manufacturer: 'Craftsman',
    category: 'tools'
  },
  {
    sku: 'PLIERS001',
    name: 'Needle Nose Pliers 8"',
    salePrice: 1249.50,
    regularPrice: 1499.50,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=90',
    shortDescription: 'Professional needle nose pliers with wire cutting edge',
    longDescription: 'High-leverage design reduces hand fatigue and increases cutting power.',
    categoryPath: [{ name: 'Tools' }, { name: 'Hand Tools' }],
    manufacturer: 'Klein Tools',
    category: 'tools'
  },

  // Concrete & Masonry
  {
    sku: 'CONCRETE001',
    name: 'Portland Cement 94lb Bag',
    salePrice: 649.50,
    regularPrice: 799.50,
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=85',
    shortDescription: 'Type I Portland cement for general construction',
    longDescription: 'High-quality Portland cement suitable for concrete, mortar, and stucco.',
    categoryPath: [{ name: 'Building Materials' }, { name: 'Concrete' }],
    manufacturer: 'Quikrete',
    category: 'materials'
  },
  {
    sku: 'BRICK001',
    name: 'Common Red Brick (Each)',
    salePrice: 44.50,
    regularPrice: 54.50,
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=90',
    shortDescription: 'Standard red clay brick for construction',
    longDescription: 'Durable clay brick suitable for walls, patios, and landscaping.',
    categoryPath: [{ name: 'Building Materials' }, { name: 'Masonry' }],
    manufacturer: 'Acme Brick',
    category: 'materials'
  },

  // Roofing Materials
  {
    sku: 'SHINGLE001',
    name: 'Architectural Shingles (Bundle)',
    salePrice: 1999.50,
    regularPrice: 2499.50,
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=95',
    shortDescription: '3-tab architectural shingles with 25-year warranty',
    longDescription: 'High-quality asphalt shingles with dimensional appearance.',
    categoryPath: [{ name: 'Building Materials' }, { name: 'Roofing' }],
    manufacturer: 'GAF',
    category: 'materials'
  },
  {
    sku: 'NAIL001',
    name: 'Roofing Nails 1-1/4" (50lb box)',
    salePrice: 4499.50,
    regularPrice: 4999.50,
    image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800&q=95',
    shortDescription: 'Galvanized roofing nails with large head',
    longDescription: 'Corrosion-resistant nails designed specifically for roofing applications.',
    categoryPath: [{ name: 'Hardware' }, { name: 'Roofing' }],
    manufacturer: 'Maze Nails',
    category: 'hardware'
  }
];

// Add more products to reach a substantial catalog
const additionalProducts = [];
const constructionImages = [
  'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80',
  'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  'https://images.unsplash.com/photo-1581578017093-cd4286b8d5b7?w=800&q=80',
  'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800&q=80',
  'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80',
  'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80',
  'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=85',
  'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=85',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85'
];

for (let i = 1; i <= 50; i++) {
  const basePrice = Math.floor(Math.random() * 25000) + 500; // 500-25500 pesos
  additionalProducts.push({
    sku: `EXTRA${i.toString().padStart(3, '0')}`,
    name: `Construction Item ${i}`,
    salePrice: basePrice,
    regularPrice: basePrice + Math.floor(Math.random() * 3000) + 200,
    image: constructionImages[i % constructionImages.length],
    shortDescription: `Professional construction item for various building projects`,
    longDescription: `High-quality construction item designed for professional and DIY use.`,
    categoryPath: [{ name: 'Tools' }],
    manufacturer: 'ProBuild',
    category: ['tools', 'hardware', 'materials', 'electrical', 'plumbing', 'safety'][Math.floor(Math.random() * 6)]
  });
}

const allProducts = [...mockProducts, ...additionalProducts];

// Get products from mock database (fallback to BestBuy API if available)
router.get('/', async (req, res) => {
  try {
    const {
      search = '',
      category = '',
      page = 1,
      limit = 20,
      minPrice = 0,
      maxPrice = 10000,
      sort = 'name'
    } = req.query;

    let filteredProducts = [...allProducts];

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.shortDescription.toLowerCase().includes(searchLower) ||
        product.manufacturer.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (category) {
      filteredProducts = filteredProducts.filter(product =>
        product.category === category
      );
    }

    // Filter by price range
    filteredProducts = filteredProducts.filter(product =>
      product.salePrice >= parseFloat(minPrice) && product.salePrice <= parseFloat(maxPrice)
    );

    // Sort products
    filteredProducts.sort((a, b) => {
      switch (sort) {
        case 'salePrice':
          return a.salePrice - b.salePrice;
        case 'salePrice.dsc':
          return b.salePrice - a.salePrice;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    // Paginate results
    const pageNum = Math.max(1, parseInt(page));
    const pageSize = Math.min(parseInt(limit), 100);
    const startIndex = (pageNum - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    const totalPages = Math.ceil(filteredProducts.length / pageSize);

    res.json({
      products: paginatedProducts,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalProducts: filteredProducts.length,
        hasMore: pageNum < totalPages
      }
    });
  } catch (error) {
    console.error('Products API error:', error.message);
    res.status(500).json({
      message: 'Error fetching products',
      error: 'Service unavailable'
    });
  }
});

// Get single product details
router.get('/:sku', async (req, res) => {
  try {
    const { sku } = req.params;

    const product = allProducts.find(p => p.sku === sku);

    if (product) {
      // Add additional details for single product view
      const detailedProduct = {
        ...product,
        features: [
          'Professional grade construction',
          'Durable materials',
          'Industry standard compliance',
          'Reliable performance'
        ],
        specifications: {
          'Weight': 'Varies',
          'Dimensions': 'Standard',
          'Warranty': '1 Year',
          'Origin': 'USA'
        },
        modelNumber: product.sku,
        condition: 'New',
        inStoreAvailability: true
      };
      res.json(detailedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Product details error:', error.message);
    res.status(500).json({
      message: 'Error fetching product details',
      error: 'Service unavailable'
    });
  }
});

// Get product categories
router.get('/categories/list', async (req, res) => {
  try {
    const constructionCategories = [
      { id: 'tools', name: 'Tools', description: 'Power tools, hand tools, and equipment' },
      { id: 'hardware', name: 'Hardware', description: 'Nuts, bolts, fasteners, and fittings' },
      { id: 'electrical', name: 'Electrical', description: 'Wiring, outlets, and electrical components' },
      { id: 'plumbing', name: 'Plumbing', description: 'Pipes, fittings, and plumbing supplies' },
      { id: 'safety', name: 'Safety Equipment', description: 'Protective gear and safety equipment' },
      { id: 'materials', name: 'Building Materials', description: 'Lumber, concrete, and building supplies' }
    ];

    res.json({ categories: constructionCategories });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

module.exports = router;