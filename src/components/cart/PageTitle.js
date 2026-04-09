// components/Cart/PageTitle.js
import React from 'react';

const PageTitle = () => {
  return (
    <div className="page-title light-background">
      <div className="container d-lg-flex justify-content-between align-items-center">
        <h1 className="mb-2 mb-lg-0">Cart</h1>
        <nav className="breadcrumbs">
          <ol>
            <li><a href="index.html">Home</a></li>
            <li className="current">Cart</li>
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default PageTitle;