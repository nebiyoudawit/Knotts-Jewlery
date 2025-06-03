import { useState, useEffect } from "react";
import { FiEdit2, FiTrash2, FiPlus, FiX, FiSearch } from "react-icons/fi";
import ProductForm from "../../components/ProductForm";
import ProductCard from "../../components/ProductCard";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/admin`;

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You need to log in to access products");
      return null;
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const handleApiError = (error, defaultMessage) => {
    console.error("API Error:", error);
    const message = error.message || defaultMessage;
    toast.error(message);
    return message;
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/products`, {
        headers: getAuthHeaders(),
      });

      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch products");
        } else {
          throw new Error("Failed to fetch products");
        }
      }

      const data = await response.json();
      setProducts(data || []);
      setFilteredProducts(data || []);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.map(product => product.category))];
      setCategories(['all', ...uniqueCategories]);
    } catch (err) {
      setError(handleApiError(err, "Failed to fetch products"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let results = products;
    
    if (searchTerm) {
      results = results.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== "all") {
      results = results.filter(product =>
        product.category === selectedCategory
      );
    }
    
    setFilteredProducts(results);
  }, [searchTerm, selectedCategory, products]);

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setProductToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/products/${productToDelete}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        const errorText = contentType?.includes("application/json")
          ? (await response.json()).message
          : await response.text();
        throw new Error(errorText || "Failed to delete product");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Operation failed");
      }

      setProducts((prevProducts) =>
        prevProducts.filter((p) => p._id !== productToDelete)
      );
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(error.message || "Failed to delete product");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    }
  };

  const handleSave = async (productData) => {
    setIsSaving(true);
    try {
      const isEdit = !!productData._id;
      const url = isEdit
        ? `${API_BASE_URL}/products/${productData._id}`
        : `${API_BASE_URL}/products`;

      const method = isEdit ? "PUT" : "POST";
      const headers = getAuthHeaders();

      const formData = new FormData();
      for (const key in productData) {
        if (key === "images") {
          Array.from(productData.images).forEach((file) =>
            formData.append("images", file)
          );
        } else if (key === "existingImages") {
          productData.existingImages.forEach((img, index) => {
            formData.append(`existingImages[${index}]`, img);
          });
        } else {
          formData.append(key, productData[key] ?? "");
        }
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: headers.Authorization,
        },
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        const errorText = contentType?.includes("application/json")
          ? (await response.json()).message
          : await response.text();
        throw new Error(errorText || "Failed to save product");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Operation failed");
      }

      const savedProduct = result.product;

      if (isEdit) {
        setProducts(
          products.map((p) => (p._id === savedProduct._id ? savedProduct : p))
        );
        toast.success("Product updated successfully");
      } else {
        setProducts([...products, savedProduct]);
        toast.success("Product added successfully");
      }

      setIsModalOpen(false);
      setCurrentProduct(null);
    } catch (err) {
      console.error("Save product failed:", err);
      toast.error(err.message || "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Product Catalog</h2>
            <p className="text-gray-600">Manage your product inventory</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                setCurrentProduct(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors w-full md:w-auto justify-center shadow-sm"
            >
              <FiPlus className="text-lg" /> Add Product
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <FiX className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center justify-end">
              <span className="text-sm text-gray-500">
                Showing {filteredProducts.length} of {products.length} products
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <ClipLoader color="#6366F1" size={40} />
            </div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    {product.images?.[0] && (
                      <img
                        className="h-12 w-12 rounded-md object-cover"
                        src={product.images[0]}
                        alt={product.name}
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    product.onSale 
                      ? "bg-purple-100 text-purple-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {product.onSale ? "On Sale" : "Regular"}
                  </span>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <div className="flex space-x-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Stock: {product.stock}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-indigo-600 hover:text-indigo-900 p-1"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(product._id)}
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory !== "all" 
                  ? "Try adjusting your search or filter criteria" 
                  : "Add your first product to get started"}
              </p>
              <button
                onClick={() => {
                  setCurrentProduct(null);
                  setIsModalOpen(true);
                }}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                + Add New Product
              </button>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <ClipLoader color="#6366F1" size={40} />
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.images?.[0] && (
                            <div className="flex-shrink-0 h-10 w-10 mr-3">
                              <img
                                className="h-10 w-10 rounded-md object-cover"
                                src={product.images[0]}
                                alt={product.name}
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold">${product.price.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {product.sales || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.stock > 10 ? 'bg-green-100 text-green-800' : 
                          product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.onSale 
                            ? "bg-purple-100 text-purple-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {product.onSale ? "On Sale" : "Regular"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-indigo-600 hover:text-indigo-900 p-2 rounded-md hover:bg-indigo-50 transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product._id)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory !== "all" 
                  ? "Try adjusting your search or filter criteria" 
                  : "Add your first product to get started"}
              </p>
              <button
                onClick={() => {
                  setCurrentProduct(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiPlus className="mr-2" /> Add Product
              </button>
            </div>
          )}
        </div>

        {/* Product Form Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {currentProduct ? "Edit Product" : "Add New Product"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FiX className="text-lg" />
                </button>
              </div>
              {isSaving ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <ClipLoader color="#6366F1" size={50} />
                  <p className="mt-4 text-gray-600">
                    {currentProduct ? "Updating product..." : "Adding new product..."}
                  </p>
                </div>
              ) : (
                <ProductForm
                  product={currentProduct}
                  onSave={handleSave}
                  onCancel={() => setIsModalOpen(false)}
                  onSuccess={(savedProduct) => {
                    if (currentProduct) {
                      setProducts(
                        products.map((p) =>
                          p._id === savedProduct._id ? savedProduct : p
                        )
                      );
                    } else {
                      setProducts([...products, savedProduct]);
                    }
                    setIsModalOpen(false);
                    setCurrentProduct(null);
                    toast.success(
                      `Product ${currentProduct ? "updated" : "added"} successfully`
                    );
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800">Confirm Deletion</h3>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setProductToDelete(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FiX className="text-lg" />
                </button>
              </div>
              <p className="mb-6 text-gray-600">
                Are you sure you want to delete this product? This action cannot
                be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setProductToDelete(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center min-w-20"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ClipLoader color="#ffffff" size={20} />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;