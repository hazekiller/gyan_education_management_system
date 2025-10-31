import { GraduationCap } from 'lucide-react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gyan School
          </h1>
          <p className="text-gray-600">
            School Management System
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {children}
        </div>

        <div className="text-center mt-8 text-sm text-gray-600">
          <p>&copy; 2024 Gyan School. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;