import { useState } from "react";
import Header from "../components/Header";
import Sidenav from "../components/Sidenave";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const user = useSelector((state) => state.auth.user);
  // console.log(user);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <ToastContainer />

      {/* Sidebar */}
      <Sidenav isOpen={isSidebarOpen} closeSidebar={closeSidebar} user={user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen ">
        {/* Header */}
        <Header
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          user={user}
        />

        {/* Main Content */}
        <main className="overflow-y-scroll md:py-8  py-6">{children}</main>
      </div>
    </div>
  );
}
export default MainLayout;
