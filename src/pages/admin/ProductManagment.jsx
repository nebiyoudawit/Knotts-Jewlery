import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import ProductForm from '../../components/ProductForm';
import ProductCard from '../../components/ProductCard';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:5000/api/admin'; // Full API URL path

const ProductManagment = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    console.log('Token:', token); // Check for the token
    if (!token) {
      toast.error('You need to log in to access products');
      return null; // Return null if there's no token
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Attach token to headers
    };
  };

  const handleApiError = (error, defaultMessage) => {
    console.error('API Error:', error);
    const message = error.message || defaultMessage;
    toast.error(message);
    return message;
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/products`, {
        headers: getAuthHeaders()
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch products');
        } else {
          throw new Error('Failed to fetch products');
        }
      }

      const data = await response.json();
      
      setProducts(data || []);
      setIsLoading(false);  // Set loading to false when done fetching
    } catch (err) {
      setError(handleApiError(err, 'Failed to fetch products'));
      setIsLoading(false);  // Set loading to false even when there is an error
    }
  };

  useEffect(() => {
    fetchProducts();  // Fetch products when component mounts
  }, []); // Runs on initial load

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setProducts(products.filter(p => p._id !== id));
      toast.success('Product deleted successfully');
    } catch (err) {
      handleApiError(err, 'Failed to delete product');
    }
  };

  const handleSave = async (productData) => {
    try {
      const isEdit = !!productData._id;
      const url = isEdit
        ? `${API_BASE_URL}/products/${productData._id}`
        : `${API_BASE_URL}/products`;

      const method = isEdit ? 'PUT' : 'POST';

      let body;
      let headers = getAuthHeaders();

      // Use FormData if there are image files
      if (productData.images instanceof FileList || productData.images?.[0] instanceof File) {
        body = new FormData();
        for (const key in productData) {
          if (key === 'images') {
            Array.from(productData.images).forEach(file => body.append('images', file));
          } else {
            // Always append, even if originalPrice is 0
            body.append(key, productData[key] ?? '');
          }
        }
        delete headers['Content-Type']; // Let browser set it for multipart/form-data
      } else {
        body = JSON.stringify(productData);
      }

      const response = await fetch(url, {
        method,
        headers,
        body
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to save product');
      }

      const result = await response.json();
      const savedProduct = result.product || result;

      if (isEdit) {
        setProducts(products.map(p => (p._id === savedProduct._id ? savedProduct : p)));
        toast.success('Product updated successfully');
      } else {
        setProducts([...products, savedProduct]);
        toast.success('Product added successfully');
      }

      setIsModalOpen(false);
    } catch (err) {
      handleApiError(err, 'Failed to save product');
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Products Management</h2>
        <button 
          onClick={() => { setCurrentProduct(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-[#05B171] text-white px-4 py-2 rounded hover:bg-[#048a5b] w-full md:w-auto justify-center"
        >
          <FiPlus /> Add Product
        </button>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading products...</div>
        ) : products.length > 0 ? (
          products.map(product => (
            <ProductCard 
              key={product._id} 
              product={product} 
              onEdit={handleEdit} 
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No products found. Add your first product.
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading products...</div>
        ) : products.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map(product => (
                <tr key={product._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.onSale ? `$${product.originalPrice?.toFixed(2) || ''}` : '-' }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${product.onSale ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {product.onSale ? 'On Sale' : 'Regular'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                    <button 
                      onClick={() => handleEdit(product)} 
                      className="text-blue-600 hover:text-blue-900 p-1"
                    >
                      <FiEdit2 />
                    </button>
                    <button 
                      onClick={() => handleDelete(product._id)} 
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No products found. Add your first product.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">{currentProduct ? 'Edit Product' : 'Add New Product'}</h3>
            <ProductForm 
              product={currentProduct} 
              onSave={handleSave} 
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagment;
