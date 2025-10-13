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
    category: 'hardware'
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

// Get all products
router.get('/', async (req, res) => {
  try {
    // If using BestBuy API (uncomment and configure if needed)
    /*
    if (BESTBUY_API_KEY) {
      const response = await axios.get(`${BESTBUY_BASE_URL}/products(categoryPath.id=abcat0500000)?format=json&apiKey=${BESTBUY_API_KEY}`);
      return res.json(response.data.products);
    }
    */
    
    // Return mock products
    res.json(mockProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
});

// Get product by SKU
router.get('/:sku', async (req, res) => {
  try {
    const { sku } = req.params;
    const product = mockProducts.find(p => p.sku === sku);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Failed to fetch product', error: error.message });
  }
});

// Search products
router.get('/search', (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const searchTerm = q.toLowerCase();
    const results = mockProducts.filter(
      product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.shortDescription.toLowerCase().includes(searchTerm) ||
        product.longDescription.toLowerCase().includes(searchTerm) ||
        product.manufacturer.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );
    
    res.json(results);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Failed to search products', error: error.message });
  }
});

module.exports = router;
