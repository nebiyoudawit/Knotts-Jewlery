const productDetailsDTO = (product) => ({
    id: product._id,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    rating: product.rating,
    reviewCount: product.reviewCount,
    reviews: product.reviews?.map((r) => ({
      id: r._id,
      user: r.user,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt
    }))
  });
  
  export default productDetailsDTO;