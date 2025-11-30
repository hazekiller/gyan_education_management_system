import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { classesAPI } from "../../lib/api";

const AdmissionForm = ({ admission, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "male",
    class_applied_for: "",
    previous_school: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    status: "pending",
    remarks: "",
  });

  // Fetch classes for dropdown
  const { data: classesData } = useQuery({
    queryKey: ["classes"],
    queryFn: () => classesAPI.getAll({ status: "active" }),
  });

  useEffect(() => {
    if (admission) {
      setFormData({
        first_name: admission.first_name || "",
        middle_name: admission.middle_name || "",
        last_name: admission.last_name || "",
        date_of_birth: admission.date_of_birth
          ? admission.date_of_birth.split("T")[0]
          : "",
        gender: admission.gender || "male",
        class_applied_for: admission.class_applied_for || "",
        previous_school: admission.previous_school || "",
        parent_name: admission.parent_name || "",
        parent_phone: admission.parent_phone || "",
        parent_email: admission.parent_email || "",
        address: admission.address || "",
        city: admission.city || "",
        state: admission.state || "",
        pincode: admission.pincode || "",
        status: admission.status || "pending",
        remarks: admission.remarks || "",
      });
    }
  }, [admission]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
          Student Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Middle Name
            </label>
            <input
              type="text"
              name="middle_name"
              value={formData.middle_name}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth *
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="input w-full"
              required
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Application Details */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
          Application Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class Applied For *
            </label>
            <select
              name="class_applied_for"
              value={formData.class_applied_for}
              onChange={handleChange}
              className="input w-full"
              required
            >
              <option value="">Select Class</option>
              {classesData?.data?.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Previous School
            </label>
            <input
              type="text"
              name="previous_school"
              value={formData.previous_school}
              onChange={handleChange}
              className="input w-full"
              placeholder="Name of previous school"
            />
          </div>
        </div>
      </div>

      {/* Parent Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
          Parent/Guardian Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent Name *
            </label>
            <input
              type="text"
              name="parent_name"
              value={formData.parent_name}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              name="parent_phone"
              value={formData.parent_phone}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="parent_email"
              value={formData.parent_email}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
          Address Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="input w-full"
              rows="2"
              required
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pincode
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
        </div>
      </div>

      {/* Status & Remarks (Only for existing admissions) */}
      {admission && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
            Office Use Only
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input w-full"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="admitted">Admitted</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className="input w-full"
                rows="2"
              ></textarea>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-4 pt-4 border-t">
        <button type="button" onClick={onCancel} className="btn btn-outline">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {admission ? "Update Admission" : "Submit Application"}
        </button>
      </div>
    </form>
  );
};

export default AdmissionForm;
