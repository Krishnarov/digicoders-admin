
import AbsentsReports from "../pages/AbsentsReports";
import AcceptFee from "../pages/AcceptFee";
import AcceptReg from "../pages/AcceptReg";
import AddStudent from "../pages/AddStudent";
import AddStudentInJob from "../pages/AddStudentInJob";
import AddStuInBatch from "../pages/AddStuInBatch";
import AllStudentReg from "../pages/AllStudentReg";
import AssignmentGrading from "../pages/AssignmentGrading";
import Assignments from "../pages/Assignments";
import Attendance from "../pages/Attendance";
import AttendanceViwe from "../pages/AttendanceViwe";
import AttendencReports from "../pages/AttendencReports";
import Batchs from "../pages/Batchs";
import Branchs from "../pages/Branchs";
import Collages from "../pages/Collages";
import Company from "../pages/Company";
import Dashboard from "../pages/Dashboard";
import Education from "../pages/Education";
import Employee from "../pages/Employee";
import FeeReports from "../pages/FeeReports";
import JobApplications from "../pages/JobApplications";
import Jobs from "../pages/Jobs";
import ManageHr from "../pages/ManageHr";
import NewFee from "../pages/NewFee";
import NewReg from "../pages/NewReg";
import PayFee from "../pages/PayFee";
import Profile from "../pages/Profile";
import QrCode from "../pages/QrCode";
import RegReoprt from "../pages/RegReoprt";
import RegViwe from "../pages/RegViwe";
import RejectFee from "../pages/RejectFee";
import RejectReg from "../pages/RejectReg";
import Teacher from "../pages/Teacher";
import Technology from "../pages/Technology";
import TranningType from "../pages/TranningType";
import Unauthorized from "../pages/Unauthorized";
import UpdateStudent from "../pages/UpdateStudent";




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
    path: "branchs",
    component: Branchs, roles: ["Admin", "Employee",],
  },
  {
    path: "addstuinbatch/:batchId",
    component: AddStuInBatch, roles: ["Admin", "Employee",],
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
    path: "assignments",
    component: Assignments, roles: ["Admin", "Employee","Intern"],
  },
  {
    path: "assignment/:id/grade",
    component: AssignmentGrading, roles: ["Admin", "Employee","Intern"],
  },
  {
    path: "update-student/:id",
    component: UpdateStudent, roles: ["Admin", "Employee","Intern"],
  },
  {
    path: "create-company",
    component: Company, roles: ["Admin", "Employee","Intern"],
  },
  {
    path: "create-jobs",
    component: Jobs, roles: ["Admin", "Employee","Intern"],
  },
  {
    path: "student-assing-job",
    component: AddStudentInJob, roles: ["Admin", "Employee","Intern"],
  },
  {
    path: "job-applications",
    component: JobApplications, roles: ["Admin", "Employee","Intern"],
  },
  {
    path: "/reg-reoprts",
    component: RegReoprt, roles: ["Admin", "Employee", "Intern"],
  },
  {
    path: "/fee-reports",
    component: FeeReports, roles: ["Admin", "Employee", "Intern"],
  },
  {
    path: "/absent-stu-reports",
    component: AbsentsReports, roles: ["Admin", "Employee", "Intern"],
  },
  {
    path: "/attendenc-reports",
    component: AttendencReports, roles: ["Admin", "Employee", "Intern"],
  },
  {
    path: "/unauthorized",
    component: Unauthorized, roles: ["Admin", "Employee", "Intern"],
  },

  
];

export default Routes;
