import React from 'react';

const Customers = () => {
  const customers = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      orders: 12,
      totalSpent: '$1,245.80',
      joinDate: '2023-03-15',
      status: 'active'
    },
    {
      id: 2,
      name: 'Emma Wilson',
      email: 'emma.wilson@email.com',
      phone: '+1 (555) 234-5678',
      orders: 8,
      totalSpent: '$867.50',
      joinDate: '2023-05-22',
      status: 'active'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@email.com',
      phone: '+1 (555) 345-6789',
      orders: 3,
      totalSpent: '$234.75',
      joinDate: '2023-08-10',
      status: 'active'
    },
    {
      id: 4,
      name: 'Sarah Brown',
      email: 'sarah.brown@email.com',
      phone: '+1 (555) 456-7890',
      orders: 0,
      totalSpent: '$0.00',
      joinDate: '2024-01-05',
      status: 'inactive'
    },
    {
      id: 5,
      name: 'David Lee',
      email: 'david.lee@email.com',
      phone: '+1 (555) 567-8901',
      orders: 15,
      totalSpent: '$2,156.80',
      joinDate: '2023-01-18',
      status: 'active'
    }
  ];

  const getStatusBadge = (status) => {
    return status === 'active' 
      ? <span className="badge bg-success">Active</span>
      : <span className="badge bg-secondary">Inactive</span>;
  };

  return (
    <div className="container-fluid">
      <div className="page-title light-background">
        <div className="container d-lg-flex justify-content-between align-items-center">
          <h1 className="mb-2 mb-lg-0">Customers</h1>
          <nav className="breadcrumbs">
            <ol>
              <li><a href="/admin">Home</a></li>
              <li className="current">Customers</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container mt-4">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">All Customers</h5>
            <div className="d-flex gap-2">
              <input type="text" className="form-control form-control-sm" placeholder="Search customers..." />
              <button className="btn btn-primary btn-sm">
                <i className="bi bi-download me-1"></i> Export
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                    <th>Join Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(customer => (
                    <tr key={customer.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="customer-avatar me-3">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                              {customer.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          </div>
                          <div>
                            <div className="fw-bold">{customer.name}</div>
                            <small className="text-muted">ID: {customer.id}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>{customer.email}</div>
                        <small className="text-muted">{customer.phone}</small>
                      </td>
                      <td>{customer.orders}</td>
                      <td>{customer.totalSpent}</td>
                      <td>{customer.joinDate}</td>
                      <td>{getStatusBadge(customer.status)}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary">
                            <i className="bi bi-eye"></i>
                          </button>
                          <button className="btn btn-outline-secondary">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-outline-info">
                            <i className="bi bi-envelope"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;