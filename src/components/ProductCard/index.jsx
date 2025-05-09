import React, { useState } from 'react';
import { FiEdit2, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const ProductCard = ({ product, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  console.log('ProductCard props:', product);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">{product.name}</h3>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">${product.price}</p>
            {product.onSale && (
              <p className="text-sm text-gray-500 line-through">${product.originalPrice}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(product)} 
            className="text-blue-600 hover:text-blue-900 p-1"
          >
            <FiEdit2 />
          </button>
          <button 
            onClick={() => onDelete(product._id)} // Updated to use _id instead of id
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
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Images:</span>
            <span className="text-sm">{product.images?.length || 0}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
