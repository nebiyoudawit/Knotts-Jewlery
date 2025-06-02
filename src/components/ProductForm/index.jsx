import React, { useState, useEffect } from "react";
import { FiImage, FiX } from "react-icons/fi";
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
            disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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

        <div className="flex items-center">
          <input
            type="checkbox"
            name="onSale"
            checked={formData.onSale}
            onChange={handleChange}
            className="h-4 w-4 text-[#05B171] focus:ring-[#05B171] border-gray-300 rounded"
            disabled={isSubmitting}
          />
          <label className="ml-2 block text-sm text-gray-700">Put on sale</label>
        </div>

        {formData.onSale && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Original Price ($)</label>
            <input
              type="number"
              name="originalPrice"
              value={formData.originalPrice || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              min="0"
              step="0.01"
              required
              disabled={isSubmitting}
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
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Product Images (Max 4)</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index}`}
                  className="h-20 w-20 object-cover rounded border border-gray-200"
                />
                {!isSubmitting && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX size={12} />
                  </button>
                )}
              </div>
            ))}
            {imagePreviews.length < 4 && !isSubmitting && (
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
                    disabled={isSubmitting}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#05B171] text-white rounded-md hover:bg-[#048a5b] flex items-center justify-center min-w-20"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ClipLoader color="#ffffff" size={20} />
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProductForm;