import React, { useState } from 'react';
import { FiImage, FiX } from 'react-icons/fi';
const ProductForm = ({ product, onSave, onCancel }) => {
    const [formData, setFormData] = useState(product || {
      name: '',
      price: '',
      originalPrice: '',
      stock: '',
      category: '',
      onSale: false,
      images: [],
      description: ''
    });
  
    const [imagePreviews, setImagePreviews] = useState([]);
  
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    };
  
    const handleImageUpload = (e) => {
      const files = e.target.files;
      if (files.length + formData.images.length > 4) {
        alert('You can upload a maximum of 4 images');
        return;
      }
  
      const newImages = [];
      const newPreviews = [];
  
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          if (newPreviews.length === files.length) {
            setImagePreviews([...imagePreviews, ...newPreviews]);
            setFormData({
              ...formData,
              images: [...formData.images, ...newImages]
            });
          }
        };
        reader.readAsDataURL(file);
        newImages.push(file);
      });
    };
  
    const handleRemoveImage = (index) => {
      const newImages = [...formData.images];
      newImages.splice(index, 1);
      
      const newPreviews = [...imagePreviews];
      newPreviews.splice(index, 1);
      
      setFormData({
        ...formData,
        images: newImages
      });
      setImagePreviews(newPreviews);
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      // If onSale is false, remove originalPrice
      const dataToSave = formData.onSale 
        ? formData 
        : { ...formData, originalPrice: undefined };
      onSave(dataToSave);
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Price ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                required
                min="0"
                step="0.01"
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
                min="0"
              />
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
                <option value="Bracelets">Bracelets</option>
                <option value="Charms">Charms</option>
                <option value="Necklaces">Necklaces</option>
                <option value="Rings">Rings</option>
                <option value="Earrings">Earrings</option>
              </select>
            </div>
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
          
          {formData.onSale && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Original Price ($)</label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                min="0"
                step="0.01"
                required={formData.onSale}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              rows="3"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Images (Max 4)</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={preview} 
                    alt={`Product preview ${index + 1}`}
                    className="h-20 w-20 object-cover rounded border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}
              {formData.images.length < 4 && (
                <div className="relative">
                  <label className="flex flex-col items-center justify-center h-20 w-20 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-gray-400">
                    <FiImage className="text-gray-400" size={24} />
                    <span className="text-xs text-gray-500">Add Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={formData.images.length >= 4}
                    />
                  </label>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {4 - formData.images.length} remaining
                  </span>
                </div>
              )}
            </div>
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
  export default ProductForm;