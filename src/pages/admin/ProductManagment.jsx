// src/components/admin/ProductsManager.jsx
import { useState } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiTag, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const ProductManagment = () => {
  const [products, setProducts] = useState([
    { id: 1, name: 'Silver Bracelet', price: 450, stock: 15, category: 'Jewelry', onSale: false },
    { id: 2, name: 'Handwoven Basket', price: 1200, stock: 8, category: 'Home', onSale: true },
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
                <td className="px-6 py-4 whitespace-nowrap">{product.price} birr</td>
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
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

const ProductCard = ({ product, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">{product.name}</h3>
          <p className="text-sm text-gray-600">{product.price} birr</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(product)} 
            className="text-blue-600 hover:text-blue-900 p-1"
          >
            <FiEdit2 />
          </button>
          <button 
            onClick={() => onDelete(product.id)} 
            className="text-red-600 hover:text-red-900 p-1"
          >
            <FiTrash2 />
          </button>
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="text-gray-600 hover:text-gray-900 p-1"
          >
            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Stock:</span>
            <span className="text-sm">{product.stock}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Category:</span>
            <span className="text-sm">{product.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs ${product.onSale ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {product.onSale ? 'On Sale' : 'Regular'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState(product || {
    name: '',
    price: '',
    stock: '',
    category: '',
    onSale: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Price (birr)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          >
            <option value="">Select category</option>
            <option value="Jewelry">Jewelry</option>
            <option value="Home">Home Decor</option>
            <option value="Clothing">Clothing</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            name="onSale"
            checked={formData.onSale}
            onChange={handleChange}
            className="h-4 w-4 text-[#05B171] focus:ring-[#05B171] border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">Put on sale</label>
        </div>
        
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#05B171] text-white rounded-md hover:bg-[#048a5b] mb-2 sm:mb-0"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProductManagment;