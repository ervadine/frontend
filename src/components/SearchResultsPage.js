// components/SearchResults/SearchResultsPage.js
import React from 'react';
import SearchResultsHeader from './SearchResultsHeader';
import SearchProductList from './SearchProductList';
import Pagination from './Pagination';

const SearchResultsPage = ({
  searchTerm,
  searchResults,
  totalResults,
  currentPage,
  totalPages,
  onPageChange,
  onSearch
}) => {
  return (
    <>
      <SearchResultsHeader 
        searchTerm={searchTerm}
        totalResults={totalResults}
        onSearch={onSearch}
      />
      <SearchProductList products={searchResults} />
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
};

export default SearchResultsPage;