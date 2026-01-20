
import { X, User, ChevronDown, ChevronRight, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { menuItems, getFilteredMenu } from "../routes/menuItems.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import useGetCount from "../hooks/useGetCount.jsx";
import { useSelector } from "react-redux";

function Sidenav({ isOpen, closeSidebar, user }) {
  const { logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({});
  const location = useLocation();
  const counts = useSelector((state) => state.count.data) || {};
  const fetchCount = useGetCount();

  // Get filtered menu based on user role and permissions using the centralized helper
  const filteredMenu = useMemo(() => {
    return getFilteredMenu(user);
  }, [user]);

  const toggleSubmenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  useEffect(() => {
    fetchCount();
    // Poll for counts every 30 seconds for instant-like updates
    const interval = setInterval(() => {
      fetchCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchCount]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={` 
        fixed top-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0 h-screen shadow
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
         flex flex-col
      `}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3 relative">
            <div className="font-extrabold text-3xl">
              Digi<span className="text-orange-400">{"{"}</span>
              <span className="text-green-400">Coders</span>
              <span className="text-orange-400">{"}"}</span>{" "}
            </div>
            <div className=" absolute -bottom-4 right-2 text-xs">
              Technologies (p) Ltd.{" "}
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="lg:hidden p-1 rounded-md hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-8 flex-1 overflow-y-auto " id="hide-scrollbar">
          <ul className="space-y-2 px-2 mb-40">
            {filteredMenu.length === 0 ? (
              <li className="text-center text-gray-400 p-4">
                No menu items available for your role: {user?.role}
              </li>
            ) : (
              filteredMenu.map((item, index) => {
                // Check if main menu or any submenu is active
                const isMenuActive =
                  (item.path && location.pathname === item.path) ||
                  (item.hasSubmenu &&
                    item.submenu?.some((sub) => location.pathname === sub.path));

                return (
                  <li key={index}>
                    {item.hasSubmenu ? (
                      <div>
                        <button
                          onClick={() => toggleSubmenu(item.key)}
                          className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors
                          ${isMenuActive
                              ? "bg-blue-600 text-white"
                              : "text-gray-300 hover:bg-gray-700 hover:text-white"
                            }
                        `}
                        >
                          <div className="flex items-center gap-3 ">
                            <item.icon size={20} />
                            <span className="font-medium whitespace-nowrap">
                              {item.label}
                            </span>

                            {/* Count badge for main menu */}
                            {counts?.[item.key]?.all !== undefined && (
                              <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                                {counts[item.key].all}
                              </span>
                            )}
                          </div>
                          {expandedMenus[item.key] ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </button>
                        {/* Submenu */}
                        {expandedMenus[item.key] && item.submenu && (
                          <ul className="mt-2 ml-4 space-y-1">
                            {item.submenu.map((subItem, subIndex) => {
                              const isSubActive = location.pathname === subItem.path;
                              return (
                                <li key={subIndex}>
                                  <Link
                                    to={subItem.path}
                                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm
                                    ${isSubActive
                                        ? "bg-blue-500 text-white"
                                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                      }
                                  `}
                                  >
                                    <subItem.icon size={16} />
                                    <span>{subItem.label}</span>
                                    {counts?.[item.key]?.[subItem.key] !==
                                      undefined && (
                                        <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                                          {counts[item.key][subItem.key]}
                                        </span>
                                      )}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={item.path}
                        className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                        ${isMenuActive
                            ? "bg-blue-600 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                          }
                      `}
                      >
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </nav>

        <div className="flex-shrink-0 absolute bottom-0 left-0 right-0 py-4 px-1 border-t border-gray-700 bg-gray-900">
          <div className="flex items-center gap-3" onClick={logout}>
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
              <User size={20} className="text-gray-300" />
            </div>
            <div>
              <div className="text-sm font-medium">
                {user?.name}
                {user?.isSuperAdmin && " (Super Admin)"}
              </div>
              <div className="text-xs text-gray-400">
                {user?.email} | Role: {user?.role}
              </div>
            </div>
            <div className="w-10 h-10 flex items-center justify-end ">
              <LogOut size={20} className="text-red-500" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidenav;