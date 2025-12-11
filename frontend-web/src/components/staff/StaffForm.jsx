import { useState } from 'react';
import toast from 'react-hot-toast';

const StaffForm = ({ staff = null, onSubmit, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState({
        employee_id: staff?.employee_id || '',
        first_name: staff?.first_name || '',
        middle_name: staff?.middle_name || '',
        last_name: staff?.last_name || '',
        email: staff?.email || '',
        password: '', // Only for new staff
        phone: staff?.phone || '',
        date_of_birth: staff?.date_of_birth?.split('T')[0] || '',
        gender: staff?.gender || 'male',
        blood_group: staff?.blood_group || '',
        emergency_contact: staff?.emergency_contact || '',
        designation: staff?.designation || '',
        department: staff?.department || '',
        joining_date: staff?.joining_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        salary: staff?.salary || '',
        shift_timing: staff?.shift_timing || '',
        is_frontdesk: staff?.is_frontdesk || false,
        address: staff?.address || '',
        city: staff?.city || '',
        state: staff?.state || '',
        pincode: staff?.pincode || '',
        status: staff?.status || 'active',
        profile_photo: null
    });

    const handleChange = (e) => {
        const { name, value, files, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: files ? files[0] : type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
            toast.error('Please fill all required fields');
            return;
        }

        if (!formData.employee_id || !formData.date_of_birth || !formData.designation || !formData.gender) {
            toast.error('Please fill all required fields');
            return;
        }

        // Password validation for new staff
        if (!staff && !formData.password) {
            toast.error('Password is required for new staff');
            return;
        }

        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Employee ID *
                        </label>
                        <input
                            type="text"
                            name="employee_id"
                            value={formData.employee_id}
                            onChange={handleChange}
                            className="input"
                            placeholder="e.g., STF2024001"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name *
                        </label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className="input"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Middle Name
                        </label>
                        <input
                            type="text"
                            name="middle_name"
                            value={formData.middle_name}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name *
                        </label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className="input"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="input"
                            required
                        />
                    </div>

                    {!staff && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password *
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input"
                                placeholder="Min 6 characters"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Default: Staff@123 (if left empty)
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone *
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="input"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date of Birth *
                        </label>
                        <input
                            type="date"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleChange}
                            className="input"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gender *
                        </label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="input"
                            required
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Blood Group
                        </label>
                        <select
                            name="blood_group"
                            value={formData.blood_group}
                            onChange={handleChange}
                            className="input"
                        >
                            <option value="">Select Blood Group</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Emergency Contact
                        </label>
                        <input
                            type="tel"
                            name="emergency_contact"
                            value={formData.emergency_contact}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Profile Photo
                        </label>
                        <input
                            type="file"
                            name="profile_photo"
                            onChange={handleChange}
                            accept="image/*"
                            className="input"
                        />
                    </div>
                </div>
            </div>

            {/* Employment Details */}
            <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Employment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Designation *
                        </label>
                        <input
                            type="text"
                            name="designation"
                            value={formData.designation}
                            onChange={handleChange}
                            className="input"
                            placeholder="e.g., Accountant, Guard, Cleaner"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Department
                        </label>
                        <input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className="input"
                            placeholder="e.g., Administration, Security"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Joining Date
                        </label>
                        <input
                            type="date"
                            name="joining_date"
                            value={formData.joining_date}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Salary
                        </label>
                        <input
                            type="number"
                            name="salary"
                            value={formData.salary}
                            onChange={handleChange}
                            className="input"
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_frontdesk"
                                checked={formData.is_frontdesk}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Related to Front Desk
                            </span>
                        </label>
                    </div>

                    {formData.is_frontdesk && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Shift Timing
                            </label>
                            <input
                                type="text"
                                name="shift_timing"
                                value={formData.shift_timing}
                                onChange={handleChange}
                                className="input"
                                placeholder="e.g., 9 AM - 5 PM"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="input"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="resigned">Resigned</option>
                            <option value="retired">Retired</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Address Information */}
            <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Address Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address
                        </label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="input"
                            rows="3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            City
                        </label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            State
                        </label>
                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pincode
                        </label>
                        <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn btn-outline"
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : staff ? 'Update Staff' : 'Add Staff'}
                </button>
            </div>
        </form>
    );
};

export default StaffForm;
