const express = require('express');
const axios = require('axios');
const { authenticateToken, requireAdmin } = require('./auth');
const Product = require('../models/Product');
const CatalogExclusion = require('../models/CatalogExclusion');
const {
  fetchExternalProduct,
  fetchDemoDatasetProduct,
} = require('../utils/externalProductService');

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
    category: 'tools',
    stock: 24
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
    sku: 'LADDER001',
    name: 'Little Giant 22ft Fiberglass Extension Ladder',
    salePrice: 12499.99,
    regularPrice: 13999.99,
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
    shortDescription: 'Heavy-duty Type 1A fiberglass extension ladder',
    longDescription: 'The Little Giant 22ft Fiberglass Extension Ladder is perfect for professional contractors and serious DIYers who need a reliable, durable ladder for various tasks.',
    categoryPath: [{ name: 'Ladders' }],
    manufacturer: 'Little Giant',
    category: 'ladders'
  },
  {
    sku: 'PAINT001',
    name: 'Behr Premium Plus Interior Paint - Gallon',
    salePrice: 3499.99,
    regularPrice: 3999.99,
    image: 'https://images.unsplash.com/photo-1579963333761-bcf8b716fdda?w=800&q=80',
    shortDescription: 'Premium interior paint with primer included',
    longDescription: 'Behr Premium Plus is a high-quality interior paint that provides excellent coverage and durability with a beautiful, even finish.',
    categoryPath: [{ name: 'Paint & Supplies' }],
    manufacturer: 'Behr',
    category: 'paint'
  },
  {
    sku: 'NAIL001',
    name: 'Grip-Rite #8 x 1-1/4" Coarse Thread Drywall Screws (5 lbs)',
    salePrice: 2499.99,
    regularPrice: 2799.99,
    image: 'https://images.unsplash.com/photo-161710388c4e3e5f3d7e2b5b1d9a8f7c?w=800&q=80',
    shortDescription: 'High-quality drywall screws for professional results',
    longDescription: 'Grip-Rite drywall screws are designed for fastening drywall to wood studs in interior applications.',
    categoryPath: [{ name: 'Hardware' }, { name: 'Fasteners' }],
    manufacturer: 'Grip-Rite',
    category: 'hardware',
    stock: 500
  },
  {
    sku: 'PIPE001',
    name: '1/2" x 10ft Type M Copper Pipe',
    salePrice: 3499.99,
    regularPrice: 3899.99,
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
    shortDescription: 'Type M copper pipe for water supply lines',
    longDescription: '1/2 inch diameter Type M copper pipe is ideal for water supply lines in residential and commercial applications.',
    categoryPath: [{ name: 'Plumbing' }, { name: 'Pipes' }],
    manufacturer: 'Mueller',
    category: 'plumbing'
  },
  {
    sku: 'WIRE001',
    name: 'Southwire 12/2 NMB WG Wire (250ft)',
    salePrice: 12499.99,
    regularPrice: 13999.99,
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
    shortDescription: '12/2 NMB WG wire for residential wiring',
    longDescription: 'Southwire 12/2 NMB WG wire is used for residential branch circuits for outlets, switches, and other residential load requirements.',
    categoryPath: [{ name: 'Electrical' }, { name: 'Wire & Cable' }],
    manufacturer: 'Southwire',
    category: 'electrical'
  },
  {
    sku: 'TILE001',
    name: 'Porcelain Floor Tile (24" x 24") - Box of 5',
    salePrice: 8999.99,
    regularPrice: 9999.99,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    shortDescription: 'Premium porcelain floor tile, 24x24 inches',
    longDescription: 'High-quality porcelain floor tile perfect for high-traffic areas. Each box covers approximately 20 square feet.',
    categoryPath: [{ name: 'Flooring' }, { name: 'Tile' }],
    manufacturer: 'Daltile',
    category: 'flooring'
  },
  {
    sku: 'LIGHT001',
    name: 'LED Recessed Downlight (6-inch)',
    salePrice: 2499.99,
    regularPrice: 2999.99,
    image: 'https://images.unsplash.com/photo-1593061237123-80813a8cbfb6?w=800&q=80',
    shortDescription: 'Dimmable LED recessed lighting fixture',
    longDescription: '6-inch ultra-thin LED recessed downlight with dimmable, energy-efficient lighting. Easy to install and long-lasting.',
    categoryPath: [{ name: 'Lighting' }, { name: 'Ceiling Lights' }],
    manufacturer: 'Commercial Electric',
    category: 'lighting'
  }
];

/* DUPLICATE BLOCK START - commented out to fix syntax
const allProducts = [...mockProducts];
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
    category: 'tools',
    stock: 24
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
    category: 'safety',
    stock: 40
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
    category: 'safety',
    stock: 40
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
    sku: 'NAIL001',
    name: 'Roofing Nails 1-1/4" (50lb box)',
    salePrice: 4499.50,
    regularPrice: 4999.50,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    shortDescription: 'Galvanized steel roofing nails, 1-1/4 inch',
    longDescription: 'Hot-dipped galvanized steel roofing nails for superior rust resistance. 50lb box contains approximately 14,000 nails.',
    categoryPath: [{ name: 'Fasteners' }],
    manufacturer: 'Grip-Rite',
    category: 'fasteners',
    stock: 500
  }
];

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

*/
const additionalProducts = [
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
    category: 'tools',
    stock: 24,
  },
  {
    sku: 'HELMET001',
    name: 'Hard Hat with Ratchet Suspension',
    salePrice: 1499.50,
    regularPrice: 1749.50,
    image: 'https://images.unsplash.com/photo-1589999905872-4a3f3d5b3a1a?w=800&q=80',
    shortDescription: 'ANSI Z89.1 certified hard hat with 4-point suspension',
    longDescription: 'Lightweight and durable hard hat with comfortable suspension for all-day wear.',
    categoryPath: [{ name: 'Safety' }],
    manufacturer: '3M',
    category: 'safety',
    stock: 40,
  },
  {
    sku: 'NAIL001',
    name: 'Roofing Nails 1-1/4" (50lb box)',
    salePrice: 4499.50,
    regularPrice: 4999.50,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    shortDescription: 'Galvanized steel roofing nails, 1-1/4 inch',
    longDescription: 'Hot-dipped galvanized steel roofing nails for superior rust resistance. 50lb box contains approximately 14,000 nails.',
    categoryPath: [{ name: 'Fasteners' }],
    manufacturer: 'Grip-Rite',
    category: 'fasteners',
    stock: 500,
  }];

const staticProducts = [...mockProducts, ...additionalProducts];

const enrichStaticProduct = (product) => ({
  ...product,
  stock: typeof product.stock === 'number' ? product.stock : null,
  source: product.source || 'catalog',
});

const staticCatalog = staticProducts.map(enrichStaticProduct);

const normaliseCategoryPath = (categoryPath, category) => {
  if (Array.isArray(categoryPath)) {
    return categoryPath;
  }

  if (typeof categoryPath === 'string' && categoryPath.trim().length > 0) {
    return categoryPath
      .split('>')
      .map(segment => segment.trim())
      .filter(Boolean)
      .map(name => ({ name }));
  }

  if (category) {
    return [{ name: category }];
  }

  return [];
};

const parseCategoryPathInput = (input) => {
  if (!input) return null;

  if (Array.isArray(input)) {
    const parsed = input
      .map(segment => {
        if (typeof segment === 'string') {
          const value = segment.trim();
          return value ? { name: value } : null;
        }
        if (segment && typeof segment === 'object' && segment.name) {
          return { name: String(segment.name).trim() };
        }
        return null;
      })
      .filter(Boolean);
    return parsed.length ? parsed : null;
  }

  if (typeof input === 'string') {
    const values = input
      .split('>')
      .map(segment => segment.trim())
      .filter(Boolean)
      .map(name => ({ name }));
    return values.length ? values : null;
  }

  return null;
};

const mapDbProduct = (productInstance) => {
  const product = productInstance.get({ plain: true });
  const categoryPath = normaliseCategoryPath(product.categoryPath, product.category);
  const regularPrice = product.regularPrice ?? product.salePrice;

  return {
    sku: product.sku,
    name: product.name,
    salePrice: Number(product.salePrice),
    regularPrice: Number(regularPrice),
    image: product.image || '',
    shortDescription: product.shortDescription || product.description || '',
    longDescription: product.longDescription || product.description || '',
    categoryPath,
    manufacturer: product.manufacturer || 'Iligan Construction Supply',
    category: product.category
      || (categoryPath.slice(-1)[0]?.name?.toLowerCase().replace(/\s+/g, '-') ?? 'general'),
    stock: typeof product.stock === 'number' ? product.stock : 0,
    source: 'custom',
    id: product.id,
    metadata: product.metadata || {},
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

const buildCatalog = async () => {
  const [dbInstances, exclusionEntries] = await Promise.all([
    Product.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']],
    }),
    CatalogExclusion.findAll(),
  ]);

  const excludedSkus = new Set(
    exclusionEntries
      .map((entry) => entry.sku)
      .filter((sku) => typeof sku === 'string' && sku.trim().length > 0)
      .map((sku) => sku.trim())
  );

  const dbProducts = dbInstances
    .map(mapDbProduct)
    .filter((product) => !excludedSkus.has(product.sku));

  const catalogMap = new Map();

  staticCatalog.forEach((product) => {
    if (!excludedSkus.has(product.sku)) {
      catalogMap.set(product.sku, product);
    }
  });

  const dbProductMap = new Map();
  dbProducts.forEach((product) => {
    catalogMap.set(product.sku, product);
    dbProductMap.set(product.sku, product);
  });

  return {
    allProducts: Array.from(catalogMap.values()),
    dbProducts,
    dbProductMap,
    excludedSkus,
  };
};

// Get products from combined catalog (database + static fallback)
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

    const { allProducts } = await buildCatalog();
    let filteredProducts = [...allProducts];

    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter((product) => {
        const name = (product.name || '').toLowerCase();
        const shortDescription = (product.shortDescription || '').toLowerCase();
        const manufacturer = (product.manufacturer || '').toLowerCase();

        return (
          name.includes(searchLower) ||
          shortDescription.includes(searchLower) ||
          manufacturer.includes(searchLower)
        );
      });
    }
    if (category) {
      filteredProducts = filteredProducts.filter(product =>
        product.category === category
      );
    }

    const minPriceValue = Number(minPrice);
    const maxPriceValue = Number(maxPrice);
    filteredProducts = filteredProducts.filter(product => {
      const price = Number(product.salePrice);
      return price >= minPriceValue && price <= maxPriceValue;
    });

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

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(parseInt(limit, 10) || 20, 100);
    const startIndex = (pageNum - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    const totalPages = Math.ceil(filteredProducts.length / pageSize);

    res.json({
      products: paginatedProducts,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalProducts: filteredProducts.length,
        hasMore: pageNum < totalPages
      }
    });
  } catch (error) {
    console.error('Products API error:', error);
    res.status(500).json({
      message: 'Error fetching products',
      error: 'Service unavailable'
    });
  }
});

// Get product categories
router.get('/categories/list', async (req, res) => {
  try {
    const baseCategories = [
      { id: 'tools', name: 'Tools', description: 'Power tools, hand tools, and equipment' },
      { id: 'hardware', name: 'Hardware', description: 'Nuts, bolts, fasteners, and fittings' },
      { id: 'electrical', name: 'Electrical', description: 'Wiring, outlets, and electrical components' },
      { id: 'plumbing', name: 'Plumbing', description: 'Pipes, fittings, and plumbing supplies' },
      { id: 'safety', name: 'Safety Equipment', description: 'Protective gear and safety equipment' },
      { id: 'materials', name: 'Building Materials', description: 'Lumber, concrete, and building supplies' }
    ];

    const { dbProducts } = await buildCatalog();
    const dynamicCategories = new Map();

    dbProducts.forEach(product => {
      if (product.category) {
        const id = product.category;
        if (!dynamicCategories.has(id) && !baseCategories.some(base => base.id === id)) {
          dynamicCategories.set(id, {
            id,
            name: product.category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            description: 'Custom inventory category'
          });
        }
      }
    });

    res.json({
      categories: [
        ...baseCategories,
        ...Array.from(dynamicCategories.values())
      ]
    });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Admin: import product details from dataset or external URL
router.post('/import', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { sourceUrl, dataset, datasetProductId } = req.body || {};

    const trimmedSourceUrl =
      typeof sourceUrl === 'string' && sourceUrl.trim().length > 0
        ? sourceUrl.trim()
        : null;
    const trimmedDataset =
      typeof dataset === 'string' && dataset.trim().length > 0 ? dataset.trim() : null;

    if (!trimmedSourceUrl && !trimmedDataset) {
      return res
        .status(400)
        .json({ message: 'Provide either a sourceUrl or a dataset to import from.' });
    }

    if (trimmedSourceUrl && trimmedDataset) {
      return res
        .status(400)
        .json({ message: 'Choose either dataset import or URL import, not both.' });
    }

    let payload;
    if (trimmedDataset) {
      payload = await fetchDemoDatasetProduct(trimmedDataset, datasetProductId);
    } else {
      payload = await fetchExternalProduct(trimmedSourceUrl);
    }

    if (!payload || !payload.product) {
      return res
        .status(502)
        .json({ message: 'The import service returned an unexpected response.' });
    }

    return res.json({
      product: payload.product,
      meta: payload.raw || null,
    });
  } catch (error) {
    console.error('Import product error:', error);
    const candidateStatus =
      error?.status ||
      error?.statusCode ||
      error?.response?.status ||
      error?.cause?.status;
    const status =
      typeof candidateStatus === 'number' && candidateStatus >= 400 && candidateStatus < 600
        ? candidateStatus
        : 500;

    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to import product details. Please try again.';

    return res.status(status).json({
      message: status === 500 ? 'Failed to import product details.' : message,
      ...(status !== 500 && message ? { details: message } : {}),
    });
  }
});

// Admin: create product
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      sku,
      name,
      salePrice,
      regularPrice,
      image,
      shortDescription,
      longDescription,
      description,
      category,
      categoryPath,
      manufacturer,
      stock,
      metadata,
      isActive
    } = req.body;

    if (!sku || !name || salePrice === undefined || salePrice === null) {
      return res.status(400).json({ message: 'sku, name, and salePrice are required' });
    }

    const normalizedSku = String(sku).trim();
    const numericSalePrice = Number(salePrice);

    if (!Number.isFinite(numericSalePrice) || numericSalePrice < 0) {
      return res.status(400).json({ message: 'salePrice must be a positive number' });
    }

    let numericRegularPrice = null;
    if (regularPrice !== undefined && regularPrice !== null) {
      numericRegularPrice = Number(regularPrice);
      if (!Number.isFinite(numericRegularPrice) || numericRegularPrice < 0) {
        return res.status(400).json({ message: 'regularPrice must be a positive number' });
      }
    }

    let initialStock = 0;
    if (stock !== undefined && stock !== null) {
      initialStock = Number(stock);
      if (!Number.isInteger(initialStock) || initialStock < 0) {
        return res.status(400).json({ message: 'stock must be a non-negative integer' });
      }
    }

    const categoryPathValue = parseCategoryPathInput(categoryPath);

    const product = await Product.create({
      sku: normalizedSku,
      name: String(name).trim(),
      salePrice: numericSalePrice,
      regularPrice: numericRegularPrice,
      image: image || null,
      shortDescription: shortDescription || null,
      longDescription: longDescription || null,
      description: description || null,
      category: category || null,
      categoryPath: categoryPathValue,
      manufacturer: manufacturer || null,
      stock: initialStock,
      metadata: metadata && typeof metadata === 'object' ? metadata : null,
      isActive: typeof isActive === 'boolean' ? isActive : true,
    });

    await CatalogExclusion.destroy({ where: { sku: normalizedSku } });

    res.status(201).json(mapDbProduct(product));
  } catch (error) {
    console.error('Create product error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'A product with this SKU already exists' });
    }
    res.status(500).json({ message: 'Failed to create product' });
  }
});

// Admin: update product
router.put('/:sku', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { sku } = req.params;
    const normalizedSku = String(sku).trim();
    const product = await Product.findOne({ where: { sku: normalizedSku } });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const {
      name,
      salePrice,
      regularPrice,
      image,
      shortDescription,
      longDescription,
      description,
      category,
      categoryPath,
      manufacturer,
      stock,
      metadata,
      isActive
    } = req.body;

    if (name !== undefined) {
      product.name = String(name).trim();
    }

    if (salePrice !== undefined) {
      const numericSalePrice = Number(salePrice);
      if (!Number.isFinite(numericSalePrice) || numericSalePrice < 0) {
        return res.status(400).json({ message: 'salePrice must be a positive number' });
      }
      product.salePrice = numericSalePrice;
    }

    if (regularPrice !== undefined) {
      if (regularPrice === null || regularPrice === '') {
        product.regularPrice = null;
      } else {
        const numericRegularPrice = Number(regularPrice);
        if (!Number.isFinite(numericRegularPrice) || numericRegularPrice < 0) {
          return res.status(400).json({ message: 'regularPrice must be a positive number' });
        }
        product.regularPrice = numericRegularPrice;
      }
    }

    if (image !== undefined) {
      product.image = image || null;
    }

    if (shortDescription !== undefined) {
      product.shortDescription = shortDescription || null;
    }

    if (longDescription !== undefined) {
      product.longDescription = longDescription || null;
    }

    if (description !== undefined) {
      product.description = description || null;
    }

    if (category !== undefined) {
      product.category = category || null;
    }

    if (categoryPath !== undefined) {
      product.categoryPath = parseCategoryPathInput(categoryPath);
    }

    if (manufacturer !== undefined) {
      product.manufacturer = manufacturer || null;
    }

    if (stock !== undefined) {
      const numericStock = Number(stock);
      if (!Number.isInteger(numericStock) || numericStock < 0) {
        return res.status(400).json({ message: 'stock must be a non-negative integer' });
      }
      product.stock = numericStock;
    }

    if (metadata !== undefined) {
      product.metadata = metadata && typeof metadata === 'object' ? metadata : null;
    }

    if (isActive !== undefined) {
      product.isActive = Boolean(isActive);
    }

    await product.save();

    if (product.isActive) {
      await CatalogExclusion.destroy({ where: { sku: normalizedSku } });
    } else {
      await CatalogExclusion.upsert({
        sku: normalizedSku,
        reason: 'Archived custom product',
      });
    }

    res.json(mapDbProduct(product));
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

// Admin: update stock only
router.patch('/:sku/stock', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { sku } = req.params;
    const { stock, delta } = req.body;

    const product = await Product.findOne({ where: { sku } });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let newStock;
    if (stock !== undefined) {
      newStock = Number(stock);
    } else if (delta !== undefined) {
      newStock = Number(product.stock) + Number(delta);
    } else {
      return res.status(400).json({ message: 'Provide either stock or delta value' });
    }

    if (!Number.isInteger(newStock) || newStock < 0) {
      return res.status(400).json({ message: 'Stock must resolve to a non-negative integer' });
    }

    product.stock = newStock;
    await product.save();

    res.json({
      sku: product.sku,
      stock: product.stock,
      updatedAt: product.updatedAt
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ message: 'Failed to update stock' });
  }
});

// Admin: archive product
router.delete('/:sku', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { sku } = req.params;
    const normalizedSku = String(sku).trim();
    const product = await Product.findOne({ where: { sku: normalizedSku } });

    if (product) {
      product.isActive = false;
      await product.save();
      await CatalogExclusion.upsert({
        sku: normalizedSku,
        reason: 'Archived custom product',
      });
      return res.json({ message: 'Product archived successfully' });
    }

    const staticProduct = staticCatalog.find(
      (item) => item.sku === normalizedSku
    );

    if (!staticProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await CatalogExclusion.upsert({
      sku: normalizedSku,
      reason: 'Archived static product',
    });

    res.json({ message: 'Product archived successfully' });
  } catch (error) {
    console.error('Archive product error:', error);
    res.status(500).json({ message: 'Failed to archive product' });
  }
});

// Get single product details
router.get('/:sku', async (req, res) => {
  try {
    const { sku } = req.params;
    const dbProduct = await Product.findOne({ where: { sku } });

    if (dbProduct && dbProduct.isActive) {
      return res.json(mapDbProduct(dbProduct));
    }

    const product = staticCatalog.find(p => p.sku === sku);

    if (product) {
      const detailedProduct = {
        ...product,
        features: [
          'Professional grade construction',
          'Durable materials',
          'Industry standard compliance',
          'Reliable performance'
        ],
        specifications: {
          Weight: 'Varies',
          Dimensions: 'Standard',
          Warranty: '1 Year',
          Origin: 'USA'
        },
        modelNumber: product.sku,
        condition: 'New',
        inStoreAvailability: true
      };

      return res.json(detailedProduct);
    }

    res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    console.error('Product details error:', error);
    res.status(500).json({
      message: 'Error fetching product details',
      error: 'Service unavailable'
    });
  }
});

module.exports = router;
