import { Menu, X, Bell, Search, User } from "lucide-react";

function Header({ toggleSidebar, isSidebarOpen, user }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* <div className="relative hidden md:block">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div> */}

        {/* <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            3
          </span>
        </button> */}

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div className="">
            <div className="hidden md:block text-sm font-medium text-gray-700">
              {user?.name}
            </div>
            <div className="hidden text-xs md:block font-medium text-gray-400">
              {user?.role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
export default Header;
