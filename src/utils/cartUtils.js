// utils/cartUtils.js
export const createCartItemFromProduct = (product, variant, quantity = 1) => {
  return {
    id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    productId: product._id,
    variantId: variant._id,
    name: product.name,
    price: variant.price || product.price,
    quantity,
    image: variant.images?.[0]?.url || product.images?.[0]?.url,
    color: variant.color?.name || 'Default',
    size: variant.size?.displayText || 'One Size'
  };
};

export const calculateCartTotals = (cartItems) => {
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  return { 
    subtotal: Number(subtotal.toFixed(2)), 
    shipping: Number(shipping.toFixed(2)), 
    tax: Number(tax.toFixed(2)), 
    total: Number(total.toFixed(2))
  };
};