import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Search, Filter, Plus, FileText, Users, CreditCard, Settings } from 'lucide-react';
import { feeAPI, classesAPI, studentsAPI } from '../lib/api';
import toast from 'react-hot-toast';

const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const queryClient = useQueryClient();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
        <p className="text-gray-600 mt-1">Manage fee structures, collections, and reports</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: DollarSign },
          { id: 'collect', label: 'Collect Fee', icon: CreditCard },
          { id: 'structure', label: 'Fee Structure', icon: FileText },
          { id: 'heads', label: 'Fee Heads', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md p-6 min-h-[500px]">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'collect' && <CollectFeeTab />}
        {activeTab === 'structure' && <FeeStructureTab />}
        {activeTab === 'heads' && <FeeHeadsTab />}
      </div>
    </div>
  );
};

// ==========================================
// DASHBOARD TAB
// ==========================================
const DashboardTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['fee-payments', dateRange],
    queryFn: () => feeAPI.getPayments({
      start_date: dateRange.start,
      end_date: dateRange.end
    })
  });

  const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);

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

  const filteredPayments = payments.filter(p =>
    p.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
          <p className="text-sm text-green-600 font-medium">Total Collected</p>
          <p className="text-3xl font-bold text-green-700 mt-2">₹{totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-600 font-medium">Total Transactions</p>
          <p className="text-3xl font-bold text-blue-700 mt-2">{payments.length}</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
          <p className="text-sm text-purple-600 font-medium">Today's Collection</p>
          <p className="text-3xl font-bold text-purple-700 mt-2">
            ₹{payments
              .filter(p => new Date(p.payment_date).toDateString() === new Date().toDateString())
              .reduce((sum, p) => sum + parseFloat(p.amount_paid), 0)
              .toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by student or receipt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          className="border rounded-lg px-4 py-2"
        />
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          className="border rounded-lg px-4 py-2"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-medium text-gray-600">Receipt</th>
              <th className="p-4 font-medium text-gray-600">Student</th>
              <th className="p-4 font-medium text-gray-600">Fee Head</th>
              <th className="p-4 font-medium text-gray-600">Amount</th>
              <th className="p-4 font-medium text-gray-600">Date</th>
              <th className="p-4 font-medium text-gray-600">Method</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan="6" className="p-8 text-center">Loading...</td></tr>
            ) : filteredPayments.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">No records found</td></tr>
            ) : (
              filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-4 font-mono text-sm">{p.receipt_number || '-'}</td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{p.student_name}</div>
                    <div className="text-xs text-gray-500">{p.admission_number}</div>
                  </td>
                  <td className="p-4 text-gray-600">{p.fee_type}</td>
                  <td className="p-4 font-medium text-green-600">₹{parseFloat(p.amount_paid).toLocaleString()}</td>
                  <td className="p-4 text-gray-600">{new Date(p.payment_date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(p.payment_method)}`}>
                      {p.payment_method.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// FEE HEADS TAB
// ==========================================
const FeeHeadsTab = () => {
  const queryClient = useQueryClient();
  const [newHead, setNewHead] = useState({ name: '', description: '' });

  const { data: heads = [], isLoading } = useQuery({
    queryKey: ['fee-heads'],
    queryFn: feeAPI.getHeads
  });

  const createMutation = useMutation({
    mutationFn: feeAPI.createHead,
    onSuccess: () => {
      queryClient.invalidateQueries(['fee-heads']);
      setNewHead({ name: '', description: '' });
      toast.success('Fee Head created successfully');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create fee head')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newHead.name) return;
    createMutation.mutate(newHead);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Create Form */}
      <div className="md:col-span-1 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Add Fee Head</h3>
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={newHead.name}
              onChange={(e) => setNewHead({ ...newHead, name: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
              placeholder="e.g. Tuition Fee"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newHead.description}
              onChange={(e) => setNewHead({ ...newHead, description: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
              rows="3"
            />
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Saving...' : 'Create Fee Head'}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="md:col-span-2">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Existing Fee Heads</h3>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 font-medium text-gray-600">Name</th>
                  <th className="p-3 font-medium text-gray-600">Description</th>
                  <th className="p-3 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {heads.map((head) => (
                  <tr key={head.id}>
                    <td className="p-3 font-medium">{head.name}</td>
                    <td className="p-3 text-gray-600">{head.description || '-'}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
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

// ==========================================
// FEE STRUCTURE TAB
// ==========================================
const FeeStructureTab = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    class_id: '',
    fee_head_id: '',
    amount: '',
    academic_year: '2024-2025',
    period_type: 'monthly',
    period_value: '1', // Default to Baisakh (1)
    due_date: '',
    description: ''
  });

  // Fetch Classes & Fee Heads
  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const res = await classesAPI.getAll();
      console.log('Classes API Response:', res);
      return res.data || [];
    }
  });
  const { data: heads = [] } = useQuery({ queryKey: ['fee-heads'], queryFn: feeAPI.getHeads });
  const { data: structures = [], isLoading } = useQuery({
    queryKey: ['fee-structures', formData.class_id],
    queryFn: () => feeAPI.getStructure({ class_id: formData.class_id, academic_year: formData.academic_year }),
    enabled: !!formData.class_id
  });

  const createMutation = useMutation({
    mutationFn: feeAPI.createStructure,
    onSuccess: () => {
      queryClient.invalidateQueries(['fee-structures']);
      toast.success('Fee Structure added');
      setFormData(prev => ({ ...prev, amount: '', description: '' }));
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add structure')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const months = [
    { value: '1', label: 'Baisakh' },
    { value: '2', label: 'Jestha' },
    { value: '3', label: 'Ashad' },
    { value: '4', label: 'Shrawan' },
    { value: '5', label: 'Bhadra' },
    { value: '6', label: 'Ashwin' },
    { value: '7', label: 'Kartik' },
    { value: '8', label: 'Mangsir' },
    { value: '9', label: 'Poush' },
    { value: '10', label: 'Magh' },
    { value: '11', label: 'Falgun' },
    { value: '12', label: 'Chaitra' },
  ];

  return (
    <div className="space-y-8">
      {/* Form */}
      <div className="bg-gray-50 p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Define Fee Structure</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={formData.class_id}
              onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
              required
            >
              <option value="">Select Class</option>
              {Array.isArray(classes) && classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fee Head</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={formData.fee_head_id}
              onChange={(e) => setFormData({ ...formData, fee_head_id: e.target.value })}
              required
            >
              <option value="">Select Fee Head</option>
              {heads.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={formData.period_type}
              onChange={(e) => setFormData({ ...formData, period_type: e.target.value })}
            >
              <option value="monthly">Monthly</option>
              <option value="semester">Semester</option>
              <option value="yearly">Yearly</option>
              <option value="one_time">One Time</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {formData.period_type === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={formData.period_value}
                onChange={(e) => setFormData({ ...formData, period_value: e.target.value })}
              >
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          )}

          {(formData.period_type === 'semester' || formData.period_type === 'custom') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period Name/Value</label>
              <input
                type="text"
                value={formData.period_value}
                onChange={(e) => setFormData({ ...formData, period_value: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
                placeholder={formData.period_type === 'semester' ? 'e.g. 1' : 'e.g. Winter Camp'}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Saving...' : 'Add Fee Structure'}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Fee Structure {formData.class_id && `for Class`}</h3>
        {!formData.class_id ? (
          <p className="text-gray-500 italic">Select a class above to view its fee structure.</p>
        ) : isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 font-medium text-gray-600">Fee Head</th>
                  <th className="p-3 font-medium text-gray-600">Type/Period</th>
                  <th className="p-3 font-medium text-gray-600">Amount</th>
                  <th className="p-3 font-medium text-gray-600">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {structures.map((s) => {
                  let periodLabel = s.period_type;
                  if (s.period_type === 'monthly') {
                    const month = months.find(m => m.value === s.period_value);
                    periodLabel = `Monthly (${month ? month.label : s.period_value})`;
                  } else if (s.period_type === 'semester') {
                    periodLabel = `Semester ${s.period_value}`;
                  } else if (s.period_value) {
                    periodLabel = `${s.period_type} (${s.period_value})`;
                  }

                  return (
                    <tr key={s.id}>
                      <td className="p-3 font-medium">{s.fee_head_name}</td>
                      <td className="p-3 capitalize">{periodLabel}</td>
                      <td className="p-3 font-medium">₹{parseFloat(s.amount).toLocaleString()}</td>
                      <td className="p-3 text-gray-600">{s.due_date ? new Date(s.due_date).toLocaleDateString() : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// COLLECT FEE TAB
// ==========================================
const CollectFeeTab = () => {
  const [studentId, setStudentId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch all students for dropdown (or search in future)
  const { data: studentsResponse } = useQuery({
    queryKey: ['all-students'],
    queryFn: () => studentsAPI.getAll().then(res => res.data)
  });

  const students = studentsResponse?.data || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1 border-r pr-6">
        <h3 className="text-lg font-semibold mb-4">Select Student</h3>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">Search or Enter Student ID</p>

          {/* Simple Student Dropdown for MVP */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Select from List</label>
            <select
              className="w-full border rounded px-3 py-2"
              onChange={(e) => {
                setStudentId(e.target.value);
                setSelectedStudent(e.target.value);
              }}
              value={studentId}
            >
              <option value="">-- Select Student --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name} ({s.admission_number})
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Enter ID Directly</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="border rounded px-3 py-2 w-full"
                placeholder="Student ID"
              />
              <button
                onClick={() => setSelectedStudent(studentId)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="md:col-span-2">
        {selectedStudent ? (
          <StudentFeeCollection studentId={selectedStudent} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a student to collect fees
          </div>
        )}
      </div>
    </div>
  );
};

const StudentFeeCollection = ({ studentId }) => {
  const queryClient = useQueryClient();
  const { data: feeStatus = [], isLoading } = useQuery({
    queryKey: ['student-fees', studentId],
    queryFn: () => feeAPI.getStudentStatus(studentId)
  });

  const collectMutation = useMutation({
    mutationFn: feeAPI.collectFee,
    onSuccess: () => {
      queryClient.invalidateQueries(['student-fees', studentId]);
      queryClient.invalidateQueries(['fee-payments']); // Update dashboard
      toast.success('Payment recorded successfully');
    },
    onError: (err) => toast.error('Failed to record payment')
  });

  const handlePay = (fee) => {
    const amount = prompt(`Enter amount to pay for ${fee.fee_head_name} (Balance: ${fee.balance})`, fee.balance);
    if (!amount) return;

    collectMutation.mutate({
      student_id: studentId,
      fee_structure_id: fee.id,
      amount_paid: amount,
      payment_method: 'cash', // Default, could be selected
      remarks: 'Counter collection'
    });
  };

  if (isLoading) return <p>Loading student details...</p>;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold">Fee Status</h3>
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 font-medium">Fee Head</th>
              <th className="p-3 font-medium">Period</th>
              <th className="p-3 font-medium text-right">Total</th>
              <th className="p-3 font-medium text-right">Paid</th>
              <th className="p-3 font-medium text-right">Balance</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {feeStatus.map((fee) => (
              <tr key={fee.id}>
                <td className="p-3">{fee.fee_head_name}</td>
                <td className="p-3 capitalize">{fee.period_type} {fee.period_value}</td>
                <td className="p-3 text-right">₹{parseFloat(fee.amount).toLocaleString()}</td>
                <td className="p-3 text-right text-green-600">₹{fee.paid_amount.toLocaleString()}</td>
                <td className="p-3 text-right text-red-600 font-medium">₹{fee.balance.toLocaleString()}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${fee.status === 'Paid' ? 'bg-green-100 text-green-800' :
                    fee.status === 'Partial' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                    {fee.status}
                  </span>
                </td>
                <td className="p-3">
                  {fee.balance > 0 && (
                    <button
                      onClick={() => handlePay(fee)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Pay
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeeManagement;