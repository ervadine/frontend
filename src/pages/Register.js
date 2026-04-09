// pages/Register.js
import React from 'react';
import RegisterForm from '../components/RegisterForm';

const Register = () => {
  return (
    <section id="register" className="register section">
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10">
            <div className="register-wrapper">
              {/* Page Header */}
              <div className="section-header text-center mb-5">
                <h2>Create Your Account</h2>
                <p className="text-muted">Join us today and get started</p>
              </div>

              {/* Register Form */}
              <div className="card shadow-sm">
                <div className="card-body p-4 p-md-5">
                  <RegisterForm />
                  
                  {/* Additional Links */}
                  <div className="text-center mt-4">
                    <p className="mb-0">
                      Already have an account?{' '}
                      <a href="/login" className="text-decoration-none fw-semibold">
                        Sign in here
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;