// pages/Search.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchResultsPage from '../components/SearchResultsPage';
import Footer from '../components/Footer';
import { products, productUtils, categories } from '../dummy/data'; // Import categories
import { useLocation } from 'react-router-dom';

const Search = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Mock data for cart and wishlist counts
  const cartCount = 0; // Replace with actual cart count from your state/context
  const wishlistCount = 0; // Replace with actual wishlist count from your state/context

  // Get search term from URL query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q') || '';
    setSearchTerm(query);
    performSearch(query, 1);
  }, [location.search]);

  const performSearch = (term, page = 1) => {
    setCurrentPage(page);
    
    if (term.trim() === '') {
      const allProducts = productUtils.sortProducts(products, 'featured');
      setSearchResults(allProducts.slice(0, itemsPerPage));
    } else {
      const filtered = productUtils.searchProducts(products, term);
      const sorted = productUtils.sortProducts(filtered, 'relevance');
      const startIndex = (page - 1) * itemsPerPage;
      setSearchResults(sorted.slice(startIndex, startIndex + itemsPerPage));
    }
  };

  const handleSearch = (term) => {
    // Update URL without page reload using history API
    const newUrl = `${window.location.pathname}?q=${encodeURIComponent(term)}`;
    window.history.pushState({}, '', newUrl);
    setSearchTerm(term);
    performSearch(term, 1);
  };

  const handlePageChange = (page) => {
    performSearch(searchTerm, page);
  };

  const totalResults = productUtils.searchProducts(products, searchTerm).length;
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  return (
    <div className="search-results-page">
      {/* Fix: Pass all required props to Header */}
      <Header 
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        categories={categories} // Pass categories array
        onSearch={handleSearch}
      />
      <main className="main">
        <SearchResultsPage 
          searchTerm={searchTerm}
          searchResults={searchResults}
          totalResults={totalResults}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Search;