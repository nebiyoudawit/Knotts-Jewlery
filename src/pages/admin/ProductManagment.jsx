import { useState, useEffect } from "react";
import { 
  FiEdit2, FiTrash2, FiPlus, FiX, FiSearch, FiFilter,
  FiRefreshCw, FiPackage, FiAlertCircle, FiTag
} from "react-icons/fi";
import ProductForm from "../../components/ProductForm";
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
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [stockFilter, setStockFilter] = useState("all");
  const [saleFilter, setSaleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

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
    
    // Search filter
    if (searchTerm) {
      results = results.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Category filter
    if (selectedCategory !== "all") {
      results = results.filter(product =>
        product.category === selectedCategory
      );
    }

    // Stock filter
    if (stockFilter !== "all") {
      if (stockFilter === "inStock") {
        results = results.filter(product => product.stock >= 10);
      } else if (stockFilter === "lowStock") {
        results = results.filter(product => product.stock > 0 && product.stock < 10);
      } else if (stockFilter === "outOfStock") {
        results = results.filter(product => product.stock === 0);
      }
    }

    // Sale filter
    if (saleFilter !== "all") {
      if (saleFilter === "onSale") {
        results = results.filter(product => product.onSale === true);
      } else if (saleFilter === "regular") {
        results = results.filter(product => product.onSale === false);
      }
    }

    // Sorting
    switch (sortBy) {
      case "newest":
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        results.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "nameAsc":
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "nameDesc":
        results.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "priceLow":
        results.sort((a, b) => a.price - b.price);
        break;
      case "priceHigh":
        results.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }
    
    setFilteredProducts(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, selectedCategory, products, stockFilter, saleFilter, sortBy]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/20 p-4 md:p-8">
      <style>{`
        @keyframes fadeInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
        
        .table-row {
          animation: fadeInUp 0.4s ease-out forwards;
        }
      `}</style>

      <div className="max-w-[1400px] mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#05B171] to-emerald-600 shadow-lg shadow-emerald-200">
                  <FiPackage className="text-white text-xl" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Product Catalog
                </h1>
              </div>
              <p className="text-base text-gray-500 ml-16">
                Manage your inventory and product listings
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-5 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-medium ${
                  showFilters 
                    ? 'bg-gradient-to-r from-[#05B171] to-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200' 
                    : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-500 hover:bg-emerald-50'
                }`}
              >
                <FiFilter className="text-lg" />
                <span>Filters</span>
              </button>
              <button
                onClick={() => {
                  setCurrentProduct(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#05B171] to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-200/50 hover:shadow-xl font-medium"
              >
                <FiPlus className="text-xl" /> 
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6 relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400 text-xl" />
            </div>
            <input
              type="text"
              placeholder="Search by product name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14 pr-12 py-4 w-full border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all bg-white shadow-sm text-base"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            )}
          </div>
        </div>

        {/* Stats & Quick Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Total Products Card */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <FiPackage className="text-emerald-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> filtered
              </p>
            </div>
          </div>

          {/* Category Filter Card */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <FiTag className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Filter by Category</p>
                <p className="text-xs text-gray-400 mt-0.5">Select a category</p>
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all bg-white text-sm font-medium cursor-pointer"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-100 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <FiFilter className="text-emerald-600 text-xl" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Quick Actions</p>
                <p className="text-xs text-gray-500 mt-0.5">Manage filters</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchTerm("");
                setCurrentPage(1);
                setStockFilter("all");
                setSaleFilter("all");
                setSortBy("newest");
              }}
              className="w-full px-4 py-2.5 bg-white border-2 border-emerald-200 text-emerald-700 rounded-xl hover:bg-emerald-50 transition-all font-medium text-sm flex items-center justify-center gap-2"
            >
              <FiRefreshCw className="text-base" />
              Reset All Filters
            </button>
          </div>
        </div>

        {/* Advanced Filters (Optional Toggle) */}
        {showFilters && (
          <div className="bg-white rounded-2xl p-6 mb-8 border-2 border-gray-100 shadow-sm animate-scale-in">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-4 border-b-2 border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    <FiFilter className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Advanced Filters</h3>
                    <p className="text-xs text-gray-500">Refine your product search</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock Status
                  </label>
                  <select 
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all bg-white text-sm"
                  >
                    <option value="all">All Stock Levels</option>
                    <option value="inStock">In Stock (10+)</option>
                    <option value="lowStock">Low Stock (1-9)</option>
                    <option value="outOfStock">Out of Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sale Status
                  </label>
                  <select 
                    value={saleFilter}
                    onChange={(e) => setSaleFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all bg-white text-sm"
                  >
                    <option value="all">All Products</option>
                    <option value="onSale">On Sale</option>
                    <option value="regular">Regular Price</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all bg-white text-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="nameAsc">Name (A-Z)</option>
                    <option value="nameDesc">Name (Z-A)</option>
                    <option value="priceLow">Price (Low to High)</option>
                    <option value="priceHigh">Price (High to Low)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl border-2 border-gray-100">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-100 border-t-emerald-600"></div>
              <div className="absolute inset-0 rounded-full bg-emerald-50 opacity-20"></div>
            </div>
            <p className="mt-6 text-gray-500 font-medium">Loading products...</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="lg:hidden space-y-4">
              {filteredProducts.length === 0 ? (
                <EmptyState onAddProduct={() => {
                  setCurrentProduct(null);
                  setIsModalOpen(true);
                }} />
              ) : (
                currentProducts.map((product, index) => (
                  <div key={product._id} style={{animationDelay: `${index * 50}ms`}}>
                    <ProductCard
                      product={product}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-3xl border-2 border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-100">
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-widest">
                        Product
                      </th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-widest">
                        Price
                      </th>
                      <th className="px-8 py-5 text-center text-xs font-bold text-gray-600 uppercase tracking-widest">
                        Stock
                      </th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-widest">
                        Category
                      </th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-widest">
                        Status
                      </th>
                      <th className="px-8 py-5 text-right text-xs font-bold text-gray-600 uppercase tracking-widest">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-8 py-16 text-center">
                          <EmptyState onAddProduct={() => {
                            setCurrentProduct(null);
                            setIsModalOpen(true);
                          }} />
                        </td>
                      </tr>
                    ) : (
                      currentProducts.map((product, index) => (
                        <ProductRow 
                          key={product._id} 
                          product={product} 
                          onEdit={handleEdit} 
                          onDelete={handleDeleteClick}
                          index={index}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {filteredProducts.length > 0 && totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl border-2 border-gray-100 p-5">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-semibold text-gray-900">
                    {Math.min(indexOfLastItem, filteredProducts.length)}
                  </span>{" "}
                  of <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-xl border-2 font-medium transition-all ${
                      currentPage === 1
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 text-gray-700 hover:border-emerald-500 hover:bg-emerald-50'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => paginate(pageNumber)}
                            className={`w-10 h-10 rounded-xl font-medium transition-all ${
                              currentPage === pageNumber
                                ? 'bg-gradient-to-r from-[#05B171] to-emerald-600 text-white shadow-lg'
                                : 'border-2 border-gray-200 text-gray-700 hover:border-emerald-500 hover:bg-emerald-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return <span key={pageNumber} className="px-2 text-gray-400">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-xl border-2 font-medium transition-all ${
                      currentPage === totalPages
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 text-gray-700 hover:border-emerald-500 hover:bg-emerald-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl mx-auto my-8 animate-scale-in">
            <div className="flex justify-between items-center p-8 border-b-2 border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100">
                  {currentProduct ? (
                    <FiEdit2 className="text-emerald-600 text-2xl" />
                  ) : (
                    <FiPlus className="text-emerald-600 text-2xl" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {currentProduct ? "Edit Product" : "Add New Product"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 font-medium">
                    {currentProduct ? "Update product information" : "Create a new product listing"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-3 rounded-xl hover:bg-gray-100 transition-all"
              >
                <FiX className="text-2xl" />
              </button>
            </div>
            
            <div className="max-h-[calc(90vh-120px)] overflow-y-auto p-8">
              {isSaving ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-100 border-t-emerald-600"></div>
                    <div className="absolute inset-0 rounded-full bg-emerald-50 opacity-20"></div>
                  </div>
                  <p className="mt-6 text-gray-600 font-medium">
                    {currentProduct ? "Updating product..." : "Creating product..."}
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
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto my-8 animate-scale-in">
            <div className="p-8">
              <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-3xl mx-auto mb-6">
                <FiAlertCircle className="text-red-600 text-4xl" />
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Delete Product</h3>
                <p className="text-gray-600 leading-relaxed">
                  Are you sure you want to delete this product? This action cannot be undone and will remove all associated data.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-center gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setProductToDelete(null);
                  }}
                  className="px-8 py-3.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-semibold transition-all"
                  disabled={isDeleting}
                >
                  Keep Product
                </button>
                <button
                  onClick={handleDelete}
                  className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 font-semibold transition-all shadow-lg shadow-red-200/50 hover:shadow-xl flex items-center justify-center gap-2 min-w-[140px]"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : 'Delete Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Empty State Component
const EmptyState = ({ onAddProduct }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
      <FiPackage className="text-gray-400 text-4xl" />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-3">No products found</h3>
    <p className="text-gray-500 text-center max-w-md leading-relaxed mb-6">
      {onAddProduct ? "Get started by adding your first product to the catalog." : "Try adjusting your search or filters."}
    </p>
    {onAddProduct && (
      <button
        onClick={onAddProduct}
        className="flex items-center gap-2 bg-gradient-to-r from-[#05B171] to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-200/50 hover:shadow-xl font-medium"
      >
        <FiPlus className="text-xl" /> Add Your First Product
      </button>
    )}
  </div>
);

// Product Row Component
const ProductRow = ({ product, onEdit, onDelete, index }) => {
  return (
    <tr 
      className="table-row border-b border-gray-100 hover:bg-gray-50/60 transition-all duration-200"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <td className="px-8 py-6 whitespace-nowrap">
        <div className="flex items-center gap-4">
          {product.images?.[0] ? (
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 shadow-sm flex-shrink-0">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm flex-shrink-0">
              <FiPackage className="text-gray-400 text-2xl" />
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 text-base">{product.name}</p>
            {product.productId && (
              <p className="text-xs text-gray-400 font-medium mt-0.5">ID: {product.productId}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 text-base">${product.price.toFixed(2)}</span>
          {product.onSale && product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
      </td>
      <td className="px-8 py-6 whitespace-nowrap text-center">
        <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold ${
          product.stock > 10 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
            : product.stock > 0 
            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {product.stock || 0}
        </span>
      </td>
      <td className="px-8 py-6 whitespace-nowrap">
        <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700">
          {product.category}
        </span>
      </td>
      <td className="px-8 py-6 whitespace-nowrap">
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${
          product.onSale
            ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm"
            : "bg-gray-100 text-gray-700"
        }`}>
          {product.onSale && <FiTag className="text-sm" />}
          {product.onSale ? "On Sale" : "Regular"}
        </span>
      </td>
      <td className="px-8 py-6 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(product)}
            className="p-3 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all group"
            title="Edit product"
          >
            <FiEdit2 className="text-lg group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => onDelete(product._id)}
            className="p-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group"
            title="Delete product"
          >
            <FiTrash2 className="text-lg group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Product Card Component for Mobile
const ProductCard = ({ product, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 shadow-sm hover:shadow-lg transition-all animate-fade-in-up">
      <div className="flex gap-4 mb-4">
        {product.images?.[0] ? (
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 shadow-sm flex-shrink-0">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm flex-shrink-0">
            <FiPackage className="text-gray-400 text-2xl" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate text-base">{product.name}</h3>
          {product.productId && (
            <p className="text-xs text-gray-400 mb-1">ID: {product.productId}</p>
          )}
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">${product.price.toFixed(2)}</span>
            {product.onSale && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-lg">
                SALE
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
        <div className="flex gap-2">
          <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
            product.stock > 10 
              ? 'bg-emerald-50 text-emerald-700' 
              : product.stock > 0 
              ? 'bg-amber-50 text-amber-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            Stock: {product.stock || 0}
          </span>
          <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">
            {product.category}
          </span>
        </div>
        
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(product)}
            className="p-2.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
          >
            <FiEdit2 className="text-lg" />
          </button>
          <button
            onClick={() => onDelete(product._id)}
            className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <FiTrash2 className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;