// File: frontend-web/src/pages/FeeManagement.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Search, Filter } from 'lucide-react';
import { feeAPI } from '../lib/api';

const FeeManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['fee-payments', dateRange],
    queryFn: () => feeAPI.getPayments({
      start_date: dateRange.start,
      end_date: dateRange.end
    })
  });

  const payments = paymentsData?.data || [];

  const getPaymentMethodColor = (method) => {
    const colors = {
      cash: 'bg-green-100 text-green-800',
      card: 'bg-blue-100 text-blue-800',
      cheque: 'bg-purple-100 text-purple-800',
      online: 'bg-orange-100 text-orange-800',
      bank_transfer: 'bg-pink-100 text-pink-800'
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
        <p className="text-gray-600 mt-1">Track and manage fee payments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Collected</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Payments</p>
              <p className="text-2xl font-bold text-blue-600">{payments.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">0</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">0</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by student name or receipt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="input"
            placeholder="Start Date"
          />

          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="input"
            placeholder="End Date"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loading"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No payments found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Receipt No.</th>
                  <th>Student</th>
                  <th>Admission No.</th>
                  <th>Fee Type</th>
                  <th>Amount</th>
                  <th>Payment Date</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="font-medium">{payment.receipt_number}</td>
                    <td>{payment.student_name}</td>
                    <td>{payment.admission_number}</td>
                    <td className="capitalize">{payment.fee_type.replace('_', ' ')}</td>
                    <td className="font-semibold text-green-600">
                      ₹{parseFloat(payment.amount_paid).toLocaleString()}
                    </td>
                    <td>
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`badge ${getPaymentMethodColor(payment.payment_method)}`}>
                        {payment.payment_method.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success">
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeManagement;