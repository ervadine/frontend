// pages/Unauthorized.js
import React from 'react';

const Unauthorized = () => {
  return (
    <div className="page-unauthorized">
      <main className="main">

        {/* Page Title */}
        <div className="page-title light-background">
          <div className="container d-lg-flex justify-content-between align-items-center">
            <h1 className="mb-2 mb-lg-0">Unauthorized</h1>
            <nav className="breadcrumbs">
              <ol>
                <li><a href="/">Home</a></li>
                <li className="current">Unauthorized</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Unauthorized Section */}
        <section id="unauthorized" className="unauthorized section">
          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="text-center">
              <div className="unauthorized-icon mb-4" data-aos="zoom-in" data-aos-delay="200">
                <i className="bi bi-shield-exclamation"></i>
              </div>

              <h1 className="unauthorized-code mb-4" data-aos="fade-up" data-aos-delay="300">403</h1>

              <h2 className="unauthorized-title mb-3" data-aos="fade-up" data-aos-delay="400">
                Access Denied
              </h2>

              <p className="unauthorized-text mb-4" data-aos="fade-up" data-aos-delay="500">
                You don't have permission to access this page. This area is restricted to authorized personnel only.
              </p>

              <div className="unauthorized-actions" data-aos="fade-up" data-aos-delay="600">
                <a href="/" className="btn btn-primary me-3">
                  Back to Home
                </a>
                <a href="/login" className="btn btn-outline-primary">
                  Sign In
                </a>
              </div>

              <div className="unauthorized-help mt-4" data-aos="fade-up" data-aos-delay="700">
                <p className="text-muted small">
                  If you believe this is an error, please contact the administrator.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <style jsx>{`
        .page-unauthorized {
          min-height: 100vh;
          background: #f8f9fa;
        }

        .page-title {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem 0;
        }

        .page-title h1 {
          color: white;
          margin: 0;
        }

        .breadcrumbs ol {
          display: flex;
          flex-wrap: wrap;
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: 0.875rem;
        }

        .breadcrumbs li {
          display: flex;
          align-items: center;
        }

        .breadcrumbs li:not(:last-child)::after {
          content: "/";
          margin: 0 0.5rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .breadcrumbs a {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          transition: color 0.3s;
        }

        .breadcrumbs a:hover {
          color: white;
        }

        .breadcrumbs .current {
          color: white;
        }

        .unauthorized {
          padding: 5rem 0;
          background: #f8f9fa;
        }

        .unauthorized-icon {
          font-size: 4rem;
          color: #dc3545;
        }

        .unauthorized-icon i {
          font-size: inherit;
        }

        .unauthorized-code {
          font-size: 6rem;
          font-weight: 700;
          color: #dc3545;
          line-height: 1;
        }

        .unauthorized-title {
          font-size: 2rem;
          font-weight: 600;
          color: #343a40;
        }

        .unauthorized-text {
          font-size: 1.125rem;
          color: #6c757d;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }

        .unauthorized-actions {
          margin-bottom: 2rem;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 500;
          text-decoration: none;
          border: 2px solid transparent;
          border-radius: 0.375rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .btn-primary {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .btn-primary:hover {
          background: #0056b3;
          border-color: #0056b3;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .btn-outline-primary {
          background: transparent;
          color: #007bff;
          border-color: #007bff;
        }

        .btn-outline-primary:hover {
          background: #007bff;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .me-3 {
          margin-right: 1rem !important;
        }

        .mt-4 {
          margin-top: 1.5rem !important;
        }

        .mb-2 {
          margin-bottom: 0.5rem !important;
        }

        .mb-3 {
          margin-bottom: 1rem !important;
        }

        .mb-4 {
          margin-bottom: 1.5rem !important;
        }

        .text-center {
          text-align: center !important;
        }

        .text-muted {
          color: #6c757d !important;
        }

        .small {
          font-size: 0.875rem;
        }

        .container {
          width: 100%;
          padding-right: var(--bs-gutter-x, 0.75rem);
          padding-left: var(--bs-gutter-x, 0.75rem);
          margin-right: auto;
          margin-left: auto;
        }

        @media (min-width: 576px) {
          .container {
            max-width: 540px;
          }
        }

        @media (min-width: 768px) {
          .container {
            max-width: 720px;
          }
        }

        @media (min-width: 992px) {
          .container {
            max-width: 960px;
          }
          
          .d-lg-flex {
            display: flex !important;
          }
          
          .justify-content-between {
            justify-content: space-between !important;
          }
          
          .align-items-center {
            align-items: center !important;
          }
          
          .mb-2.mb-lg-0 {
            margin-bottom: 0 !important;
          }
        }

        @media (min-width: 1200px) {
          .container {
            max-width: 1140px;
          }
        }

        /* Animation classes */
        [data-aos] {
          opacity: 0;
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        [data-aos].aos-animate {
          opacity: 1;
        }

        [data-aos="fade-up"] {
          transform: translateY(30px);
        }

        [data-aos="fade-up"].aos-animate {
          transform: translateY(0);
        }

        [data-aos="zoom-in"] {
          transform: scale(0.8);
        }

        [data-aos="zoom-in"].aos-animate {
          transform: scale(1);
        }
      `}</style>

      {/* Add Bootstrap Icons CDN */}
      <link 
        rel="stylesheet" 
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" 
      />
    </div>
  );
};

export default Unauthorized;