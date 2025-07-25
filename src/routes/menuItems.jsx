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
} from "lucide-react";

export const menuItems = [
  {
    path: "/dashboard",
    icon: Home,
    label: "Dashboard",
    active: true,
  },
  {
    key: "registrations",
    icon: UserPlus,
    label: "Registrations",
    hasSubmenu: true,
    submenu: [
      { path: "/AddStudent", label: "Add Student", icon: Plus },
      { path: "/new", label: "New", icon: BadgePlus },
      { path: "/accepted", label: "Accepted", icon: UserCheck },
      { path: "/rejected", label: "Rejected", icon: UserX },
      {path: "/all-students", label: "All Students", icon: UsersIcon,},
    ],
  },
  {
    path: "/tranning",
    icon: BookUser,
    label: "Tranning Type",
  },
  {
    path: "/technology",
    icon: BookUser,
    label: "Technology",
  },
  {
    path: "/education",
    icon: BookUser,
    label: "Education",
  },
  {
    key: "fee-payments",
    icon: CreditCard,
    label: "Fee Payments",
    hasSubmenu: true,
    submenu: [
      { path: "/pay-fee", label: "Pay Fee", icon: CreditCard },
      { path: "/new-fee", label: "New", icon: Plus },
      { path: "/accepted-fee", label: "Accepted", icon: CheckCircle },
      { path: "/rejected-fee", label: "Rejected", icon: XCircle },
    ],
  },

  {
    path: "/manage-teacher",
    icon: BookUser,
    label: "Manage Teacher",
  },
  {
    path: "/manage-batch",
    icon: LayoutList,
    label: "Manage Batch",
  },
  {
    path: "/manage-attendance",
    icon: CheckCircle,
    label: "Manage Attendance",
  },
  {
    path: "/manage-assignment",
    icon: FileText,
    label: "Upload Assignment",
  },
  {
    path: "/studentvideo",
    icon: Video,
    label: "Stu. video link",
  },
  {
    path: "/UploadPhotos",
    icon: UploadCloud,
    label: "Stu. upload photo",
  },
  {
    path: "/blog",
    icon: ScrollText,
    label: "Manage Blogs",
  },
  {
    path: "/ManageCoupon",
    icon: BadgePercent,
    label: "Manage Coupon",
  },
  {
    path: "/Contact",
    icon: PhoneCall,
    label: "Contact",
  },
  {
    path: "/ManageFinalYearProject",
    icon: Projector,
    label: "Project Request",
  },
  {
    path: "/ManageBanner",
    icon: Image,
    label: "Manage Banner",
  },
  {
    path: "/expert",
    icon: Users,
    label: "Manage Expert",
  },
  {
    path: "/Intern",
    icon: UserCheck,
    label: "Manage Intern",
  },
  {
    path: "/ManageWebinar",
    icon: Video,
    label: "Manage Webinar",
  },
  {
    path: "/ManageExpertList",
    icon: Group,
    label: "Manage Team",
  },
  {
    path: "/ManageReview",
    icon: Star,
    label: "Manage Review",
  },
  {
    path: "/ManageCertificate",
    icon: ScrollText,
    label: "Manage Certificate",
  },
  {
    path: "/ManageMOU",
    icon: Handshake,
    label: "MOUs",
  },
  {
    path: "/Achievements",
    icon: Trophy,
    label: "Achievements",
  },
  {
    path: "/ManageAppreciation",
    icon: ThumbsUp,
    label: "Appreciations",
  },
  {
    path: "/ManageAdvisory",
    icon: Users,
    label: "Advisory",
  },
  {
    path: "/ManageGallery",
    icon: GalleryHorizontal,
    label: "Photos Gallery",
  },
  {
    path: "/ManageFarewell",
    icon: PartyPopper,
    label: "Farewell",
  },
  {
    path: "/ManageModal",
    icon: AlertCircle,
    label: "Popup",
  },
  {
    path: "/placement",
    icon: Building2,
    label: "Placement Photos",
  },
  {
    path: "/ManageVideo",
    icon: Video,
    label: "Video Gallery",
  },
  {
    path: "/ManageFAQ",
    icon: MessageCircle,
    label: "Manage FAQ",
  },
  {
    path: "/ManageNews",
    icon: Newspaper,
    label: "News Media",
  },
  {
    path: "/PlacementPartner",
    icon: Handshake,
    label: "Placement Partner",
  },
  {
    key: "setting",
    icon: Settings,
    label: "Manage Settings",
    hasSubmenu: true,
    submenu: [
      { path: "/WhatsAppGroup", label: "WhatsApp Group", icon: Send },
      { path: "/ManageSetting", label: "Manage Form Element", icon: Plus },
    ],
  },
  //   {
  //     path: "/",
  //     icon: LogOut,
  //     label: "Log Out",
  //   },
];
