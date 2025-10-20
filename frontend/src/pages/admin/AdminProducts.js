import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
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
  FiAlertTriangle,
  FiLink,
  FiLoader
} from 'react-icons/fi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const DEMO_DATASETS = [
  { value: 'dummyjson', label: 'BestBuy Demo Catalog' },
  { value: 'fakestore', label: 'HarborMart Outfitters' },
];

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

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const ImportSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  border-radius: 14px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
`;

const ImportHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
  }

  span {
    font-size: 13px;
    color: var(--text-muted);
  }
`;

const ImportControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const ImportInput = styled.input`
  flex: 1 1 280px;
  min-width: 220px;
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
`;

const ImportButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background: var(--accent-color);
  color: #ffffff;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoaderIcon = styled(FiLoader)`
  animation: ${spin} 1s linear infinite;
`;

const ImportHint = styled.span`
  font-size: 12px;
  color: var(--text-muted);
`;

const ImportModeSwitch = styled.div`
  display: inline-flex;
  padding: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  gap: 4px;
  align-self: flex-start;
`;

const ImportModeButton = styled.button`
  border: none;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $active }) => ($active ? 'var(--accent-color)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#0f0f0f' : 'var(--text-secondary)')};

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const DatasetSelect = styled.select`
  flex: 1 1 220px;
  min-width: 200px;
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
`;

const ImportPreview = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.4);
`;

const ImportPreviewImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 12px;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const ImportPreviewFallback = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  border: 1px dashed rgba(255, 255, 255, 0.16);
  color: var(--text-muted);
`;

const ImportPreviewBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;

  h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 13px;
    color: var(--text-secondary);
  }
`;

const ImportPreviewMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: var(--text-muted);
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
  longDescription: '',
  sourceUrl: '',
  metadata: null
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
  const [importMode, setImportMode] = useState('url');
  const [importUrl, setImportUrl] = useState('');
  const [importDataset, setImportDataset] = useState(DEMO_DATASETS[0].value);
  const [importDatasetId, setImportDatasetId] = useState('random');
  const [importPreview, setImportPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [editSku, setEditSku] = useState(null);
  const [editValues, setEditValues] = useState(() => ({ ...initialEditValues }));

  useEffect(() => {
    if (importMode === 'dataset' && !importDatasetId) {
      setImportDatasetId('random');
    }
  }, [importMode, importDatasetId]);

  useEffect(() => {
    if (importMode === 'dataset') {
      setImportDatasetId('random');
    }
  }, [importDataset, importMode]);

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
    setImportMode('url');
    setImportUrl('');
    setImportDataset(DEMO_DATASETS[0].value);
    setImportDatasetId('random');
    setImportPreview(null);
  };

  const handleImportModeChange = (mode) => {
    const nextMode = mode === 'dataset' ? 'dataset' : 'url';
    if (nextMode === importMode) {
      return;
    }
    setImportMode(nextMode);
    setImportPreview(null);
    if (nextMode === 'dataset') {
      setImportDatasetId('random');
    }
    if (nextMode === 'url') {
      setImportUrl('');
    }
  };

  const prettifyLabel = (value) =>
    typeof value === 'string'
      ? value
          .split(/[\s_-]+/)
          .filter(Boolean)
          .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
          .join(' ')
      : '';

  const handleImportProduct = async (event) => {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }

    const isDatasetMode = importMode === 'dataset';
    let trimmedUrl = '';

    if (isDatasetMode) {
      // Nothing required here; dataset imports can use "random" when blank.
    } else {
      trimmedUrl = importUrl.trim();

      if (!trimmedUrl) {
        toast.error('Enter a product URL to import.');
        return;
      }

      try {
        // Basic validation to provide immediate feedback
        // eslint-disable-next-line no-new
        new URL(trimmedUrl);
      } catch (_err) {
        toast.error('Please enter a valid URL starting with http or https.');
        return;
      }
    }

    setImporting(true);
    setImportPreview(null);

    try {
      let response;
      if (isDatasetMode) {
        const datasetReference = (importDatasetId || '').trim() || 'random';
        response = await axios.post(`${API_URL}/api/products/import`, {
          dataset: importDataset,
          datasetProductId: datasetReference,
        });
      } else {
        response = await axios.post(`${API_URL}/api/products/import`, {
          sourceUrl: trimmedUrl,
        });
      }

      const payload = response.data?.product;

      if (!payload || !payload.name) {
        throw new Error('The import service did not return product details.');
      }

      const displayPrice = (() => {
        if (payload.salePrice !== null && payload.salePrice !== undefined) {
          try {
            if (payload.currency) {
              return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: payload.currency,
              }).format(Number(payload.salePrice));
            }
            return Number(payload.salePrice).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          } catch (error) {
            console.warn('Currency formatting failed, falling back to raw value.', error);
            return payload.salePrice;
          }
        }
        return payload.priceText || 'Price unavailable';
      })();

      setImportPreview({
        ...payload,
        displayPrice,
      });

      setNewProduct((prev) => {
        const existingMeta =
          prev.metadata && typeof prev.metadata === 'object' ? { ...prev.metadata } : {};
        const importedMeta =
          payload.metadata && typeof payload.metadata === 'object'
            ? { ...payload.metadata }
            : {};

        const mergedMetadata = {
          ...existingMeta,
          ...importedMeta,
        };

        const sourceValue = payload.sourceUrl || trimmedUrl || mergedMetadata.sourceUrl || '';
        if (sourceValue) {
          mergedMetadata.sourceUrl = sourceValue;
        }

        Object.keys(mergedMetadata).forEach((key) => {
          if (
            mergedMetadata[key] === undefined ||
            mergedMetadata[key] === null ||
            mergedMetadata[key] === ''
          ) {
            delete mergedMetadata[key];
          }
        });

        return {
          ...prev,
          sku: payload.suggestedSku || prev.sku,
          name: payload.name || prev.name,
          salePrice:
            payload.salePrice !== null && payload.salePrice !== undefined
              ? String(payload.salePrice)
              : prev.salePrice,
          regularPrice:
            payload.regularPrice !== null && payload.regularPrice !== undefined
              ? String(payload.regularPrice)
              : prev.regularPrice,
          stock:
            payload.stock !== null && payload.stock !== undefined
              ? String(payload.stock)
              : prev.stock,
          image: payload.image || prev.image,
          imageName: payload.image ? '' : prev.imageName,
          category: payload.category || prev.category,
          shortDescription:
            payload.shortDescription || payload.description || prev.shortDescription,
          longDescription:
            payload.longDescription || payload.description || prev.longDescription,
          sourceUrl: sourceValue,
          metadata: Object.keys(mergedMetadata).length ? mergedMetadata : null,
        };
      });

      toast.success(
        isDatasetMode
          ? 'Demo catalog product imported. Review before publishing.'
          : 'Product details imported. Review before publishing.'
      );
    } catch (err) {
      console.error('Failed to import product', err);
      setImportPreview(null);
      toast.error(
        err.response?.data?.message ||
          (isDatasetMode
            ? 'Unable to import from the selected dataset. Try another ID or dataset.'
            : 'Unable to import product details. Check the URL or verify your scraping API configuration.')
      );
    } finally {
      setImporting(false);
    }
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

    const metadata = (() => {
      const base =
        newProduct.metadata && typeof newProduct.metadata === 'object'
          ? { ...newProduct.metadata }
          : {};

      if (newProduct.sourceUrl) {
        base.sourceUrl = newProduct.sourceUrl.trim();
      }

      Object.keys(base).forEach((key) => {
        if (
          base[key] === undefined ||
          base[key] === null ||
          base[key] === ''
        ) {
          delete base[key];
        }
      });

      return Object.keys(base).length ? base : null;
    })();

    if (metadata) {
      payload.metadata = metadata;
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
        <ImportSection>
          <ImportHeader>
            <strong>Mock from external catalog</strong>
            <span>
              {importMode === 'dataset'
                ? 'Select a free demo dataset and sample product to preview live data instantly.'
                : 'Paste a public product URL to fetch the title, image, price, and description.'}
            </span>
          </ImportHeader>
          <ImportModeSwitch>
            <ImportModeButton
              type="button"
              $active={importMode === 'url'}
              onClick={() => handleImportModeChange('url')}
              disabled={importing}
            >
              By URL
            </ImportModeButton>
            <ImportModeButton
              type="button"
              $active={importMode === 'dataset'}
              onClick={() => handleImportModeChange('dataset')}
              disabled={importing}
            >
              Free Datasets
            </ImportModeButton>
          </ImportModeSwitch>
          <ImportControls>
            {importMode === 'dataset' ? (
              <>
                <DatasetSelect
                  value={importDataset}
                  onChange={(event) => setImportDataset(event.target.value)}
                  disabled={importing || submitting}
                >
                  {DEMO_DATASETS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </DatasetSelect>
                <ImportInput
                  type="text"
                  name="importDatasetId"
                  placeholder={
                    importDataset === 'fakestore'
                      ? 'Product ID 1-20 or "random"'
                      : 'Product ID 1-100 or "random"'
                  }
                  value={importDatasetId}
                  onChange={(event) => setImportDatasetId(event.target.value)}
                  disabled={importing || submitting}
                />
              </>
            ) : (
              <ImportInput
                type="url"
                name="importUrl"
                placeholder="https://example.com/product-page"
                value={importUrl}
                onChange={(event) => setImportUrl(event.target.value)}
                disabled={importing || submitting}
              />
            )}
            <ImportButton
              type="button"
              onClick={handleImportProduct}
              disabled={
                importing || submitting || (importMode === 'url' && !importUrl.trim())
              }
            >
              {importing ? (
                <LoaderIcon size={16} />
              ) : (
                <FiLink size={16} />
              )}
              {importing ? 'Fetching...' : 'Fetch details'}
            </ImportButton>
            {importPreview && (
              <ActionButton
                type="button"
                onClick={() => {
                  setImportPreview(null);
                  setImportUrl('');
                  setImportDatasetId('random');
                }}
              >
                Clear
              </ActionButton>
            )}
          </ImportControls>
          <ImportHint>
            {importMode === 'dataset'
              ? 'Uses open demo catalogs (BestBuy Demo Catalog & HarborMart Outfitters). No API key required—try IDs like 1-100 or the keyword "random".'
              : 'Requires a configured scraping API key. Only import data you are permitted to test with.'}
          </ImportHint>
          {importPreview && (
            <ImportPreview>
              {importPreview.image ? (
                <ImportPreviewImage src={importPreview.image} alt={importPreview.name} />
              ) : (
                <ImportPreviewFallback>
                  <FiImage size={32} />
                </ImportPreviewFallback>
              )}
              <ImportPreviewBody>
                <h4>{importPreview.name}</h4>
                <ImportPreviewMeta>
                  <strong>{importPreview.displayPrice}</strong>
                  {importPreview.currency && <span>Currency: {importPreview.currency}</span>}
                  {importPreview.metadata?.provider && (
                    <span>Provider: {prettifyLabel(importPreview.metadata.provider)}</span>
                  )}
                  {importPreview.metadata?.dataset && (
                    <span>Dataset: {prettifyLabel(importPreview.metadata.dataset)}</span>
                  )}
                  {importPreview.metadata?.brand && (
                    <span>Brand: {importPreview.metadata.brand}</span>
                  )}
                  {importPreview.stock !== undefined &&
                    importPreview.stock !== null && (
                      <span>Stock snapshot: {importPreview.stock}</span>
                    )}
                </ImportPreviewMeta>
                {importPreview.shortDescription && (
                  <p>{importPreview.shortDescription}</p>
                )}
                {importPreview.sourceUrl && (
                  <a
                    href={importPreview.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--accent-color)', fontSize: 12 }}
                  >
                    View source entry
                  </a>
                )}
              </ImportPreviewBody>
            </ImportPreview>
          )}
        </ImportSection>
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
            Source URL (optional)
            <input
              name="sourceUrl"
              type="url"
              placeholder="https://example.com/product"
              value={newProduct.sourceUrl}
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
                          {product.metadata?.provider && (
                            <span>
                              Imported via{' '}
                              <strong>{prettifyLabel(product.metadata.provider)}</strong>
                            </span>
                          )}
                          {product.metadata?.dataset && (
                            <span>
                              Dataset:{' '}
                              <strong>{prettifyLabel(product.metadata.dataset)}</strong>
                            </span>
                          )}
                          {product.metadata?.sourceUrl && (
                            <span>
                              <a
                                href={product.metadata.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--accent-color)' }}
                              >
                                View source
                              </a>
                            </span>
                          )}
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
                          {product.metadata?.provider && (
                            <span>
                              Imported via{' '}
                              <strong>{prettifyLabel(product.metadata.provider)}</strong>
                            </span>
                          )}
                          {product.metadata?.dataset && (
                            <span>
                              Dataset:{' '}
                              <strong>{prettifyLabel(product.metadata.dataset)}</strong>
                            </span>
                          )}
                          {product.metadata?.sourceUrl && (
                            <span>
                              <a
                                href={product.metadata.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--accent-color)' }}
                              >
                                View source
                              </a>
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
