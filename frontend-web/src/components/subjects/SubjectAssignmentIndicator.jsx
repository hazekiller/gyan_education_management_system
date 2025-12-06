import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FileCheck, Clock, CheckCircle2 } from "lucide-react";
import { assignmentsAPI } from "../../lib/api";
import Modal from "../common/Modal";

/**
 * SubjectAssignmentIndicator Component
 * Shows active/inactive assignments with green online dot
 */
const SubjectAssignmentIndicator = ({
  subjectId,
  subjectName,
  classId,
  sectionId,
  onClose,
}) => {
  const navigate = useNavigate();

  // Fetch assignments for this subject
  const { data: assignmentsData, isLoading } = useQuery({
    queryKey: ["subject-assignments", subjectId, classId, sectionId],
    queryFn: () =>
      assignmentsAPI.getAll({
        subject_id: subjectId,
        class_id: classId,
        section_id: sectionId,
      }),
  });

  const assignments = assignmentsData?.data || [];

  // Filter active assignments (due date has not passed)
  const activeAssignments = assignments.filter((assignment) => {
    const dueDate = new Date(assignment.due_date);
    return dueDate >= new Date();
  });

  const completedAssignments = assignments.filter((assignment) => {
    const dueDate = new Date(assignment.due_date);
    return dueDate < new Date();
  });

  const handleAssignmentClick = (assignmentId) => {
    navigate(`/assignments/${assignmentId}`);
    onClose();
  };

  const handleViewAllClick = () => {
    navigate("/assignments", {
      state: {
        subject_id: subjectId,
        class_id: classId,
        section_id: sectionId,
        filter: "all",
      },
    });
    onClose();
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Assignments - ${subjectName}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div
            onClick={() => {
              navigate("/assignments", {
                state: {
                  subject_id: subjectId,
                  class_id: classId,
                  section_id: sectionId,
                  filter: "upcoming",
                },
              });
              onClose();
            }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 cursor-pointer hover:bg-green-100 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-medium text-green-800">Active</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {activeAssignments.length}
            </p>
          </div>

          <div
            onClick={() => {
              navigate("/assignments", {
                state: {
                  subject_id: subjectId,
                  class_id: classId,
                  section_id: sectionId,
                  filter: "overdue",
                },
              });
              onClose();
            }}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-gray-600" />
              <p className="text-sm font-medium text-gray-800">Completed</p>
            </div>
            <p className="text-2xl font-bold text-gray-600">
              {completedAssignments.length}
            </p>
          </div>

          <div
            onClick={handleViewAllClick}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-medium text-blue-800">Total</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {assignments.length}
            </p>
          </div>
        </div>

        {/* Active Assignments */}
        {activeAssignments.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              Active Assignments
            </h3>
            <div className="space-y-3">
              {activeAssignments.map((assignment) => {
                const daysLeft = Math.ceil(
                  (new Date(assignment.due_date) - new Date()) /
                  (1000 * 60 * 60 * 24)
                );

                return (
                  <div
                    key={assignment.id}
                    onClick={() => handleAssignmentClick(assignment.id)}
                    className="border border-green-200 bg-green-50 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {assignment.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {assignment.description}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white">
                        Active
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-orange-600">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">
                          {daysLeft > 0 ? `${daysLeft} days left` : "Due today"}
                        </span>
                      </div>
                      <div className="text-gray-600">
                        Due:{" "}
                        {new Date(assignment.due_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed/Past  Assignments */}
        {completedAssignments.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Past Assignments
            </h3>
            <div className="space-y-2">
              {completedAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  onClick={() => handleAssignmentClick(assignment.id)}
                  className="border rounded-lg p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-700">
                        {assignment.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Due:{" "}
                        {new Date(assignment.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="loading mx-auto"></div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileCheck className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No assignments for this subject yet</p>
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export default SubjectAssignmentIndicator;
