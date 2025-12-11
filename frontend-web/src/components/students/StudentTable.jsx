// import { useState } from "react";
// import { useQueryClient } from "@tanstack/react-query";
// import { useNavigate } from "react-router-dom";
// import { Edit, Trash2, Eye, MoreVertical } from "lucide-react";
// import { studentsAPI } from "../../lib/api";
// import Modal from "../common/Modal";
// import StudentForm from "../common/StudentForm";
// import PermissionGuard from "../common/PermissionGuard";
// import { PERMISSIONS } from "../../utils/rbac";
// import toast from "react-hot-toast";

// const StudentTable = ({ students, isLoading }) => {
//   const queryClient = useQueryClient();
//   const navigate = useNavigate();
//   const [editStudent, setEditStudent] = useState(null);
//   const [deleteStudent, setDeleteStudent] = useState(null);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);

//   const handleEdit = (student) => {
//     setEditStudent(student);
//     setShowEditModal(true);
//   };

//   const handleDelete = (student) => {
//     setDeleteStudent(student);
//     setShowDeleteModal(true);
//   };

//   const handleUpdateStudent = async (formData) => {
//     try {
//       await studentsAPI.update(editStudent.id, formData);
//       toast.success("Student updated successfully!");
//       setShowEditModal(false);
//       setEditStudent(null);
//       queryClient.invalidateQueries({ queryKey: ["students"] });
//       queryClient.invalidateQueries({ queryKey: ["classes"] });
//       queryClient.invalidateQueries({ queryKey: ["class"] });
//     } catch (error) {
//       toast.error(error.message || "Failed to update student");
//     }
//   };

//   const confirmDelete = async () => {
//     try {
//       await studentsAPI.delete(deleteStudent.id);
//       toast.success("Student deleted successfully!");
//       setShowDeleteModal(false);
//       setDeleteStudent(null);
//       queryClient.invalidateQueries({ queryKey: ["students"] });
//       queryClient.invalidateQueries({ queryKey: ["classes"] });
//       queryClient.invalidateQueries({ queryKey: ["class"] });
//     } catch (error) {
//       toast.error(error.message || "Failed to delete student");
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="card">
//         <div className="animate-pulse space-y-4">
//           {[...Array(5)].map((_, i) => (
//             <div key={i} className="h-16 bg-gray-200 rounded"></div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   if (!students || students.length === 0) {
//     return (
//       <div className="card text-center py-12">
//         <p className="text-gray-500">No students found</p>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="card overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Student
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Admission No
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Class
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Parent Contact
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {students.map((student) => (
//                 <tr key={student.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <div className="flex-shrink-0 h-10 w-10">
//                         <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
//                           <span className="text-blue-600 font-semibold">
//                             {student.first_name?.charAt(0)}
//                             {student.last_name?.charAt(0)}
//                           </span>
//                         </div>
//                       </div>
//                       <div className="ml-4">
//                         <div className="text-sm font-medium text-gray-900">
//                           {student.first_name} {student.last_name}
//                         </div>
//                         <div className="text-sm text-gray-500">
//                           {student.email}
//                         </div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {student.admission_number}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {student.class_name}{" "}
//                     {student.section_name && `- ${student.section_name}`}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {student.parent_phone}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span
//                       className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                         student.status === "active"
//                           ? "bg-green-100 text-green-800"
//                           : "bg-red-100 text-red-800"
//                       }`}
//                     >
//                       {student.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <div className="flex items-center space-x-2">
//                       <button
//                         onClick={() => navigate(`/students/${student.id}`)}
//                         className="text-blue-600 hover:text-blue-900"
//                         title="View Details"
//                       >
//                         <Eye className="w-5 h-5" />
//                       </button>

//                       <PermissionGuard permission={PERMISSIONS.EDIT_STUDENTS}>
//                         <button
//                           onClick={() => handleEdit(student)}
//                           className="text-green-600 hover:text-green-900"
//                           title="Edit"
//                         >
//                           <Edit className="w-5 h-5" />
//                         </button>
//                       </PermissionGuard>

//                       <PermissionGuard permission={PERMISSIONS.DELETE_STUDENTS}>
//                         <button
//                           onClick={() => handleDelete(student)}
//                           className="text-red-600 hover:text-red-900"
//                           title="Delete"
//                         >
//                           <Trash2 className="w-5 h-5" />
//                         </button>
//                       </PermissionGuard>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Edit Modal */}
//       <Modal
//         isOpen={showEditModal}
//         onClose={() => {
//           setShowEditModal(false);
//           setEditStudent(null);
//         }}
//         title="Edit Student"
//         size="md"
//       >
//         <StudentForm
//           student={editStudent}
//           onSubmit={handleUpdateStudent}
//           onCancel={() => {
//             setShowEditModal(false);
//             setEditStudent(null);
//           }}
//         />
//       </Modal>

//       {/* Delete Confirmation Modal */}
//       <Modal
//         isOpen={showDeleteModal}
//         onClose={() => {
//           setShowDeleteModal(false);
//           setDeleteStudent(null);
//         }}
//         title="Delete Student"
//       >
//         <div className="space-y-4">
//           <p className="text-gray-600">
//             Are you sure you want to delete{" "}
//             <strong>
//               {deleteStudent?.first_name} {deleteStudent?.last_name}
//             </strong>
//             ? This action cannot be undone.
//           </p>
//           <div className="flex justify-end space-x-4">
//             <button
//               onClick={() => {
//                 setShowDeleteModal(false);
//                 setDeleteStudent(null);
//               }}
//               className="btn btn-outline"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={confirmDelete}
//               className="btn bg-red-600 hover:bg-red-700 text-white"
//             >
//               Delete
//             </button>
//           </div>
//         </div>
//       </Modal>
//     </>
//   );
// };

// export default StudentTable;
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Eye, Users, User, ChevronRight } from "lucide-react";
import { studentsAPI } from "../../lib/api";
import Modal from "../common/Modal";
import StudentForm from "../common/StudentForm";
import PermissionGuard from "../common/PermissionGuard";
import { PERMISSIONS } from "../../utils/rbac";
import toast from "react-hot-toast";

const StudentTable = ({ students, isLoading }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [editStudent, setEditStudent] = useState(null);
  const [deleteStudent, setDeleteStudent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleEdit = (student) => {
    setEditStudent(student);
    setShowEditModal(true);
  };

  const handleDelete = (student) => {
    setDeleteStudent(student);
    setShowDeleteModal(true);
  };

  const handleUpdateStudent = async (formData) => {
    try {
      await studentsAPI.update(editStudent.id, formData);
      toast.success("Student updated successfully!");
      setShowEditModal(false);
      setEditStudent(null);
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["class"] });
    } catch (error) {
      toast.error(error.message || "Failed to update student");
    }
  };

  const confirmDelete = async () => {
    try {
      await studentsAPI.delete(deleteStudent.id);
      toast.success("Student deleted successfully!");
      setShowDeleteModal(false);
      setDeleteStudent(null);
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["class"] });
    } catch (error) {
      toast.error(error.message || "Failed to delete student");
    }
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="w-80 bg-white border-r border-gray-200 p-4">
          <div className="animate-pulse space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No students found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar - Student List */}
        <div className="w-80 bg-white border-r border-gray-300 overflow-y-auto">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <h2 className="text-xl font-bold text-gray-900">Students</h2>
            <p className="text-sm text-gray-600 mt-1">{students.length} Total Students</p>
          </div>
          
          <div className="p-4 space-y-2">
            {students.map((student) => (
              <div
                key={student.id}
                onClick={() => handleStudentClick(student)}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                  selectedStudent?.id === student.id
                    ? "bg-blue-50 border-blue-500 shadow-md"
                    : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedStudent?.id === student.id
                        ? "bg-blue-500"
                        : "bg-gray-100"
                    }`}>
                      <User className={`w-5 h-5 ${
                        selectedStudent?.id === student.id
                          ? "text-white"
                          : "text-gray-600"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {student.first_name} {student.last_name}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                          {student.class_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {student.admission_number}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-transform ${
                    selectedStudent?.id === student.id
                      ? "text-blue-500 transform translate-x-1"
                      : "text-gray-400"
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content - Student Details */}
        <div className="flex-1 overflow-y-auto">
          {selectedStudent ? (
            <div className="p-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold">
                          {selectedStudent.first_name} {selectedStudent.last_name}
                        </h1>
                        <p className="text-blue-100 mt-1">
                          {selectedStudent.admission_number}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        selectedStudent.status === "active"
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {selectedStudent.status || "active"}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="p-6 grid grid-cols-2 gap-6">
                  {/* Class Info */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Class
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {selectedStudent.class_name}
                      {selectedStudent.section_name && ` - ${selectedStudent.section_name}`}
                    </div>
                  </div>

                  {/* Parent Contact */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Parent Contact
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {selectedStudent.parent_phone}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Email
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {selectedStudent.email}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Status
                    </div>
                    <span className="inline-flex px-4 py-2 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      {selectedStudent.status}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </h3>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => navigate(`/students/${selectedStudent.id}`)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>

                      <PermissionGuard permission={PERMISSIONS.EDIT_STUDENTS}>
                        <button
                          onClick={() => handleEdit(selectedStudent)}
                          className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors shadow-sm"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                      </PermissionGuard>

                      <PermissionGuard permission={PERMISSIONS.DELETE_STUDENTS}>
                        <button
                          onClick={() => handleDelete(selectedStudent)}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-colors shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </PermissionGuard>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Select a Student
                </h3>
                <p className="text-gray-500">
                  Choose a student from the sidebar to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditStudent(null);
        }}
        title="Edit Student"
        size="large"
      >
        <StudentForm
          student={editStudent}
          onSubmit={handleUpdateStudent}
          onCancel={() => {
            setShowEditModal(false);
            setEditStudent(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteStudent(null);
        }}
        title="Delete Student"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete{" "}
            <strong>{deleteStudent?.first_name} {deleteStudent?.last_name}</strong>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteStudent(null);
              }}
              className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default StudentTable;

