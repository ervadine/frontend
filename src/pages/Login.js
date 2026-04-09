// pages/Login.js
import React from 'react';
import LoginForm from '../components/LoginForm';

const Login = () => {
  return (
    <section id="login" className="login section">
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="login-wrapper">
              {/* Page Header */}
              <div className="section-header text-center mb-5">
                <h2>Welcome Back</h2>
                <p className="text-muted">Sign in to your account to continue</p>
              </div>

              {/* Login Form */}
              <div className="card shadow-sm">
                <div className="card-body p-4 p-md-5">
                  <LoginForm />
              
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;