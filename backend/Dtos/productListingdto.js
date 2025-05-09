// dtos/productListing.dto.js
const productListingDTO = (product) => ({
    _id: product._id,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    category: product.category,
    images: product.images,
    rating: product.rating,
    stock: product.stock,
    onSale: product.onSale
  });

  export default productListingDTO;
  
