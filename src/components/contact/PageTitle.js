// components/Common/PageTitle.js
import React from 'react';
import Breadcrumbs from './Breadcrumbs';

const PageTitle = ({ title, breadcrumbs }) => {
  return (
    <div className="page-title light-background">
      <div className="container d-lg-flex justify-content-between align-items-center">
        <h1 className="mb-2 mb-lg-0">{title}</h1>
        <Breadcrumbs items={breadcrumbs} />
      </div>
    </div>
  );
};

export default PageTitle;