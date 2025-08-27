import {
  Edit2Icon,
  GitPullRequestArrowIcon,
  LucideProjector,
  RegexIcon,
} from "lucide-react";
import React, { use } from "react";
import { useSelector } from "react-redux";

function Dashboard() {
  const counts=useSelector((state) => state.count.data)
console.log(counts);

  
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
               All Registrations
              </h3>
              <p className="text-2xl font-bold text-gray-900">{counts?.students?.all}</p>
            </div>
            <div className="bg-blue-500 p-3 text-white rounded-full">
              <Edit2Icon />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border-blue-500 border-b-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                 New Registrations
              </h3>
              <p className="text-2xl font-bold text-gray-900">{counts?.students?.new}</p>
            </div>
            <div className="bg-blue-500 p-3 text-white rounded-full">
              <GitPullRequestArrowIcon />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border-blue-500 border-b-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Accepted Registrations
              </h3>
              <p className="text-2xl font-bold text-gray-900">{counts?.students?.accepted}</p>
            </div>
            <div className="bg-blue-500 p-3 text-white rounded-full">
              <LucideProjector />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border-blue-500 border-b-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Rejected Registrations
              </h3>
              <p className="text-2xl font-bold text-gray-900">{counts?.students?.rejected}</p>
            </div>
            <div className="bg-blue-500 p-3 text-white rounded-full">
              <RegexIcon />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border-blue-500 border-b-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                 Total Active Batchs
              </h3>
              <p className="text-2xl font-bold text-gray-900">{counts?.batchCount}</p>
            </div>
            <div className="bg-blue-500 p-3 text-white rounded-full">
              <RegexIcon />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border-blue-500 border-b-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                 Total Teachers
              </h3>
              <p className="text-2xl font-bold text-gray-900">{counts?.teachersCount}</p>
            </div>
            <div className="bg-blue-500 p-3 text-white rounded-full">
              <RegexIcon />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
