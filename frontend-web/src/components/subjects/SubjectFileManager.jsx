import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  Folder,
  File,
  Upload,
  FolderPlus,
  Download,
  Trash2,
  Edit2,
  X,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { subjectFilesAPI } from "../../lib/api";
import Modal from "../common/Modal";

/**
 * SubjectFileManager Component
 * File and folder browser with CRUD operations
 */
const SubjectFileManager = ({
  subjectId,
  subjectName,
  classId,
  sectionId,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role;
  const isStudent = userRole === 'student';
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([
    { id: null, name: subjectName },
  ]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch files/folders
  const { data: filesData, isLoading } = useQuery({
    queryKey: ["subject-files", subjectId, classId, sectionId, currentFolderId],
    queryFn: () =>
      subjectFilesAPI.getFiles({
        subject_id: subjectId,
        class_id: classId,
        section_id: sectionId,
        parent_folder_id: currentFolderId,
      }),
  });

  const files = filesData?.data || [];

  // Upload file mutation
  const uploadMutation = useMutation({
    mutationFn: (formData) => subjectFilesAPI.uploadFile(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(["subject-files"]);
      setShowUploadModal(false);
      setSelectedFile(null);
    },
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: (data) => subjectFilesAPI.createFolder(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["subject-files"]);
      setShowFolderModal(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => subjectFilesAPI.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["subject-files"]);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => subjectFilesAPI.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["subject-files"]);
      setEditingItem(null);
    },
  });

  const handleFolderClick = (folder) => {
    setCurrentFolderId(folder.id);
    setFolderPath([...folderPath, { id: folder.id, name: folder.file_name }]);
  };

  const handleBreadcrumbClick = (index) => {
    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
    setCurrentFolderId(newPath[newPath.length - 1].id);
  };

  const handleFileUpload = (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("subject_id", subjectId);
    formData.append("class_id", classId);
    if (sectionId) formData.append("section_id", sectionId);
    if (currentFolderId) formData.append("parent_folder_id", currentFolderId);

    uploadMutation.mutate(formData);
  };

  const handleCreateFolder = (e) => {
    e.preventDefault();
    const folderName = e.target.folder_name.value;

    createFolderMutation.mutate({
      subject_id: subjectId,
      class_id: classId,
      section_id: sectionId,
      folder_name: folderName,
      parent_folder_id: currentFolderId,
    });
  };

  const handleDownload = async (file) => {
    try {
      const blob = await subjectFilesAPI.downloadFile(file.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "-";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Files - ${subjectName}`}
      size="xl"
    >
      <div className="space-y-4">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          {folderPath.map((folder, index) => (
            <React.Fragment key={folder.id || "root"}>
              {index > 0 && <ChevronRight className="w-4 h-4" />}
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className="hover:text-blue-600 font-medium"
              >
                {folder.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Action Buttons - Only show for teachers/admins */}
        {!isStudent && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn btn-sm btn-primary flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload File
            </button>
            <button
              onClick={() => setShowFolderModal(true)}
              className="btn btn-sm btn-outline flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              New Folder
            </button>
          </div>
        )}

        {isStudent && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              📚 View and download course materials shared by your teacher
            </p>
          </div>
        )}

        {/* Files/Folders List */}
        <div className="border rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="loading mx-auto"></div>
            </div>
          ) : files.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Folder className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No files or folders yet</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Size</th>
                  <th>Uploaded By</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        {item.is_folder ? (
                          <>
                            <Folder className="w-5 h-5 text-blue-500" />
                            <button
                              onClick={() => handleFolderClick(item)}
                              className="font-medium hover:text-blue-600"
                            >
                              {item.file_name}
                            </button>
                          </>
                        ) : (
                          <>
                            <File className="w-5 h-5 text-gray-500" />
                            <span>{item.file_name}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td>{formatFileSize(item.file_size)}</td>
                    <td className="text-sm text-gray-600">
                      {item.uploaded_by_name || "Unknown"}
                    </td>
                    <td className="text-sm text-gray-600">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        {!item.is_folder && (
                          <button
                            onClick={() => handleDownload(item)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-green-600" />
                          </button>
                        )}
                        {!isStudent && (
                          <button
                            onClick={() => deleteMutation.mutate(item.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <Modal
            isOpen={true}
            onClose={() => setShowUploadModal(false)}
            title="Upload File"
          >
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select File
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="input w-full"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Create Folder Modal */}
        {showFolderModal && (
          <Modal
            isOpen={true}
            onClose={() => setShowFolderModal(false)}
            title="Create Folder"
          >
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  name="folder_name"
                  className="input w-full"
                  placeholder="Enter folder name"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createFolderMutation.isPending}
                >
                  {createFolderMutation.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </Modal>
  );
};

export default SubjectFileManager;
