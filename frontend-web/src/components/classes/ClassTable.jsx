// import { useState } from "react";
// import { useQueryClient } from "@tanstack/react-query";
// import { useNavigate } from "react-router-dom";
// import { Edit, Trash2, Eye, Users, BookOpen } from "lucide-react";
// import { classesAPI } from "../../lib/api";
// import Modal from "../common/Modal";
// import ClassForm from "../common/ClassForm";
// import PermissionGuard from "../common/PermissionGuard";
// import { PERMISSIONS } from "../../utils/rbac";
// import toast from "react-hot-toast";

// const ClassTable = ({ classes, isLoading, teachers }) => {
//   const queryClient = useQueryClient();
//   const navigate = useNavigate();
//   const [editClass, setEditClass] = useState(null);
//   const [deleteClass, setDeleteClass] = useState(null);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);

//   const handleEdit = (classItem) => {
//     setEditClass(classItem);
//     setShowEditModal(true);
//   };

//   const handleDelete = (classItem) => {
//     setDeleteClass(classItem);
//     setShowDeleteModal(true);
//   };

//   const handleUpdateClass = async (formData) => {
//     try {
//       await classesAPI.update(editClass.id, formData);
//       toast.success("Class updated successfully!");
//       setShowEditModal(false);
//       setEditClass(null);
//       queryClient.invalidateQueries({ queryKey: ["classes"] });
//     } catch (error) {
//       toast.error(error.message || "Failed to update class");
//     }
//   };

//   const confirmDelete = async () => {
//     try {
//       await classesAPI.delete(deleteClass.id);
//       toast.success("Class deleted successfully!");
//       setShowDeleteModal(false);
//       setDeleteClass(null);
//       queryClient.invalidateQueries({ queryKey: ["classes"] });
//     } catch (error) {
//       toast.error(error.message || "Failed to delete class");
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

//   if (!classes || classes.length === 0) {
//     return (
//       <div className="card text-center py-12">
//         <p className="text-gray-500">No classes found</p>
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
//                   Class Name
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Grade Level
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Class Teacher
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Class Capacity
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Room
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Students
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Academic Year
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
//               {classes.map((classItem) => (
//                 <tr key={classItem.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <div className="flex-shrink-0 h-10 w-10">
//                         <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
//                           <BookOpen className="w-5 h-5 text-purple-600" />
//                         </div>
//                       </div>
//                       <div className="ml-4">
//                         <div className="text-sm font-medium text-gray-900">
//                           {classItem.name}
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           Capacity: {classItem.capacity || 40}
//                         </div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
//                       Grade {classItem.grade_level}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm">
//                       {classItem.class_teacher_name ? (
//                         <div>
//                           <div className="font-medium text-gray-900">
//                             {classItem.class_teacher_name}
//                           </div>
//                           {classItem.teacher_employee_id && (
//                             <div className="text-xs text-gray-500">
//                               ID: {classItem.teacher_employee_id}
//                             </div>
//                           )}
//                         </div>
//                       ) : (
//                         <span className="text-gray-400 italic">
//                           No teacher assigned
//                         </span>
//                       )}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {classItem.capacity || (
//                       <span className="text-gray-400 italic">N/A</span>
//                     )}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {classItem.room_number || (
//                       <span className="text-gray-400 italic">N/A</span>
//                     )}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center text-sm text-gray-900">
//                       <Users className="w-4 h-4 mr-1 text-gray-400" />
//                       {classItem.student_count || 0}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {classItem.academic_year}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span
//                       className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                         classItem.status === "active"
//                           ? "bg-green-100 text-green-800"
//                           : classItem.status === "inactive"
//                           ? "bg-yellow-100 text-yellow-800"
//                           : "bg-gray-100 text-gray-800"
//                       }`}
//                     >
//                       {classItem.status || "active"}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <div className="flex items-center space-x-2">
//                       <button
//                         onClick={() => navigate(`/classes/${classItem.id}`)}
//                         className="text-blue-600 hover:text-blue-900"
//                         title="View Details"
//                       >
//                         <Eye className="w-5 h-5" />
//                       </button>

//                       <PermissionGuard permission={PERMISSIONS.EDIT_CLASSES}>
//                         <button
//                           onClick={() => handleEdit(classItem)}
//                           className="text-green-600 hover:text-green-900"
//                           title="Edit"
//                         >
//                           <Edit className="w-5 h-5" />
//                         </button>
//                       </PermissionGuard>

//                       <PermissionGuard permission={PERMISSIONS.DELETE_CLASSES}>
//                         <button
//                           onClick={() => handleDelete(classItem)}
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
//           setEditClass(null);
//         }}
//         title="Edit Class"
//         size="large"
//       >
//         <ClassForm
//           classItem={editClass}
//           onSubmit={handleUpdateClass}
//           onCancel={() => {
//             setShowEditModal(false);
//             setEditClass(null);
//           }}
//           teachers={teachers}
//         />
//       </Modal>

//       {/* Delete Confirmation Modal */}
//       <Modal
//         isOpen={showDeleteModal}
//         onClose={() => {
//           setShowDeleteModal(false);
//           setDeleteClass(null);
//         }}
//         title="Delete Class"
//       >
//         <div className="space-y-4">
//           <p className="text-gray-600">
//             Are you sure you want to delete <strong>{deleteClass?.name}</strong>
//             ? This action cannot be undone.
//           </p>
//           <div className="flex justify-end space-x-4">
//             <button
//               onClick={() => {
//                 setShowDeleteModal(false);
//                 setDeleteClass(null);
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

// export default ClassTable;
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Eye, Users, BookOpen, ChevronRight } from "lucide-react";
import { classesAPI } from "../../lib/api";
import Modal from "../common/Modal";
import ClassForm from "../common/ClassForm";
import PermissionGuard from "../common/PermissionGuard";
import { PERMISSIONS } from "../../utils/rbac";
import toast from "react-hot-toast";

const ClassTable = ({ classes, isLoading, teachers }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [editClass, setEditClass] = useState(null);
  const [deleteClass, setDeleteClass] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const handleEdit = (classItem) => {
    setEditClass(classItem);
    setShowEditModal(true);
  };

  const handleDelete = (classItem) => {
    setDeleteClass(classItem);
    setShowDeleteModal(true);
  };

  const handleUpdateClass = async (formData) => {
    try {
      await classesAPI.update(editClass.id, formData);
      toast.success("Class updated successfully!");
      setShowEditModal(false);
      setEditClass(null);
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    } catch (error) {
      toast.error(error.message || "Failed to update class");
    }
  };

  const confirmDelete = async () => {
    try {
      await classesAPI.delete(deleteClass.id);
      toast.success("Class deleted successfully!");
      setShowDeleteModal(false);
      setDeleteClass(null);
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    } catch (error) {
      toast.error(error.message || "Failed to delete class");
    }
  };

  const handleClassClick = (classItem) => {
    setSelectedClass(classItem);
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

  if (!classes || classes.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No classes found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar - Class List */}
        <div className="w-80 bg-white border-r border-gray-300 overflow-y-auto">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <h2 className="text-xl font-bold text-gray-900">Classes</h2>
            <p className="text-sm text-gray-600 mt-1">{classes.length} Total Classes</p>
          </div>
          
          <div className="p-4 space-y-2">
            {classes.map((classItem) => (
              <div
                key={classItem.id}
                onClick={() => handleClassClick(classItem)}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                  selectedClass?.id === classItem.id
                    ? "bg-blue-50 border-blue-500 shadow-md"
                    : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedClass?.id === classItem.id
                        ? "bg-blue-500"
                        : "bg-gray-100"
                    }`}>
                      <BookOpen className={`w-5 h-5 ${
                        selectedClass?.id === classItem.id
                          ? "text-white"
                          : "text-gray-600"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {classItem.name}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                          Grade {classItem.grade_level}
                        </span>
                        <span className="text-xs text-gray-500">
                          {classItem.student_count || 0} students
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-transform ${
                    selectedClass?.id === classItem.id
                      ? "text-blue-500 transform translate-x-1"
                      : "text-gray-400"
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content - Class Details */}
        <div className="flex-1 overflow-y-auto">
          {selectedClass ? (
            <div className="p-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold">{selectedClass.name}</h1>
                        <p className="text-blue-100 mt-1">Grade {selectedClass.grade_level}</p>
                      </div>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        selectedClass.status === "active"
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {selectedClass.status || "active"}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="p-6 grid grid-cols-2 gap-6">
                  {/* Class Teacher */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Class Teacher
                    </div>
                    {selectedClass.class_teacher_name ? (
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {selectedClass.class_teacher_name}
                        </div>
                        {selectedClass.teacher_employee_id && (
                          <div className="text-sm text-gray-600 mt-1">
                            ID: {selectedClass.teacher_employee_id}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">No teacher assigned</span>
                    )}
                  </div>

                  {/* Academic Year */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Academic Year
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {selectedClass.academic_year}
                    </div>
                  </div>

                  {/* Class Capacity */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Class Capacity
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {selectedClass.capacity || "40"}
                    </div>
                  </div>

                  {/* Room Number */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Room Number
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {selectedClass.room_number || (
                        <span className="text-gray-400 italic">N/A</span>
                      )}
                    </div>
                  </div>

                  {/* Students Count */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Total Students
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      <span className="text-lg font-semibold text-gray-900">
                        {selectedClass.student_count || 0}
                      </span>
                    </div>
                  </div>

                  {/* Grade Level */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Grade Level
                    </div>
                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                      Grade {selectedClass.grade_level}
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
                        onClick={() => navigate(`/classes/${selectedClass.id}`)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>

                      <PermissionGuard permission={PERMISSIONS.EDIT_CLASSES}>
                        <button
                          onClick={() => handleEdit(selectedClass)}
                          className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors shadow-sm"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                      </PermissionGuard>

                      <PermissionGuard permission={PERMISSIONS.DELETE_CLASSES}>
                        <button
                          onClick={() => handleDelete(selectedClass)}
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
                <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Select a Class
                </h3>
                <p className="text-gray-500">
                  Choose a class from the sidebar to view details
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
          setEditClass(null);
        }}
        title="Edit Class"
        size="large"
      >
        <ClassForm
          classItem={editClass}
          onSubmit={handleUpdateClass}
          onCancel={() => {
            setShowEditModal(false);
            setEditClass(null);
          }}
          teachers={teachers}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteClass(null);
        }}
        title="Delete Class"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{deleteClass?.name}</strong>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteClass(null);
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

export default ClassTable;