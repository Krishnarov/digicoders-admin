
import AcceptFee from "../pages/AcceptFee";
import AcceptReg from "../pages/AcceptReg";
import AddStudent from "../pages/AddStudent";
import AllStudentReg from "../pages/AllStudentReg";
import Attendance from "../pages/Attendance";
import AttendanceViwe from "../pages/AttendanceViwe";
import Batchs from "../pages/Batchs";
import Collages from "../pages/Collages";
import Dashboard from "../pages/Dashboard";
import Education from "../pages/Education";
import Employee from "../pages/Employee";
import ManageHr from "../pages/ManageHr";
import NewFee from "../pages/NewFee";
import NewReg from "../pages/NewReg";
import PayFee from "../pages/PayFee";
import Profile from "../pages/Profile";
import QrCode from "../pages/QrCode";
import RegViwe from "../pages/RegViwe";
import RejectFee from "../pages/RejectFee";
import RejectReg from "../pages/RejectReg";
import Teacher from "../pages/Teacher";
import Technology from "../pages/Technology";
import TranningType from "../pages/TranningType";
import Unauthorized from "../pages/Unauthorized";




const Routes = [
  {
    path: "dashboard",
    component: Dashboard,
     roles: ["Admin", "Employee", "Intern"],
  },
  {
    path: "AddStudent",
    component: AddStudent,
     roles: ["Admin", "Employee"],
  },
  {
    path: "AddStudent/:id",
    component: AddStudent,
     roles: ["Admin", "Employee"],
  },
  {
    path: "tranning",
    component: TranningType,
     roles: ["Admin", "Employee"],
  },
  {
    path: "technology",
    component: Technology,
     roles: ["Admin", "Employee"],
  },
  {
    path: "education",
    component: Education,
     roles: ["Admin", "Employee"],
  },
  {
    path: "new",
    component: NewReg,
     roles: ["Admin", "Employee"],
  },
  {
    path: "accepted",
    component: AcceptReg,
     roles: ["Admin", "Employee"],
  },
  {
    path: "rejected",
    component: RejectReg,
     roles: ["Admin", "Employee"],
  },
  {
    path: "all-students",
    component: AllStudentReg,
     roles: ["Admin", "Employee"],
  },
  {
    path: "pay-fee",
    component: PayFee,
     roles: ["Admin", "Employee",],
  },
  {
    path: "new-fee",
    component: NewFee,
     roles: ["Admin", "Employee"],
  },
  {
    path: "accepted-fee",
    component: AcceptFee, roles: ["Admin", "Employee", ],
  },
  {
    path: "rejected-fee",
    component: RejectFee, roles: ["Admin", "Employee", ],
  },
  {
    path: "reg-student/:id",
    component: RegViwe, roles: ["Admin","Employee"],
  },
  {
    path: "collages",
    component: Collages, roles: ["Admin"],
  },
  {
    path: "manage-hr",
    component: ManageHr, roles: ["Admin"],
  },
  {
    path: "qr-code",
    component: QrCode, roles: ["Admin"],
  },
  {
    path: "employee",
    component: Employee, roles: ["Admin"],
  },
  {
    path: "profile",
    component: Profile, roles: ["Admin", "Employee", "Intern"],
  },
  {
    path: "teacher",
    component: Teacher, roles: ["Admin", "Employee",],
  },
  {
    path: "batchs",
    component: Batchs, roles: ["Admin", "Employee",],
  },
  {
    path: "attendance-marking",
    component: Attendance, roles: ["Admin", "Employee","Intern"],
  },
  {
    path: "attendance-viwe",
    component: AttendanceViwe, roles: ["Admin", "Employee","Intern"],
  },
  {
    path: "/unauthorized",
    component: Unauthorized, roles: ["Admin", "Employee", "Intern"],
  },

  
];

export default Routes;
