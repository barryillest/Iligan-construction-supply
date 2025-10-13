import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiRefreshCcw,
  FiPlus,
  FiEdit3,
  FiSave,
  FiImage,
  FiTag,
  FiCheckCircle,
  FiAlertTriangle
} from 'react-icons/fi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const HeaderRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
`;

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
  }

  span {
    font-size: 14px;
    color: var(--text-secondary);
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background: ${({ variant }) =>
    variant === 'primary' ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.08)'};
  color: ${({ variant }) => (variant === 'primary' ? '#ffffff' : 'var(--text-primary)')};
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SectionCard = styled.div`
  border-radius: 18px;
  border: 1px solid var(--border-color);
  background: var(--secondary-bg);
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
`;

const FormField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);

  input,
  textarea {
    width: 100%;
    border-radius: 10px;
    border: 1px solid var(--border-color);
    background: var(--primary-bg);
    color: var(--text-primary);
    font-size: 14px;
    padding: 12px 14px;
    transition: border 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--accent-color);
    }
  }

  textarea {
    resize: vertical;
    min-height: 110px;
  }
`;

const FileHint = styled.span`
  font-size: 12px;
  color: var(--text-muted);
`;

const SelectedFile = styled.span`
  font-size: 12px;
  color: var(--text-secondary);
`;

const ImagePreview = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin-top: 8px;
  background: var(--primary-bg);
`;

const SubmitRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ProductCard = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
  background: var(--primary-bg);
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;

  @media (min-width: 960px) {
    grid-template-columns: 200px minmax(0, 1fr);
  }
`;

const ProductThumbnail = styled.div`
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
  overflow: hidden;
  position: relative;
  aspect-ratio: 4 / 3;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PlaceholderImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 12px;
`;

const ProductDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ProductHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  h4 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  span {
    font-size: 14px;
    color: var(--text-secondary);
  }
`;

const ProductMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: var(--text-secondary);

  strong {
    color: var(--text-primary);
    font-weight: 600;
  }
`;

const ProductActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ variant }) =>
    variant === 'custom' ? 'rgba(0, 214, 143, 0.16)' : 'rgba(255, 255, 255, 0.08)'};
  color: ${({ variant }) =>
    variant === 'custom' ? 'var(--success-color)' : 'var(--text-secondary)'};
  border: 1px solid rgba(255, 255, 255, 0.04);
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 16px 0;
`;

const EmptyState = styled.div`
  border: 1px dashed var(--border-color);
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  color: var(--text-secondary);
`;

const ErrorBanner = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid rgba(237, 73, 86, 0.4);
  background: rgba(237, 73, 86, 0.12);
  color: rgba(255, 205, 207, 0.9);
  font-size: 14px;
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px 0;
  color: var(--text-secondary);
  font-size: 14px;
`;

const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;

const initialNewProduct = {
  sku: '',
  name: '',
  salePrice: '',
  regularPrice: '',
  stock: '',
  image: '',
  imageName: '',
  category: '',
  shortDescription: '',
  longDescription: ''
};

const initialEditValues = {
  salePrice: '',
  regularPrice: '',
  stock: '',
  image: '',
  imageName: '',
  shortDescription: '',
  longDescription: ''
};

const readFileAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

const formatCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '—';
  }

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(Number(value));
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState(() => ({ ...initialNewProduct }));
  const [editSku, setEditSku] = useState(null);
  const [editValues, setEditValues] = useState(() => ({ ...initialEditValues }));

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/api/products`, {
        params: { limit: 200 }
      });
      setProducts(response.data.products || []);
    } catch (err) {
      console.error('Failed to load products', err);
      setError(err.response?.data?.message || 'Unable to fetch product catalog.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const customProducts = useMemo(
    () => products.filter((product) => product.source === 'custom' || product.id),
    [products]
  );

  const catalogProducts = useMemo(
    () => products.filter((product) => !(product.source === 'custom' || product.id)),
    [products]
  );

  const handleNewProductImageSelect = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setNewProduct((prev) => ({
        ...prev,
        image: '',
        imageName: ''
      }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error('Image must be 3MB or smaller.');
      event.target.value = '';
      return;
    }

    try {
      const dataUrl = await readFileAsDataURL(file);
      setNewProduct((prev) => ({
        ...prev,
        image: typeof dataUrl === 'string' ? dataUrl : '',
        imageName: file.name
      }));
      event.target.value = '';
    } catch (err) {
      console.error('Failed to process image file', err);
      toast.error('Failed to read the selected image.');
      setNewProduct((prev) => ({
        ...prev,
        image: '',
        imageName: ''
      }));
      event.target.value = '';
    }
  };

  const handleEditImageSelect = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error('Image must be 3MB or smaller.');
      event.target.value = '';
      return;
    }

    try {
      const dataUrl = await readFileAsDataURL(file);
      setEditValues((prev) => ({
        ...prev,
        image: typeof dataUrl === 'string' ? dataUrl : prev.image,
        imageName: file.name
      }));
      event.target.value = '';
    } catch (err) {
      console.error('Failed to process image file', err);
      toast.error('Failed to read the selected image.');
      event.target.value = '';
    }
  };

  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const resetNewProduct = () => {
    setNewProduct({ ...initialNewProduct });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.sku.trim() || !newProduct.name.trim()) {
      toast.error('SKU and product name are required.');
      return;
    }

    const salePrice = parseFloat(newProduct.salePrice);
    if (Number.isNaN(salePrice) || salePrice < 0) {
      toast.error('Enter a valid sale price.');
      return;
    }

    const payload = {
      sku: newProduct.sku.trim(),
      name: newProduct.name.trim(),
      salePrice,
      regularPrice:
        newProduct.regularPrice === '' ? null : parseFloat(newProduct.regularPrice),
      stock: newProduct.stock === '' ? 0 : parseInt(newProduct.stock, 10),
      image: newProduct.image.trim() || null,
      category: newProduct.category.trim() || null,
      shortDescription: newProduct.shortDescription.trim() || null,
      longDescription: newProduct.longDescription.trim() || null
    };

    if (Number.isNaN(payload.regularPrice)) {
      payload.regularPrice = null;
    }

    if (Number.isNaN(payload.stock) || payload.stock < 0) {
      toast.error('Stock must be a non-negative integer.');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/products`, payload);
      toast.success('Product created successfully.');
      resetNewProduct();
      fetchProducts();
    } catch (err) {
      console.error('Failed to create product', err);
      toast.error(err.response?.data?.message || 'Failed to create product.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (product) => {
    setEditSku(product.sku);
    setEditValues({
      salePrice: product.salePrice ?? '',
      regularPrice: product.regularPrice ?? '',
      stock: product.stock ?? '',
      image: product.image ?? '',
      imageName: '',
      shortDescription: product.shortDescription ?? '',
      longDescription: product.longDescription ?? ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProduct = async (sku) => {
    const salePrice = parseFloat(editValues.salePrice);
    if (Number.isNaN(salePrice) || salePrice < 0) {
      toast.error('Enter a valid sale price.');
      return;
    }

    const regularPrice =
      editValues.regularPrice === '' ? null : parseFloat(editValues.regularPrice);
    if (regularPrice !== null && (Number.isNaN(regularPrice) || regularPrice < 0)) {
      toast.error('Enter a valid regular price.');
      return;
    }

    const stock =
      editValues.stock === '' ? 0 : parseInt(editValues.stock, 10);
    if (Number.isNaN(stock) || stock < 0) {
      toast.error('Stock must be a non-negative integer.');
      return;
    }

    const payload = {
      salePrice,
      regularPrice,
      stock,
      image: editValues.image?.trim() || null,
      shortDescription: editValues.shortDescription?.trim() || null,
      longDescription: editValues.longDescription?.trim() || null
    };

    setSubmitting(true);
    try {
      await axios.put(`${API_URL}/api/products/${encodeURIComponent(sku)}`, payload);
      toast.success('Product updated.');
      setEditSku(null);
      setEditValues({ ...initialEditValues });
      fetchProducts();
    } catch (err) {
      console.error('Failed to update product', err);
      toast.error(err.response?.data?.message || 'Failed to update product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <HeaderRow>
        <TitleGroup>
          <h2>Products & Stock</h2>
          <span>Publish new products, update prices, and keep inventory accurate.</span>
        </TitleGroup>
        <HeaderActions>
          <ActionButton onClick={fetchProducts} disabled={loading}>
            <FiRefreshCcw />
            Refresh
          </ActionButton>
        </HeaderActions>
      </HeaderRow>

      <SectionCard as="form" onSubmit={handleAddProduct}>
        <SectionTitle>Create a new product</SectionTitle>
        <FormGrid>
          <FormField>
            SKU
            <input
              name="sku"
              type="text"
              placeholder="e.g. REBAR001"
              value={newProduct.sku}
              onChange={handleNewProductChange}
              required
            />
          </FormField>
          <FormField>
            Product name
            <input
              name="name"
              type="text"
              placeholder="Product title"
              value={newProduct.name}
              onChange={handleNewProductChange}
              required
            />
          </FormField>
          <FormField>
            Sale price (PHP)
            <input
              name="salePrice"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={newProduct.salePrice}
              onChange={handleNewProductChange}
              required
            />
          </FormField>
          <FormField>
            Regular price (optional)
            <input
              name="regularPrice"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={newProduct.regularPrice}
              onChange={handleNewProductChange}
            />
          </FormField>
          <FormField>
            Stock on hand
            <input
              name="stock"
              type="number"
              min="0"
              placeholder="0"
              value={newProduct.stock}
              onChange={handleNewProductChange}
            />
          </FormField>
          <FormField>
            Category
            <input
              name="category"
              type="text"
              placeholder="e.g. tools"
              value={newProduct.category}
              onChange={handleNewProductChange}
            />
          </FormField>
          <FormField>
            Product image
            <input
              key={newProduct.imageName || 'new-product-image'}
              type="file"
              accept="image/*"
              onChange={handleNewProductImageSelect}
              disabled={submitting}
            />
            <FileHint>JPEG, PNG or WEBP up to 3MB.</FileHint>
            {newProduct.imageName && (
              <SelectedFile>Selected: {newProduct.imageName}</SelectedFile>
            )}
            {newProduct.image && (
              <ImagePreview src={newProduct.image} alt="Selected product preview" />
            )}
          </FormField>
        </FormGrid>
        <FormGrid>
          <FormField>
            Short description
            <textarea
              name="shortDescription"
              placeholder="Highlight what makes this product useful."
              value={newProduct.shortDescription}
              onChange={handleNewProductChange}
            />
          </FormField>
          <FormField>
            Long description
            <textarea
              name="longDescription"
              placeholder="Add detailed specifications, materials, or usage information."
              value={newProduct.longDescription}
              onChange={handleNewProductChange}
            />
          </FormField>
        </FormGrid>
        <SubmitRow>
          <ActionButton type="submit" variant="primary" disabled={submitting}>
            <FiPlus />
            Add product
          </ActionButton>
        </SubmitRow>
      </SectionCard>

      {error && (
        <ErrorBanner>
          <FiAlertTriangle size={18} />
          <span>{error}</span>
        </ErrorBanner>
      )}

      {loading ? (
        <LoadingState>Loading products...</LoadingState>
      ) : (
        <>
          <SectionCard>
            <SectionTitle>Custom products ({customProducts.length})</SectionTitle>
            {customProducts.length === 0 ? (
              <EmptyState>No custom products created yet.</EmptyState>
            ) : (
              <ProductList>
                {customProducts.map((product) => (
                  <ProductCard key={product.sku}>
                    <ProductThumbnail>
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <PlaceholderImage>
                          <FiImage size={24} />
                          No image
                        </PlaceholderImage>
                      )}
                    </ProductThumbnail>
                    <ProductDetails>
                      <ProductHeader>
                        <h4>{product.name}</h4>
                        <span>SKU: {product.sku}</span>
                        <ProductMeta>
                          <Pill variant="custom">
                            <FiCheckCircle />
                            Admin item
                          </Pill>
                          <span>
                            <strong>{formatCurrency(product.salePrice)}</strong> sale price
                          </span>
                          <span>
                            Regular:{' '}
                            {product.regularPrice ? formatCurrency(product.regularPrice) : '—'}
                          </span>
                          <span>
                            Stock: <strong>{product.stock ?? 0}</strong>
                          </span>
                        </ProductMeta>
                      </ProductHeader>

                      {product.shortDescription && (
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14 }}>
                          {product.shortDescription}
                        </p>
                      )}

                      <ProductActions>
                        {editSku === product.sku ? (
                          <>
                            <ActionButton
                              variant="primary"
                              disabled={submitting}
                              onClick={() => handleUpdateProduct(product.sku)}
                            >
                              <FiSave />
                              Save changes
                            </ActionButton>
                            <ActionButton
                              disabled={submitting}
                              onClick={() => {
                                setEditSku(null);
                                setEditValues({ ...initialEditValues });
                              }}
                            >
                              Cancel
                            </ActionButton>
                          </>
                        ) : (
                          <ActionButton onClick={() => openEdit(product)}>
                            <FiEdit3 />
                            Edit product
                          </ActionButton>
                        )}
                      </ProductActions>

                      {editSku === product.sku && (
                        <>
                          <Divider />
                          <FormGrid>
                            <FormField>
                              Sale price (PHP)
                              <input
                                type="number"
                                step="0.01"
                                name="salePrice"
                                value={editValues.salePrice}
                                onChange={handleEditChange}
                              />
                            </FormField>
                            <FormField>
                              Regular price
                              <input
                                type="number"
                                step="0.01"
                                name="regularPrice"
                                value={editValues.regularPrice}
                                onChange={handleEditChange}
                              />
                            </FormField>
                            <FormField>
                              Stock
                              <input
                                type="number"
                                min="0"
                                name="stock"
                                value={editValues.stock}
                            onChange={handleEditChange}
                          />
                        </FormField>
                        <FormField>
                              Product image
                              <input
                                key={`${product.sku}-${editValues.imageName || 'existing-image'}`}
                                type="file"
                                accept="image/*"
                                onChange={handleEditImageSelect}
                                disabled={submitting}
                              />
                              <FileHint>Upload a new image to replace the current one (max 3MB).</FileHint>
                              {editValues.imageName && (
                                <SelectedFile>Selected: {editValues.imageName}</SelectedFile>
                              )}
                              {editValues.image && (
                                <ImagePreview src={editValues.image} alt={`Preview of ${product.name}`} />
                              )}
                            </FormField>
                          </FormGrid>
                          <FormGrid>
                            <FormField>
                              Short description
                              <textarea
                                name="shortDescription"
                                value={editValues.shortDescription}
                                onChange={handleEditChange}
                              />
                            </FormField>
                            <FormField>
                              Long description
                              <textarea
                                name="longDescription"
                                value={editValues.longDescription}
                                onChange={handleEditChange}
                              />
                            </FormField>
                          </FormGrid>
                        </>
                      )}
                    </ProductDetails>
                  </ProductCard>
                ))}
              </ProductList>
            )}
          </SectionCard>

          <SectionCard>
            <SectionTitle>Catalog products ({catalogProducts.length})</SectionTitle>
            {catalogProducts.length === 0 ? (
              <EmptyState>No catalog products available.</EmptyState>
            ) : (
              <ProductList>
                {catalogProducts.map((product) => (
                  <ProductCard key={product.sku}>
                    <ProductThumbnail>
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <PlaceholderImage>
                          <FiImage size={24} />
                          No image
                        </PlaceholderImage>
                      )}
                    </ProductThumbnail>
                    <ProductDetails>
                      <ProductHeader>
                        <h4>{product.name}</h4>
                        <span>SKU: {product.sku}</span>
                        <ProductMeta>
                          <Pill>
                            <FiTag />
                            Catalog item
                          </Pill>
                          <span>
                            <strong>{formatCurrency(product.salePrice)}</strong> sale price
                          </span>
                          <span>
                            Regular:{' '}
                            {product.regularPrice ? formatCurrency(product.regularPrice) : '—'}
                          </span>
                          {product.stock !== null && product.stock !== undefined && (
                            <span>
                              Stock: <strong>{product.stock}</strong>
                            </span>
                          )}
                        </ProductMeta>
                      </ProductHeader>
                      {product.shortDescription && (
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14 }}>
                          {product.shortDescription}
                        </p>
                      )}
                    </ProductDetails>
                  </ProductCard>
                ))}
              </ProductList>
            )}
          </SectionCard>
        </>
      )}
    </PageContainer>
  );
};

export default AdminProducts;
