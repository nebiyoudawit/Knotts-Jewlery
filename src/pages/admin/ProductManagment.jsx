// src/components/admin/ProductsManager.jsx
import { useState } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiChevronDown, FiChevronUp, FiX, FiImage } from 'react-icons/fi';
import ProductForm from '../../components/ProductForm';
import ProductCard from '../../components/ProductCard';

const ProductManagment = () => {
  const [products, setProducts] = useState([
    { 
      id: 1, 
      name: "Silk Thread Bracelet", 
      price: 49.99, 
      originalPrice: 69.99, 
      stock: 15, 
      category: "Bracelets", 
      onSale: true,
      images: ["/bead.jpg"],
      description: "Handwoven silk thread bracelet with sterling silver accents."
    },
    { 
      id: 2, 
      name: "Leather Wrap Bracelet", 
      price: 39.99, 
      stock: 8, 
      category: "Bracelets", 
      onSale: false,
      images: ["/bead.jpg"],
      description: "Genuine leather wrap bracelet with adjustable fit."
    },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleSave = (product) => {
    if (product.id) {
      setProducts(products.map(p => p.id === product.id ? product : p));
    } else {
      setProducts([...products, { ...product, id: Date.now() }]);
    }
    setIsModalOpen(false);
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
        {products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onEdit={handleEdit} 
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
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
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">${product.price}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.onSale ? `$${product.originalPrice}` : '-'}
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
                    onClick={() => handleDelete(product.id)} 
                    className="text-red-600 hover:text-red-900 p-1"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Form Modal */}
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