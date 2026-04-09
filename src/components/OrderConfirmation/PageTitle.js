// components/OrderConfirmation/PageTitle.js
import React from 'react';

const PageTitle = () => {
  return (
    <div className="page-title light-background">
      <div className="container d-lg-flex justify-content-between align-items-center">
        <h1 className="mb-2 mb-lg-0">Order Confirmation</h1>
        <nav className="breadcrumbs">
          <ol>
            <li><a href="/">Home</a></li>
            <li className="current">Order Confirmation</li>
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default PageTitle;