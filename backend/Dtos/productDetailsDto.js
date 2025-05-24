// productDetailsDTO.js

const productDetailsDTO = (product) => {
    return {
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || null,
      category: product.category || 'Uncategorized',
      onSale: product.onSale || false,
      images: product.images && product.images.length > 0 ? product.images : ['/placeholder.jpg'],
      imageUrl: product.images?.[0] || '/placeholder.jpg', // Optional shortcut
      rating: product.rating || 0,
      reviewCount: Array.isArray(product.reviews) ? product.reviews.length : 0,
      reviews: product.reviews || [],
    };
  };
  
  export default productDetailsDTO;
  