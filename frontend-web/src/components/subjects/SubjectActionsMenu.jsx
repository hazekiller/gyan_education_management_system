import React, { useState } from "react";
import { FileText, Users, FileCheck, MessageCircle } from "lucide-react";
import SubjectFileManager from "./SubjectFileManager";
import SubjectAttendanceView from "./SubjectAttendanceView";
import SubjectAssignmentIndicator from "./SubjectAssignmentIndicator";
import SubjectEnquiryButton from "./SubjectEnquiryButton";

/**
 * SubjectActionsMenu Component
 * 4-icon action menu for each subject row
 * Displays: Files, Attendance, Assignments, Enquiry
 */
const SubjectActionsMenu = ({ subject, classId, sectionId, teacherId }) => {
  const [activeModal, setActiveModal] = useState(null);

  const actions = [
    {
      id: "files",
      icon: FileText,
      label: "Files",
      color: "text-blue-600",
      bgColor: "bg-blue-100 hover:bg-blue-200",
      description: "Manage subject files and folders",
    },
    {
      id: "attendance",
      icon: Users,
      label: "Attendance",
      color: "text-green-600",
      bgColor: "bg-green-100 hover:bg-green-200",
      description: "View subject-specific attendance",
    },
    {
      id: "assignments",
      icon: FileCheck,
      label: "Assignments",
      color: "text-orange-600",
      bgColor: "bg-orange-100 hover:bg-orange-200",
      description: "Active assignments for this subject",
    },
    {
      id: "enquiry",
      icon: MessageCircle,
      label: "Teacher",
      color: "text-purple-600",
      bgColor: "bg-purple-100 hover:bg-purple-200",
      description: "Contact assigned teacher",
    },
  ];

  const handleActionClick = (actionId) => {
    setActiveModal(actionId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Action Buttons */}
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            onClick={() => handleActionClick(action.id)}
            className={`p-2 rounded-lg transition-all ${action.bgColor} group relative`}
            title={action.description}
          >
            <Icon className={`w-5 h-5 ${action.color}`} />

            {/* Tooltip */}
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {action.label}
            </span>
          </button>
        );
      })}

      {/* Modals */}
      {activeModal === "files" && (
        <SubjectFileManager
          subjectId={subject.subject_id || subject.id}
          subjectName={subject.subject_name || subject.name}
          classId={classId}
          sectionId={sectionId}
          onClose={closeModal}
        />
      )}

      {activeModal === "attendance" && (
        <SubjectAttendanceView
          subjectId={subject.subject_id || subject.id}
          subjectName={subject.subject_name || subject.name}
          classId={classId}
          sectionId={sectionId}
          onClose={closeModal}
        />
      )}

      {activeModal === "assignments" && (
        <SubjectAssignmentIndicator
          subjectId={subject.subject_id || subject.id}
          subjectName={subject.subject_name || subject.name}
          classId={classId}
          sectionId={sectionId}
          onClose={closeModal}
        />
      )}

      {activeModal === "enquiry" && (
        <SubjectEnquiryButton
          subjectId={subject.subject_id || subject.id}
          subjectName={subject.subject_name || subject.name}
          teacherId={
            teacherId ||
            subject.teacher_id ||
            (subject.teacher_ids
              ? parseInt(subject.teacher_ids.split(",")[0])
              : null)
          }
          teacherName={
            subject.teacher_name ||
            (subject.teacher_names ? subject.teacher_names.split(",")[0] : null)
          }
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default SubjectActionsMenu;
