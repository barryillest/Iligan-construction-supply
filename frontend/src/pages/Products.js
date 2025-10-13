import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiSearch, FiGrid, FiList, FiShoppingCart, FiEdit3, FiTrash2, FiArrowRight } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCart, resolveCartProductId } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const ProductsContainer = styled.div`
  padding: 40px 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-primary);
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 16px;
`;

const FiltersBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  margin-bottom: 32px;
  padding: 20px;
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--primary-bg);
  color: var(--text-primary);
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
  }

  &::placeholder {
    color: var(--text-muted);
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--primary-bg);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
  }
`;

const ViewToggle = styled.div`
  display: flex;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
`;

const ViewButton = styled.button`
  padding: 8px 12px;
  border: none;
  background: ${props => props.active ? 'var(--accent-color)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? 'var(--accent-color)' : 'var(--secondary-bg)'};
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: ${props =>
    props.view === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr'
  };
  gap: 24px;
  margin-bottom: 40px;
`;

const ProductCard = styled(motion(Link))`
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.3s ease;
  display: ${props => props.view === 'list' ? 'flex' : 'block'};
  gap: ${props => props.view === 'list' ? '20px' : '0'};

  &:hover {
    border-color: var(--accent-color);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }
`;

const ProductImage = styled.img`
  width: ${props => props.view === 'list' ? '120px' : '100%'};
  height: ${props => props.view === 'list' ? '120px' : '200px'};
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: ${props => props.view === 'list' ? '0' : '16px'};
  background: var(--tertiary-bg);
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductPrice = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: var(--accent-color);
  margin-bottom: 12px;
`;

const ProductDescription = styled.p`
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const AddToCartButton = styled.button`
  flex: 1;
  padding: 12px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: var(--accent-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ProductActions = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`;

const BuyNowButton = styled(AddToCartButton)`
  background: var(--success-color, #28a745);

  &:hover {
    background: var(--success-hover, #218838);
  }
`;

const AdminActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  width: 100%;
`;

const AdminActionButton = styled.button`
  flex: 1;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid ${({ danger }) => (danger ? 'rgba(237, 73, 86, 0.4)' : 'var(--border-color)')};
  background: ${({ danger }) => (danger ? 'rgba(237, 73, 86, 0.15)' : 'rgba(255, 255, 255, 0.05)')};
  color: ${({ danger }) => (danger ? 'rgba(255, 205, 207, 0.9)' : 'var(--text-primary)')};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ danger }) => (danger ? 'rgba(237, 73, 86, 0.25)' : 'rgba(255, 255, 255, 0.12)')};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px;
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadMoreButton = styled.button`
  display: block;
  margin: 0 auto;
  padding: 16px 32px;
  background: var(--secondary-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--tertiary-bg);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [categories, setCategories] = useState([]);

  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [processingSku, setProcessingSku] = useState(null);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/categories/list`);
        if (isMounted) {
          setCategories(response.data.categories || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setPage(1);
    setProducts([]);
    setHasMore(true);
  }, [search, category, sortBy]);

  useEffect(() => {
    let isCancelled = false;

    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products`, {
          params: {
            search,
            category,
            sort: sortBy,
            page,
            limit: 20
          }
        });

        if (isCancelled) {
          return;
        }

        const newProducts = response.data.products || [];
        const pagination = response.data.pagination || {};

        setProducts(prev => (page === 1 ? newProducts : [...prev, ...newProducts]));
        setHasMore(pagination.hasMore || false);
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching products:', error);
          toast.error('Failed to load products');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isCancelled = true;
    };
  }, [search, category, sortBy, page]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    await addToCart(product);
  };

  const handleBuyNow = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please sign in to purchase');
      return;
    }

    const productId = resolveCartProductId(product);
    const success = await addToCart(product);
    if (success) {
      if (productId) {
        navigate('/checkout', { state: { selectedProductIds: [productId] } });
      } else {
        navigate('/checkout');
      }
    }
  };

  const handleAdminEdit = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/admin/products', { state: { focusSku: product.sku } });
  };

  const handleAdminDelete = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(`Delete ${product.name}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setProcessingSku(product.sku);
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/${encodeURIComponent(product.sku)}`);
      toast.success('Product removed.');
      setProducts(prev => prev.filter(item => item.sku !== product.sku));
    } catch (error) {
      console.error('Failed to delete product', error);
      toast.error(error.response?.data?.message || 'Failed to delete product.');
    } finally {
      setProcessingSku(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  return (
    <ProductsContainer>
      <Header>
        <Title>Construction Products</Title>
        <Subtitle>Browse our extensive catalog of construction tools and materials</Subtitle>
      </Header>

      <FiltersBar>
        <SearchBox>
          <SearchIcon size={16} />
          <SearchInput
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SearchBox>

        <FilterSelect
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Name</option>
          <option value="salePrice">Price: Low to High</option>
          <option value="salePrice.dsc">Price: High to Low</option>
        </FilterSelect>

        <ViewToggle>
          <ViewButton
            active={view === 'grid'}
            onClick={() => setView('grid')}
          >
            <FiGrid size={16} />
          </ViewButton>
          <ViewButton
            active={view === 'list'}
            onClick={() => setView('list')}
          >
            <FiList size={16} />
          </ViewButton>
        </ViewToggle>
      </FiltersBar>

      <ProductsGrid view={view}>
        {products.map((product, index) => (
          <ProductCard
            key={`${product.sku}-${index}`}
            to={`/products/${product.sku}`}
            view={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <ProductImage
              src={product.image || '/placeholder-image.jpg'}
              alt={product.name}
              view={view}
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg';
              }}
            />
            <ProductInfo>
              <ProductName>{product.name}</ProductName>
              <ProductPrice>{formatPrice(product.salePrice)}</ProductPrice>
              {view === 'list' && product.shortDescription && (
                <ProductDescription>{product.shortDescription}</ProductDescription>
              )}
              {isAdmin ? (
                <AdminActions>
                  <AdminActionButton onClick={(e) => handleAdminEdit(e, product)}>
                    <FiEdit3 size={16} />
                    Edit
                  </AdminActionButton>
                  <AdminActionButton
                    danger
                    onClick={(e) => handleAdminDelete(e, product)}
                    disabled={processingSku === product.sku}
                  >
                    <FiTrash2 size={16} />
                    {processingSku === product.sku ? 'Removing...' : 'Delete'}
                  </AdminActionButton>
                </AdminActions>
              ) : (
                <ProductActions>
                  <AddToCartButton
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={!isAuthenticated}
                  >
                    <FiShoppingCart size={16} />
                    Add to Cart
                  </AddToCartButton>
                  <BuyNowButton
                    onClick={(e) => handleBuyNow(e, product)}
                    disabled={!isAuthenticated}
                  >
                    <FiArrowRight size={16} />
                    Buy Now
                  </BuyNowButton>
                </ProductActions>
              )}
            </ProductInfo>
          </ProductCard>
        ))}
      </ProductsGrid>

      {loading && (
        <LoadingSpinner>
          <Spinner />
        </LoadingSpinner>
      )}

      {hasMore && !loading && products.length > 0 && (
        <LoadMoreButton
          onClick={handleLoadMore}
          disabled={loading}
        >
          Load More Products
        </LoadMoreButton>
      )}

      {!loading && products.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          No products found. Try adjusting your search or filters.
        </div>
      )}
    </ProductsContainer>
  );
};

export default Products;
