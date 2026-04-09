// services/CompanyService.js
import api from "../api/appApi";

const CompanyService = {
  // GET /company - Get company information
  getCompany: async () => {
    try {
      const response = await api.get('/company');
      return response.data;
    } catch (error) {
      throw error;
    }
  }, 

  // POST /company/create - Create company information
  createCompany: async (companyData, logoFile = null) => {
    try {
      // If there's a logo file, use FormData
      if (logoFile) {
        const formData = new FormData();
        formData.append('logo', logoFile);
        
        // Append all other data as a JSON string
        const { logoFile: _, ...dataWithoutLogo } = companyData;
        formData.append('data', JSON.stringify(dataWithoutLogo));
        
        const response = await api.post('/company/create', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } else {
        // If no logo file, just send JSON
        const response = await api.post('/company/create', companyData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },

  // PUT /company/update - Update company information
  updateCompany: async (companyData, logoFile = null) => {
    try {
      const formData = new FormData();
      
      // Add logo file if provided
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      
      // Add other company data
      Object.keys(companyData).forEach(key => {
        if (companyData[key] !== undefined && companyData[key] !== null) {
          if (typeof companyData[key] === 'object') {
            formData.append(key, JSON.stringify(companyData[key]));
          } else {
            formData.append(key, companyData[key]);
          }
        }
      });

      const response = await api.put('/company/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PATCH /company/patch - Update specific company fields
  patchCompany: async (updates, logoFile = null) => {
    try {
      const formData = new FormData();
      
      // Add logo file if provided
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      
      // Add other updates
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined && updates[key] !== null) {
          // Don't stringify objects - they should be sent as separate fields
          // or the backend should handle them appropriately
          if (typeof updates[key] === 'object' && !(updates[key] instanceof File)) {
            // For nested objects, append each property separately
            Object.keys(updates[key]).forEach(subKey => {
              if (updates[key][subKey] !== undefined && updates[key][subKey] !== null) {
                formData.append(`${key}[${subKey}]`, updates[key][subKey]);
              }
            });
          } else {
            formData.append(key, updates[key]);
          }
        }
      });

      console.log('Sending updates:', updates); // Debug log
      const response = await api.patch('/company/patch', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTaxRate: async () => {
    try {
      const response = await api.get('/company/tax-rate');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST /company/upload-logo - Upload company logo
  uploadLogo: async (logoFile) => {
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);
      
      const response = await api.post('/company/upload-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE /company/logo - Delete company logo
  deleteLogo: async () => {
    try {
      const response = await api.delete('/company/delete-logo');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE /company/delete - Delete company information
  deleteCompany: async () => {
    try {
      const response = await api.delete('/company/delete');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // GET /company/policies - Get company policies
  getPolicies: async () => {
    try {
      const response = await api.get('/company/policies');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // GET /company/contact - Get company contact information
  getContactInfo: async () => {
    try {
      const response = await api.get('/company/contact');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default CompanyService;