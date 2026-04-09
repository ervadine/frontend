// components/Common/Breadcrumbs.js
import React from 'react';

const Breadcrumbs = ({ items }) => {
  return (
    <nav className="breadcrumbs">
      <ol>
        {items.map((item, index) => (
          <li key={index} className={index === items.length - 1 ? 'current' : ''}>
            {index === items.length - 1 ? (
              item.label
            ) : (
              <a href={item.href}>{item.label}</a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;