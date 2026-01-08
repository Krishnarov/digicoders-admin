// import {
//   Edit2Icon,
//   GitPullRequestArrowIcon,
//   LucideProjector,
//   RegexIcon,
// } from "lucide-react";
// import React, { use } from "react";
// import { useSelector } from "react-redux";

// function Dashboard() {
//   const counts = useSelector((state) => state.count.data)


//   return (
//     <div className="p-6">
//       <div className="space-y-6">
//         <div className="bg-white p-6 rounded-lg shadow-sm">
//           <h2 className="text-xl font-bold ">Welcome to Dashboard</h2>
//           {/* <p className="text-gray-600">
//             This is your main content area. Replace this with your actual
//             dashboard content.
//           </p> */}
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border-blue-500 border-b-4">
//             <div>
//               <h3 className="text-sm font-medium text-gray-500 mb-2">
//                 All Registrations
//               </h3>
//               <p className="text-2xl font-bold text-gray-900">{counts?.students?.all}</p>
//             </div>
//             <div className="bg-blue-500 p-3 text-white rounded-full">
//               <Edit2Icon />
//             </div>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border-blue-500 border-b-4">
//             <div>
//               <h3 className="text-sm font-medium text-gray-500 mb-2">
//                 New Registrations
//               </h3>
//               <p className="text-2xl font-bold text-gray-900">{counts?.students?.new}</p>
//             </div>
//             <div className="bg-blue-500 p-3 text-white rounded-full">
//               <GitPullRequestArrowIcon />
//             </div>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border-blue-500 border-b-4">
//             <div>
//               <h3 className="text-sm font-medium text-gray-500 mb-2">
//                 Accepted Registrations
//               </h3>
//               <p className="text-2xl font-bold text-gray-900">{counts?.students?.accepted}</p>
//             </div>
//             <div className="bg-blue-500 p-3 text-white rounded-full">
//               <LucideProjector />
//             </div>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border-blue-500 border-b-4">
//             <div>
//               <h3 className="text-sm font-medium text-gray-500 mb-2">
//                 Rejected Registrations
//               </h3>
//               <p className="text-2xl font-bold text-gray-900">{counts?.students?.rejected}</p>
//             </div>
//             <div className="bg-blue-500 p-3 text-white rounded-full">
//               <RegexIcon />
//             </div>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border-blue-500 border-b-4">
//             <div>
//               <h3 className="text-sm font-medium text-gray-500 mb-2">
//                 Total Active Batchs
//               </h3>
//               <p className="text-2xl font-bold text-gray-900">{counts?.batchCount}</p>
//             </div>
//             <div className="bg-blue-500 p-3 text-white rounded-full">
//               <RegexIcon />
//             </div>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border-blue-500 border-b-4">
//             <div>
//               <h3 className="text-sm font-medium text-gray-500 mb-2">
//                 Total Teachers
//               </h3>
//               <p className="text-2xl font-bold text-gray-900">{counts?.teachersCount}</p>
//             </div>
//             <div className="bg-blue-500 p-3 text-white rounded-full">
//               <RegexIcon />
//             </div>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border-blue-500 border-b-4">
//             <div>
//               <h3 className="text-sm font-medium text-gray-500 mb-2">
//                 Total Branches
//               </h3>
//               <p className="text-2xl font-bold text-gray-900">{counts?.branchCount}</p>
//             </div>
//             <div className="bg-blue-500 p-3 text-white rounded-full">
//               <RegexIcon />
//             </div>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border-blue-500 border-b-4">
//             <div>
//               <h3 className="text-sm font-medium text-gray-500 mb-2">
//                 Total Colleges
//               </h3>
//               <p className="text-2xl font-bold text-gray-900">{counts?.collegeCount}</p>
//             </div>
//             <div className="bg-blue-500 p-3 text-white rounded-full">
//               <RegexIcon />
//             </div>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border-blue-500 border-b-4">
//             <div>
//               <h3 className="text-sm font-medium text-gray-500 mb-2">
//                 Total HR
//               </h3>
//               <p className="text-2xl font-bold text-gray-900">{counts?.manageHrCount}</p>
//             </div>
//             <div className="bg-blue-500 p-3 text-white rounded-full">
//               <RegexIcon />
//             </div>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border-blue-500 border-b-4">
//             <div>
//               <h3 className="text-sm font-medium text-gray-500 mb-2">
//                 Total Technology
//               </h3>
//               <p className="text-2xl font-bold text-gray-900">{counts?.technologyCount}</p>
//             </div>
//             <div className="bg-blue-500 p-3 text-white rounded-full">
//               <RegexIcon />
//             </div>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border-blue-500 border-b-4">
//             <div>
//               <h3 className="text-sm font-medium text-gray-500 mb-2">
//                 Total Tranning
//               </h3>
//               <p className="text-2xl font-bold text-gray-900">{counts?.tranningCount}</p>
//             </div>
//             <div className="bg-blue-500 p-3 text-white rounded-full">
//               <RegexIcon />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Dashboard;
import React from "react";
import { useSelector } from "react-redux";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Layers,
  GraduationCap,
  Building,
  Briefcase,
  Cpu,
  BookOpen,
  Users2,
  BarChart3,
  TrendingUp,
  Calendar,
  ChevronRight
} from "lucide-react";

function Dashboard() {
  const counts = useSelector((state) => state.count.data);

  // Card data for better organization
  const cardData = [
    {
      title: "All Registrations",
      value: counts?.students?.all || 0,
      icon: Users,
      color: "bg-blue-500",
      borderColor: "border-blue-500",
      textColor: "text-blue-600",
      trend: "+12%",
      description: "Total student registrations"
    },
    {
      title: "New Registrations",
      value: counts?.students?.new || 0,
      icon: UserPlus,
      color: "bg-emerald-500",
      borderColor: "border-emerald-500",
      textColor: "text-emerald-600",
      trend: "+5%",
      description: "Pending review"
    },
    {
      title: "Accepted",
      value: counts?.students?.accepted || 0,
      icon: UserCheck,
      color: "bg-green-500",
      borderColor: "border-green-500",
      textColor: "text-green-600",
      trend: "+8%",
      description: "Approved registrations"
    },
    {
      title: "Rejected",
      value: counts?.students?.rejected || 0,
      icon: UserX,
      color: "bg-rose-500",
      borderColor: "border-rose-500",
      textColor: "text-rose-600",
      trend: "-2%",
      description: "Not approved"
    },
    {
      title: "Active Batches",
      value: counts?.batchCount || 0,
      icon: Layers,
      color: "bg-indigo-500",
      borderColor: "border-indigo-500",
      textColor: "text-indigo-600",
      trend: "+3",
      description: "Currently running"
    },
    {
      title: "Teachers",
      value: counts?.teachersCount || 0,
      icon: GraduationCap,
      color: "bg-amber-500",
      borderColor: "border-amber-500",
      textColor: "text-amber-600",
      trend: "+2",
      description: "Active faculty"
    },
    {
      title: "Branches",
      value: counts?.branchCount || 0,
      icon: Building,
      color: "bg-cyan-500",
      borderColor: "border-cyan-500",
      textColor: "text-cyan-600",
      trend: "+1",
      description: "Branch locations"
    },
    {
      title: "Colleges",
      value: counts?.collegeCount || 0,
      icon: Building,
      color: "bg-purple-500",
      borderColor: "border-purple-500",
      textColor: "text-purple-600",
      trend: "+4",
      description: "Partner institutions"
    },
    {
      title: "HR Team",
      value: counts?.manageHrCount || 0,
      icon: Briefcase,
      color: "bg-pink-500",
      borderColor: "border-pink-500",
      textColor: "text-pink-600",
      trend: "+1",
      description: "HR personnel"
    },
    {
      title: "Technologies",
      value: counts?.technologyCount || 0,
      icon: Cpu,
      color: "bg-teal-500",
      borderColor: "border-teal-500",
      textColor: "text-teal-600",
      trend: "+5",
      description: "Tech stacks"
    },
    {
      title: "Training Programs",
      value: counts?.tranningCount || 0,
      icon: BookOpen,
      color: "bg-orange-500",
      borderColor: "border-orange-500",
      textColor: "text-orange-600",
      trend: "+3",
      description: "Active programs"
    }
  ];

  const statsCards = [
    {
      title: "Monthly Growth",
      value: "24%",
      icon: TrendingUp,
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
      change: "+2.5%"
    },
    {
      title: "Completion Rate",
      value: "89%",
      icon: BarChart3,
      color: "bg-gradient-to-r from-green-500 to-emerald-500",
      change: "+1.2%"
    },
    {
      title: "Active Sessions",
      value: "47",
      icon: Users2,
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
      change: "+8"
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-2">Welcome to your management dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              <Calendar className="inline-block w-4 h-4 mr-2" />
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Quick Stats Section */}
        <div className="">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cardData.slice(0, 8).map((card, index) => {
              const Icon = card.icon;
              return (
                <div key={index} className={`bg-white rounded-lg border-l-4 ${card.borderColor} p-5 shadow-sm hover:shadow-md transition-shadow duration-200`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                    </div>
                    <div className={`${card.color} p-3 rounded-lg text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className={`text-xs font-medium ${card.textColor}`}>
                      <TrendingUp className="inline w-3 h-3 mr-1" />
                      {card.trend}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">vs last month</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Metrics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Student Metrics */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Registration Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cardData.slice(0, 4).map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center">
                            <div className={`${card.color} p-2 rounded-md mr-3`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{card.title}</span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900 mt-3">{card.value}</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs px-2 py-1 rounded-full ${card.textColor} bg-opacity-10 ${card.textColor.replace('text-', 'bg-')}`}>
                            {card.trend}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">this month</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress bar for visual representation */}
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Registration Status Distribution</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Accepted</span>
                      <span>{counts?.students?.accepted || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${((counts?.students?.accepted || 0) / (counts?.students?.all || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>New</span>
                      <span>{counts?.students?.new || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${((counts?.students?.new || 0) / (counts?.students?.all || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Rejected</span>
                      <span>{counts?.students?.rejected || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-rose-500 h-2 rounded-full"
                        style={{ width: `${((counts?.students?.rejected || 0) / (counts?.students?.all || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - System Metrics */}
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 h-full">
              <h2 className="text-xl font-bold text-gray-900 mb-6">System Overview</h2>
              <div className="space-y-6">
                {cardData.slice(4).map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center">
                        <div className={`${card.color} p-2 rounded-md mr-3`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{card.title}</p>
                          <p className="text-xs text-gray-500">{card.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{card.value}</p>
                        <p className={`text-xs ${card.textColor}`}>{card.trend}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>


      </div>
    </div>
  );
}

export default Dashboard;