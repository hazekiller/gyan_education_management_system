import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Send, User } from "lucide-react";
import Modal from "../../components/common/Modal";

/**
 * SubjectEnquiryButton Component
 * Direct messaging to assigned teacher for the subject
 */
const SubjectEnquiryButton = ({
  subjectId,
  subjectName,
  teacherId,
  teacherName,
  onClose,
}) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Navigate to messages page with pre-filled context
    navigate("/messages", {
      state: {
        recipientId: teacherId,
        recipientName: teacherName,
        prefillMessage: `Regarding ${subjectName}: ${message}`,
      },
    });

    onClose();
  };

  const handleDirectChat = () => {
    // Navigate directly to chat with teacher
    navigate("/messages", {
      state: {
        recipientId: teacherId,
        recipientName: teacherName,
      },
    });

    onClose();
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Contact Teacher - ${subjectName}`}
    >
      <div className="space-y-6">
        {/* Teacher Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Subject Teacher</p>
              <p className="font-semibold text-gray-900">
                {teacherName || "Not assigned"}
              </p>
            </div>
          </div>
        </div>

        {!teacherId ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No teacher assigned to this subject yet</p>
          </div>
        ) : (
          <>
            {/* Quick Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Enquiry
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="textarea w-full h-32"
                placeholder={`Write your question about ${subjectName}...`}
              />
              <p className="text-xs text-gray-500 mt-1">
                This will open the chat with your message pre-filled
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Enquiry
              </button>
              <button
                onClick={handleDirectChat}
                className="btn btn-outline flex-1 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Open Chat
              </button>
            </div>

            {/* Info */}
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
              <p className="flex items-start gap-2">
                <span className="text-blue-600">💡</span>
                <span>
                  You can ask questions about assignments, clarify doubts, or
                  discuss anything related to {subjectName}.
                </span>
              </p>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default SubjectEnquiryButton;
