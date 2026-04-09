import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectError,
  updateAddresses,
  updateProfile,
  changePassword,
  addToWishlist,
  forgotPassword,
  logoutUser,
  selectWishlist,
  removeFromWishlist,
   getPaymentCards,
  addPaymentCard,
  updatePaymentCard,
  deletePaymentCard,
  setDefaultPaymentCard,
  selectPaymentCards,
  selectDefaultPaymentCard
} from '../store/redux/authSlice';

// Custom hook
export const useUserProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const wishlist = useSelector(selectWishlist);

  const paymentCards = useSelector(selectPaymentCards) || [];
  const defaultPaymentCard = useSelector(selectDefaultPaymentCard);
  const [profile, setProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Initialize profile when user data loads
  useEffect(() => {
    if (user) {
      setProfile(user);
    }
  }, [user]);

  // Profile update handler
  const handleUpdateProfile = useCallback((updates) => {
    setProfile(prev => ({ ...prev, ...updates }));
    dispatch(updateProfile(updates));
  }, [dispatch]);

  // Address management
  const addAddress = useCallback((address) => {
    const updatedAddresses = [...(profile.addresses || []), address];
    setProfile(prev => ({
      ...prev,
      addresses: updatedAddresses
    }));
    dispatch(updateAddresses(updatedAddresses));
  }, [dispatch, profile.addresses]);

  const updateAddress = useCallback((addressId, updatedAddress) => {
    const updatedAddresses = profile.addresses?.map(addr => 
      addr.id === addressId ? { ...addr, ...updatedAddress } : addr
    ) || [];
    
    setProfile(prev => ({
      ...prev,
      addresses: updatedAddresses
    }));
    dispatch(updateAddresses(updatedAddresses));
  }, [dispatch, profile.addresses]);

  const removeAddress = useCallback((addressId) => {
    const updatedAddresses = profile.addresses?.filter(addr => addr.id !== addressId) || [];
    
    setProfile(prev => ({
      ...prev,
      addresses: updatedAddresses
    }));
    dispatch(updateAddresses(updatedAddresses));
  }, [dispatch, profile.addresses]);

  const setDefaultAddress = useCallback((addressId) => {
    const updatedAddresses = profile.addresses?.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    })) || [];
    
    setProfile(prev => ({
      ...prev,
      addresses: updatedAddresses
    }));
    dispatch(updateAddresses(updatedAddresses));
  }, [dispatch, profile.addresses]);

const handleAddToWishlist = useCallback(async (productId) => {
  dispatch(addToWishlist(productId));
 
  
}, [dispatch,wishlist]);

const removeFrom_Wishlist = useCallback(async (productId) => {
  try {
    dispatch(removeFromWishlist(productId))
   
  
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
}, [dispatch,wishlist]);

  // Logout handler
  const handleLogout = useCallback(async () => {
    try {
      const result = await dispatch(logoutUser()).unwrap();
      
      // Clear local state after successful logout
      setProfile({});
      setIsEditing(false);
      
      return result;
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, [dispatch]);

  // Check if item is in wishlist using the selector logic
  const isInWishlist = useCallback((productId) => {
    return wishlist.some((item) => item._id === productId);
  }, [wishlist]);

  // Get wishlist using the selector
  const getWishlist = useCallback(() => {
    return wishlist;
  }, [wishlist]);

  // Password management
  const handleChangePassword = useCallback((passwordData) => {
    return dispatch(changePassword(passwordData));
  }, [dispatch]);

  const handleForgotPassword = useCallback((email) => {
    return dispatch(forgotPassword(email));
  }, [dispatch]);

  // Avatar management
  const updateAvatar = useCallback((avatarUrl) => {
    setProfile(prev => ({ ...prev, avatar: avatarUrl }));
    dispatch(updateProfile({ avatar: avatarUrl }));
  }, [dispatch]);

  // Email verification status
  const getEmailVerificationStatus = useCallback(() => {
    if (!user) return { isVerified: false, isExpired: true };
    
    const isExpired = new Date() > new Date(user.emailVerificationExpires);
    return {
      isVerified: user.emailVerified,
      isExpired,
      isValid: user.emailVerified && !isExpired
    };
  }, [user]);

  // User full name
  const getFullName = useCallback(() => {
    return user ? `${user.firstName} ${user.lastName}` : '';
  }, [user]);

  // User activity status
  const getUserActivity = useCallback(() => {
    if (!user) return { isActive: false, lastLogin: null };
    
    return {
      isActive: user.isActive,
      lastLogin: new Date(user.lastLogin),
      memberSince: new Date(user.createdAt)
    };
  }, [user]);


  
  const fetchPaymentCards = useCallback(async () => {
    try {
      const result = await dispatch(getPaymentCards()).unwrap();
      return result;
    } catch (error) {
      console.error('Failed to fetch payment cards:', error);
      throw error;
    }
  }, [dispatch]);

  // Add a new payment card
  const addPaymentCardHandler = useCallback(async (cardData) => {
    try {
      const result = await dispatch(addPaymentCard(cardData)).unwrap();
      
      // Update local profile state
      if (result?.data?.card) {
        setProfile(prev => ({
          ...prev,
          paymentCards: [...(prev.paymentCards || []), result.data.card]
        }));
      }
      
      return result;
    } catch (error) {
      console.error('Failed to add payment card:', error);
      throw error;
    }
  }, [dispatch]);

  // Update an existing payment card
  const updatePaymentCardHandler = useCallback(async (cardId, updateData) => {
    try {
      const result = await dispatch(updatePaymentCard({ cardId, updateData })).unwrap();
      
      // Update local profile state
      if (result?.data?.card) {
        setProfile(prev => ({
          ...prev,
          paymentCards: prev.paymentCards?.map(card =>
            card._id === cardId ? { ...card, ...result.data.card } : card
          ) || []
        }));
      }
      
      return result;
    } catch (error) {
      console.error('Failed to update payment card:', error);
      throw error;
    }
  }, [dispatch]);

  // Delete a payment card
  const deletePaymentCardHandler = useCallback(async (cardId) => {
    try {
      const result = await dispatch(deletePaymentCard(cardId)).unwrap();
      
      // Update local profile state
      setProfile(prev => ({
        ...prev,
        paymentCards: prev.paymentCards?.filter(card => card._id !== cardId) || []
      }));
      
      return result;
    } catch (error) {
      console.error('Failed to delete payment card:', error);
      throw error;
    }
  }, [dispatch]);

  // Set a payment card as default
  const setDefaultPaymentCardHandler = useCallback(async (cardId) => {
    try {
      const result = await dispatch(setDefaultPaymentCard(cardId)).unwrap();
      
      // Update local profile state
      setProfile(prev => ({
        ...prev,
        paymentCards: prev.paymentCards?.map(card => ({
          ...card,
          isDefault: card._id === cardId
        })) || []
      }));
      
      return result;
    } catch (error) {
      console.error('Failed to set default payment card:', error);
      throw error;
    }
  }, [dispatch]);

  // Get masked card number for display
  const getMaskedCardNumber = useCallback((card) => {
    if (!card || !card.lastFourDigits) return '**** **** **** ****';
    return `**** **** **** ${card.lastFourDigits}`;
  }, []);

  // Get card type icon name (for display)
const getCardTypeIcon = useCallback((cardType) => {
  if (!cardType) return 'card-outline';
  
  const normalizedType = cardType.trim().toLowerCase();
  
  const icons = {
    'visa': 'card-visa',
    'mastercard': 'card-mastercard',
    'master card': 'card-mastercard',
    'american express': 'card-amex',
    'amex': 'card-amex',
    'discover': 'card-discover',
    'other': 'card-outline'
  };
  
  return icons[normalizedType] || 'card-outline';
}, []);

  // Format expiry date for display
  const formatExpiryDate = useCallback((month, year) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  }, []);

  // Check if card is expired
  const isCardExpired = useCallback((expiryMonth, expiryYear) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    if (expiryYear < currentYear) return true;
    if (expiryYear === currentYear && expiryMonth < currentMonth) return true;
    return false;
  }, []);

  // Get default card (using selector or fallback)
  const getDefaultCard = useCallback(() => {
    return defaultPaymentCard || paymentCards.find(card => card.isDefault) || paymentCards[0];
  }, [defaultPaymentCard, paymentCards]);

  // Check if user has any payment cards
  const hasPaymentCards = useCallback(() => {
    return paymentCards.length > 0;
  }, [paymentCards]);

  // Get active payment cards (non-expired)
  const getActivePaymentCards = useCallback(() => {
    return paymentCards.filter(card => 
      card.isActive !== false && !isCardExpired(card.expiryMonth, card.expiryYear)
    );
  }, [paymentCards, isCardExpired]);


  return {
    // Redux state
    user,
    isAuthenticated,
    isLoading,
    error,
    wishlist,
    
    // Local profile state
    profile,
    isEditing,
    setIsEditing,
    
    // Profile methods
    updateProfile: handleUpdateProfile,
    updateAvatar,
    
    // Address methods
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
    
    // Wishlist methods
    addToWishlist: handleAddToWishlist,
    removeFrom_Wishlist,
    isInWishlist,
    selectWishlist: getWishlist,
    selectIsInWishlist: isInWishlist,
    
     // Payment Card methods (add these)
    fetchPaymentCards,
    addPaymentCard: addPaymentCardHandler,
    updatePaymentCard: updatePaymentCardHandler,
    deletePaymentCard: deletePaymentCardHandler,
    setDefaultPaymentCard: setDefaultPaymentCardHandler,
    
    // Payment Card utilities (add these)
    getMaskedCardNumber,
    getCardTypeIcon,
    formatExpiryDate,
    isCardExpired,
    getDefaultCard,
    hasPaymentCards,
    getActivePaymentCards,
    paymentCards,
    // Password methods
    changePassword: handleChangePassword,
    forgotPassword: handleForgotPassword,
    
    // Auth methods
    logout: handleLogout,
    
    // Computed values
    getFullName,
    getEmailVerificationStatus,
    getUserActivity,
    
    // Convenience properties
    addresses: profile.addresses || [],
    defaultAddress: profile.addresses?.find(addr => addr.isDefault) || null
  };
};

export default useUserProfile;