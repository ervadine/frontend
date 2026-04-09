// components/SearchResults/SearchResultsHeader.js
import React, { useState } from 'react';

const SearchResultsHeader = ({ searchTerm, totalResults, onSearch }) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(localSearchTerm);
  };

  return (
    <section id="search-results-header" className="search-results-header section">
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="search-results-header">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="results-count" data-aos="fade-right" data-aos-delay="200">
                <h2>Search Results</h2>
                <p>We found <span className="results-number">{totalResults}</span> results for <span className="search-term">"{searchTerm}"</span></p>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left" data-aos-delay="300">
              <form onSubmit={handleSubmit} className="search-form">
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search..." 
                    value={localSearchTerm}
                    onChange={(e) => setLocalSearchTerm(e.target.value)}
                    required
                  />
                  <button className="btn search-btn" type="submit">
                    <i className="bi bi-search"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="search-filters mt-4" data-aos="fade-up" data-aos-delay="400">
            <div className="row">
              <div className="col-lg-8">
                <div className="filter-tags">
                  <span className="filter-label">Filters:</span>
                  <div className="tags-wrapper">
                    <span className="filter-tag">
                      Category: Blog
                      <i className="bi bi-x-circle"></i>
                    </span>
                    <span className="filter-tag">
                      Date: Last Month
                      <i className="bi bi-x-circle"></i>
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
                <div className="sort-options">
                  <label htmlFor="sort-select" className="me-2">Sort by:</label>
                  <select id="sort-select" className="form-select form-select-sm d-inline-block w-auto">
                    <option value="relevance">Relevance</option>
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="title-asc">Title A-Z</option>
                    <option value="title-desc">Title Z-A</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchResultsHeader;