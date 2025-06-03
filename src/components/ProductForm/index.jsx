import React, { useState, useEffect } from "react";
import { FiImage, FiX, FiUpload, FiDollarSign, FiTag, FiPackage, FiList, FiEdit2 } from "react-icons/fi";
import axios from "axios";
import { ClipLoader } from "react-spinners";

const API_BASE = import.meta.env.VITE_API_URL;
const BASE_URL = API_BASE.replace("/api", "");

const ProductForm = ({ product, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    originalPrice: "",
    stock: "",
    category: "",
    onSale: false,
    images: [],
    existingImages: [],
    description: "",
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        images: [],
        existingImages: product.images || [],
      });

      setImagePreviews(
        (product.images || []).map((img) =>
          img.startsWith("http") ? img : `${BASE_URL}${img}`
        )
      );
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const total = formData.images.length + formData.existingImages.length + files.length;

    if (total > 4) {
      alert("You can upload up to 4 images.");
      return;
    }

    const newFiles = [];
    const newPreviews = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) {
          setImagePreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
      newFiles.push(file);
    });

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newFiles],
    }));

    e.target.value = "";
  };

  const handleRemoveImage = (index) => {
    if (index < formData.existingImages.length) {
      const updatedExisting = [...formData.existingImages];
      updatedExisting.splice(index, 1);
      setFormData((prev) => ({
        ...prev,
        existingImages: updatedExisting,
      }));
    } else {
      const fileIndex = index - formData.existingImages.length;
      const updatedFiles = [...formData.images];
      updatedFiles.splice(fileIndex, 1);
      setFormData((prev) => ({
        ...prev,
        images: updatedFiles,
      }));
    }

    const updatedPreviews = [...imagePreviews];
    updatedPreviews.splice(index, 1);
    setImagePreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You have to login first");
      setIsSubmitting(false);
      return;
    }

    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("price", formData.price);
      form.append("stock", formData.stock);
      form.append("category", formData.category);
      form.append("onSale", formData.onSale);
      form.append("description", formData.description);

      if (formData.onSale) {
        form.append("originalPrice", formData.originalPrice);
      }

      formData.images.forEach((img) => form.append("images", img));
      
      if (formData.existingImages.length > 0) {
        if (formData.existingImages.length === 1) {
          form.append("existingImages", formData.existingImages[0]);
        } else {
          formData.existingImages.forEach((img, index) => {
            form.append(`existingImages[${index}]`, img);
          });
        }
      }

      const response = product
        ? await axios.put(`${API_BASE}/admin/products/${product._id}`, form, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          })
        : await axios.post(`${API_BASE}/admin/products`, form, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          });

      if (response.data.success) {
        onSuccess(response.data.product);
      } else {
        throw new Error(response.data.message || 'Operation failed');
      }
    } catch (err) {
      alert("Failed to save product: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-2 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {product ? "Update your product details" : "Fill in the details for your new product"}
          </p>
        </div>

        {/* Product Name */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
            <FiEdit2 className="mr-2 text-gray-500" size={16} />
            Product Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            placeholder="e.g. Diamond Necklace"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Price, Stock, Category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FiDollarSign className="mr-2 text-gray-500" size={16} />
              Current Price ($)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              required
              min="0"
              step="0.01"
              disabled={isSubmitting}
            />
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FiPackage className="mr-2 text-gray-500" size={16} />
              Stock Quantity
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              required
              min="0"
              disabled={isSubmitting}
            />
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FiTag className="mr-2 text-gray-500" size={16} />
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none bg-white"
              required
              disabled={isSubmitting}
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

        {/* Sale Toggle */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="onSale"
                checked={formData.onSale}
                onChange={handleChange}
                className="sr-only peer"
                disabled={isSubmitting}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">Put on sale</span>
            </label>
          </div>

          {formData.onSale && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Price ($)
              </label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice || ""}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                min="0"
                step="0.01"
                required
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
            <FiList className="mr-2 text-gray-500" size={16} />
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            rows="4"
            placeholder="Describe your product in detail..."
            disabled={isSubmitting}
          />
        </div>

        {/* Images */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
            <FiImage className="mr-2 text-gray-500" size={16} />
            Product Images (Max 4)
          </label>
          <div className="mt-3">
            <div className="flex flex-wrap gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <div className="h-28 w-28 rounded-lg overflow-hidden border border-gray-200 hover:border-emerald-400 transition-all duration-200">
                    <img
                      src={preview}
                      alt={`Preview ${index}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {!isSubmitting && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                    >
                      <FiX size={12} />
                    </button>
                  )}
                </div>
              ))}
              
              {imagePreviews.length < 4 && !isSubmitting && (
                <label className="flex flex-col items-center justify-center h-28 w-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200">
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <FiUpload className="text-gray-400 mb-1" size={20} />
                    <span className="text-xs text-gray-500">Upload Image</span>
                    <span className="text-xs text-gray-400 mt-1">(Max 4)</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </label>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Recommended size: 800x800 pixels. JPG, PNG format.
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium text-gray-700 flex items-center"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-medium flex items-center justify-center min-w-28"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <ClipLoader color="#ffffff" size={18} className="mr-2" />
                Processing...
              </>
            ) : (
              <>
                <FiEdit2 className="mr-2" size={16} />
                {product ? "Update" : "Create"} Product
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProductForm;