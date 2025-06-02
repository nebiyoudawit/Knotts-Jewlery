import { useState, useEffect } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import ProductForm from "../../components/ProductForm";
import ProductCard from "../../components/ProductCard";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/admin`;

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

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
    } catch (err) {
      setError(handleApiError(err, "Failed to fetch products"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Products Management</h2>
        <button
          onClick={() => {
            setCurrentProduct(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#05B171] text-white px-4 py-2 rounded hover:bg-[#048a5b] w-full md:w-auto justify-center"
        >
          <FiPlus /> Add Product
        </button>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <ClipLoader color="#05B171" size={30} />
          </div>
        ) : products.length > 0 ? (
          products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
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
          <div className="flex justify-center items-center py-8">
            <ClipLoader color="#05B171" size={30} />
          </div>
        ) : products.length > 0 ? (
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
                  Units Sold
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {product.sales}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        product.onSale
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {product.onSale ? "On Sale" : "Regular"}
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
                      onClick={() => handleDeleteClick(product._id)}
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

      {/* Product Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">
              {currentProduct ? "Edit Product" : "Add New Product"}
            </h3>
            {isSaving ? (
              <div className="flex flex-col items-center justify-center h-64">
                <ClipLoader color="#05B171" size={50} />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setProductToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center min-w-20"
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
  );
};

export default ProductManagement;