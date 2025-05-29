const productListingDTO = (product) => {
  // Find the first defined image
  const fallbackImage = product.images?.find(img => !!img) || null;

  return {
    _id: product._id,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    category: product.category,
    image: fallbackImage,
    rating: product.rating,
    reviewCount: product.reviewCount,
    onSale: product.onSale
  };
};

export default productListingDTO;