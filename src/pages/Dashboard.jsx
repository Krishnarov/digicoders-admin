import {
  Edit2Icon,
  GitPullRequestArrowIcon,
  LucideProjector,
  RegexIcon,
} from "lucide-react";
import React from "react";

function Dashboard() {
  return (
    <div>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Welcome to Dashboard</h2>
          <p className="text-gray-600">
            This is your main content area. Replace this with your actual
            dashboard content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border-blue-500 border-b-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Registrations
              </h3>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
            </div>
            <div className="bg-blue-500 p-3 text-white rounded-full">
              <Edit2Icon />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border-blue-500 border-b-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Contacts
              </h3>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
            </div>
            <div className="bg-blue-500 p-3 text-white rounded-full">
              <GitPullRequestArrowIcon />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border-blue-500 border-b-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Project Request
              </h3>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
            </div>
            <div className="bg-blue-500 p-3 text-white rounded-full">
              <LucideProjector />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
