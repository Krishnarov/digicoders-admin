// import {
//   Home,
//   UserPlus,
//   UserCheck,
//   UserX,
//   UsersIcon,
//   CreditCard,
//   Plus,
//   CheckCircle,
//   XCircle,
//   GraduationCap,
//   Video,
//   UploadCloud,
//   FileText,
//   BadgePercent,
//   PhoneCall,
//   Projector,
//   Image,
//   Group,
//   Star,
//   ScrollText,
//   Handshake,
//   Trophy,
//   ThumbsUp,
//   Users,
//   GalleryHorizontal,
//   PartyPopper,
//   AlertCircle,
//   Building2,
//   Newspaper,
//   Settings,
//   LogOut,
//   MessageCircle,
//   LayoutList,
//   Send,
//   BookUser,
//   CircleFadingPlus,
//   BadgePlus,
//   QrCode,
//   PointerOffIcon,
//   CalendarCheck,
//   ClipboardCheck,
//   Eye,
//   Clock,
//   Cpu,
//   BookOpen,
//   UserCog,
//   Briefcase,
//   MapPin,
//   Layers,
//   BarChart3,
//   ClipboardList,
//   User,
// } from "lucide-react";

// export const menuItems = [
//   {
//     path: "/dashboard",
//     icon: Home,
//     label: "Dashboard",
//     active: true,
//     roles: ["Admin", "Employee"],
//   },
//   {
//     key: "students",
//     icon: UserPlus,
//     label: "Registrations",
//     hasSubmenu: true,
//     roles: ["Admin", "Employee"],
//     submenu: [
//       {
//         path: "/AddStudent",
//         label: "Add Student",
//         icon: Plus,
//         roles: ["Admin", "Employee"],
//       },
//       {
//         key: "new",
//         path: "/new",
//         label: "New",
//         icon: BadgePlus,
//         roles: ["Admin", "Employee"],
//       },
//       {
//         key: "accepted",
//         path: "/accepted",
//         label: "Accepted",
//         icon: UserCheck,
//         roles: ["Admin", "Employee"],
//       },
//       {
//         key: "rejected",
//         path: "/rejected",
//         label: "Rejected",
//         icon: UserX,
//         roles: ["Admin", "Employee"],
//       },
//       {
//         key: "all",
//         path: "/all-students",
//         label: "All Students",
//         icon: UsersIcon,
//         roles: ["Admin", "Employee"],
//       },
//     ],
//   },

//   {
//     key: "fees",
//     icon: CreditCard,
//     label: "Fee Payments",
//     hasSubmenu: true,
//     roles: ["Admin", "Employee"],
//     submenu: [
//       {
//         path: "/pay-fee",
//         label: "Pay Fee",
//         icon: CreditCard,
//         roles: ["Admin", "Employee"],
//       },
//       {
//         key: "new",
//         path: "/new-fee",
//         label: "New",
//         icon: Plus,
//         roles: ["Admin", "Employee"],
//       },
//       {
//         key: "accepted",
//         path: "/accepted-fee",
//         label: "Accepted",
//         icon: CheckCircle,
//         roles: ["Admin", "Employee"],
//       },
//       {
//         key: "rejected",
//         path: "/rejected-fee",
//         label: "Rejected",
//         icon: XCircle,
//         roles: ["Admin", "Employee"],
//       },
//     ],
//   },
//   {
//     key: "attendance",
//     icon: CalendarCheck,
//     label: "Manage Attendance",
//     hasSubmenu: true,
//     roles: ["Admin", "Employee", "Intern"],
//     submenu: [
//       {
//         path: "/attendance-marking",
//         icon: ClipboardCheck,
//         label: "Attendance Marking",
//         roles: ["Admin", "Employee", "Intern"],
//       },
//       {
//         path: "/attendance-viwe",
//         icon: Eye,
//         label: "Attendance View",
//         roles: ["Admin", "Employee", "Intern"],
//       },
//     ],
//   },
//   {
//     key: "setting",
//     icon: Settings,
//     label: "Manage Settings",
//     hasSubmenu: true,
//     roles: ["Admin"],
//     submenu: [
//       {
//         path: "/duration",
//         icon: Clock,
//         label: "Training Duration",
//         roles: ["Admin", "Employee"],
//       },
//       {
//         path: "/tranning",
//         icon: Projector,
//         label: "Tranning Type",
//         roles: ["Admin", "Employee"],
//       },
//       {
//         path: "/technology",
//         icon: Cpu,
//         label: "Technology",
//         roles: ["Admin", "Employee"],
//       },
//       {
//         path: "/education",
//         icon: GraduationCap,
//         label: "Education",
//         roles: ["Admin", "Employee"],
//       },
//       {
//         path: "/course",
//         icon: BookOpen,
//         label: "Course",
//         roles: ["Admin", "Employee"],
//       },
//       {
//         path: "/collages",
//         icon: Building2,
//         label: "Collages",
//         roles: ["Admin", "Employee"],
//       },

//       {
//         path: "/manage-hr",
//         icon: UserCog,
//         label: "Manage Hr",
//         roles: ["Admin", "Employee"],
//       },
//       {
//         path: "/qr-code",
//         icon: QrCode,
//         label: "Qr Code",
//         roles: ["Admin"],
//       },
//       {
//         path: "/employee",
//         icon: Users,
//         label: "Manage Employee",
//         roles: ["Admin"],
//       },
//       {
//         path: "/teacher",
//         icon: User,
//         label: "Manage Teacher",
//         roles: ["Admin", "Employee"],
//       },
//       {
//         path: "/branchs",
//         icon: MapPin,
//         label: "Manage Branches",
//         roles: ["Admin", "Employee"],
//       },
//       {
//         path: "/batchs",
//         icon: Layers,
//         label: "Manage Batchs",
//         roles: ["Admin", "Employee"],
//       },
//     ],
//   },
//   {
//     key: "Jobs",
//     icon: Briefcase,
//     label: "Manage Jobs",
//     hasSubmenu: true,
//     roles: ["Admin", "Employee", "Intern"],
//     submenu: [
//       {
//         path: "/create-company",
//         icon: Building2,
//         label: "Manage Company",
//         roles: ["Admin", "Employee", "Intern"],
//       },
//       {
//         path: "/create-jobs",
//         icon: Briefcase,
//         label: "Manage Jobs",
//         roles: ["Admin", "Employee", "Intern"],
//       },
//       {
//         path: "/student-assing-job",
//         icon: Handshake,
//         label: "Student Assign Jobs",
//         roles: ["Admin", "Employee", "Intern"],
//       },
//       {
//         path: "/job-applications",
//         icon: FileText,
//         label: "Job Applications",
//         roles: ["Admin", "Employee", "Intern"],
//       },
//     ],
//   },
//   {
//     key: "Reports",
//     icon: BarChart3,
//     label: "Reports",
//     hasSubmenu: true,
//     roles: ["Admin", "Employee", "Intern"],
//     submenu: [
//       {
//         path: "/reg-reoprts",
//         icon: FileText,
//         label: "Registration",
//         roles: ["Admin", "Employee", "Intern"],
//       },
//       {
//         path: "/fee-reports",
//         icon: FileText,
//         label: "Fee",
//         roles: ["Admin", "Employee", "Intern"],
//       },
//       {
//         path: "/absent-stu-reports",
//         icon: UserX,
//         label: "Absent Student",
//         roles: ["Admin", "Employee", "Intern"],
//       },
//       {
//         path: "/attendenc-reports",
//         icon: ClipboardList,
//         label: "Attendenc Reports",
//         roles: ["Admin", "Employee", "Intern"],
//       },
//     ],
//   },
//   {
//     path: "/assignments",
//     icon: ClipboardList,
//     label: "Manage Assignments",
//     roles: ["Admin", "Employee"],
//   },
//   {
//     path: "/profile",
//     icon: User,
//     label: "Profile",
//     roles: ["Admin", "Employee"],
//   },
//   {
//     path: "/",
//     icon: LogOut,
//     label: "Log Out",
//   },
// ];

import {
  Home,
  UserPlus,
  UserCheck,
  UserX,
  UsersIcon,
  CreditCard,
  Plus,
  CheckCircle,
  XCircle,
  GraduationCap,
  Video,
  UploadCloud,
  FileText,
  BadgePercent,
  PhoneCall,
  Projector,
  Image,
  Group,
  Star,
  ScrollText,
  Handshake,
  Trophy,
  ThumbsUp,
  Users,
  GalleryHorizontal,
  PartyPopper,
  AlertCircle,
  Building2,
  Newspaper,
  Settings,
  LogOut,
  MessageCircle,
  LayoutList,
  Send,
  BookUser,
  CircleFadingPlus,
  BadgePlus,
  QrCode,
  PointerOffIcon,
  CalendarCheck,
  ClipboardCheck,
  Eye,
  Clock,
  Cpu,
  BookOpen,
  UserCog,
  Briefcase,
  MapPin,
  Layers,
  BarChart3,
  ClipboardList,
  User,
  Shield,
  Settings2,
} from "lucide-react";

export const menuItems = [
  {
    path: "/dashboard",
    icon: Home,
    label: "Dashboard",
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "view_dashboard"
  },

  // Registrations - Super Admin, Admin, Employee (with permissions)
  {
    key: "students",
    icon: UserPlus,
    label: "Registrations",
    hasSubmenu: true,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "view_registrations",
    submenu: [
      {
        path: "/AddStudent",
        label: "Add Student",
        icon: Plus,
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "add_student"
      },
      {
        key: "new",
        path: "/new",
        label: "New Registrations",
        icon: BadgePlus,
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "view_registrations"
      },
      {
        key: "accepted",
        path: "/accepted",
        label: "Accepted",
        icon: UserCheck,
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "approve_registration"
      },
      {
        key: "rejected",
        path: "/rejected",
        label: "Rejected",
        icon: UserX,
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "reject_registration"
      },
      {
        key: "all",
        path: "/all-students",
        label: "All Students",
        icon: UsersIcon,
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "view_students"
      },
    ],
  },

  // Fee Payments - Super Admin, Admin, Employee (with permissions)
  {
    key: "fees",
    icon: CreditCard,
    label: "Fee Payments",
    hasSubmenu: true,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "view_fee_payments",
    submenu: [
      {
        path: "/pay-fee",
        label: "Collect Fee",
        icon: CreditCard,
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "collect_fee"
      },
      {
        key: "new",
        path: "/new-fee",
        label: "New Payments",
        icon: Plus,
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "view_fee_payments"
      },
      {
        key: "accepted",
        path: "/accepted-fee",
        label: "Accepted",
        icon: CheckCircle,
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "approve_fee"
      },
      {
        key: "rejected",
        path: "/rejected-fee",
        label: "Rejected",
        icon: XCircle,
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "reject_fee"
      },
    ],
  },

  // Attendance - Super Admin, Admin, Employee (with permissions)
  {
    key: "attendance",
    icon: CalendarCheck,
    label: "Attendance",
    hasSubmenu: true,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "view_attendance",
    submenu: [
      {
        path: "/attendance-marking",
        icon: ClipboardCheck,
        label: "Mark Attendance",
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "mark_attendance"
      },
      {
        path: "/attendance-viwe",
        icon: Eye,
        label: "View Attendance",
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "view_attendance"
      },
    ],
  },

  // Assignments - Super Admin, Admin, Employee (with permissions)
  {
    path: "/assignments",
    icon: ClipboardList,
    label: "Assignments",
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "manage_assignments"
  },

  // Jobs - Super Admin, Admin, Employee (with permissions)
  {
    key: "jobs",
    icon: Briefcase,
    label: "Jobs",
    hasSubmenu: true,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "view_job_applications",
    submenu: [
      {
        path: "/create-company",
        icon: Building2,
        label: "Companies",
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "manage_company"
      },
      {
        path: "/create-jobs",
        icon: Briefcase,
        label: "Job Postings",
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "manage_jobs"
      },
      {
        path: "/student-assing-job",
        icon: Handshake,
        label: "Assign Jobs",
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "assign_jobs"
      },
      {
        path: "/job-applications",
        icon: FileText,
        label: "Applications",
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "view_job_applications"
      },
    ],
  },

  // Reports - Super Admin, Admin, Employee (with permissions)
  {
    key: "reports",
    icon: BarChart3,
    label: "Reports",
    hasSubmenu: true,
    roles: ["Super Admin", "Admin", "Employee"],
    submenu: [
      {
        path: "/reg-reoprts",
        icon: FileText,
        label: "Registration",
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "view_registration_reports"
      },
      {
        path: "/fee-reports",
        icon: FileText,
        label: "Fee",
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "view_fee_reports"
      },
      {
        path: "/absent-stu-reports",
        icon: FileText,
        label: "Absent Students",
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "view_attendance_reports"
      },
      {
        path: "/attendenc-reports",
        icon: ClipboardList,
        label: "Attendance",
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "view_attendance_reports"
      },
    ],
  },

  // Settings - Only for Super Admin and Admin
  {
    key: "settings",
    icon: Settings,
    label: "Settings",
    hasSubmenu: true,
    roles: ["Super Admin", "Admin", "Employee"],
    submenu: [
      {
        path: "/duration",
        icon: Clock,
        label: "Training Duration",
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "manage_duration"
      },
      {
        path: "/tranning",
        icon: Projector,
        label: "Training Type",
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "manage_training"
      },
      {
        path: "/technology",
        icon: Cpu,
        label: "Technology",
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "manage_technology"
      },
      {
        path: "/education",
        icon: GraduationCap,
        label: "Education",
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "manage_education"
      },
      {
        path: "/course",
        icon: BookOpen,
        label: "Course",
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "manage_course"
      },
      {
        path: "/collages",
        icon: Building2,
        label: "Colleges",
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "manage_college"
      },
      {
        path: "/branchs",
        icon: MapPin,
        label: "Branches",
        roles: ["Super Admin"],
        requiredPermission: "manage_branch"
      },
      {
        path: "/teacher",
        icon: User,
        label: "Teachers",
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "manage_teacher"
      },
      {
        path: "/batchs",
        icon: Layers,
        label: "Batches",
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "manage_batch"
      },

      // Super Admin Only
      {
        path: "/employee",
        icon: Users,
        label: "Employees",
        roles: ["Super Admin", "Admin"],
        requiredPermission: "manage_employee"
      },
      {
        path: "/manage-hr",
        icon: UserCog,
        label: "HR Management",
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "manage_hr"
      },
      {
        path: "/qr-code",
        icon: QrCode,
        label: "QR Codes",
        roles: ["Super Admin", "Admin", "Employee"],
        requiredPermission: "manage_qrcode"
      },
    ],
  },

  // Profile - All users
  {
    path: "/profile",
    icon: User,
    label: "Profile",
    roles: ["Super Admin", "Admin", "Employee"]
  },

  // Logout
  {
    path: "/logout",
    icon: LogOut,
    label: "Logout",
    roles: ["Super Admin", "Admin", "Employee"]
  },
];

// Helper function to get filtered menu based on user role and permissions
export const getFilteredMenu = (user) => {
  if (!user) return [];

  // If Super Admin, return all menu items (as fresh copies)
  if (user.role === "Super Admin" || user.isSuperAdmin) {
    return menuItems.map(item => ({
      ...item,
      submenu: item.submenu ? [...item.submenu] : undefined
    }));
  }

  // Filter menu based on role and permissions without mutating original data
  return menuItems
    .filter(item => {
      // Check if user has required role
      if (item.roles && !item.roles.includes(user.role)) {
        return false;
      }
      // Check permission for Employee
      if (user.role === "Employee" && item.requiredPermission) {
        if (!user.permissions || !user.permissions.includes(item.requiredPermission)) {
          return false;
        }
      }
      return true;
    })
    .map(item => {
      // Create a fresh copy of the item
      const newItem = { ...item };

      // If it has submenus, filter them into a NEW array
      if (newItem.hasSubmenu && newItem.submenu) {
        newItem.submenu = newItem.submenu.filter(subItem => {
          // Check role
          if (subItem.roles && !subItem.roles.includes(user.role)) {
            return false;
          }
          // Check permission for employees
          if (user.role === "Employee" && subItem.requiredPermission) {
            if (!user.permissions || !user.permissions.includes(subItem.requiredPermission)) {
              return false;
            }
          }
          return true;
        });
      }
      return newItem;
    })
    .filter(item => {
      // Only show parents that have accessible children (if they have submenus)
      if (item.hasSubmenu && item.submenu) {
        return item.submenu.length > 0;
      }
      return true;
    });
};