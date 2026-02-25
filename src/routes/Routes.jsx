

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
import AttendanceView from "../pages/AttendanceView";
import AttendencReports from "../pages/AttendencReports";
import Batchs from "../pages/Batchs";
import Branchs from "../pages/Branchs";
import Collages from "../pages/Collages";
import Company from "../pages/Company";
import Course from "../pages/Course";
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
import TrainingDuration from "../pages/TrainingDuration";
import TranningType from "../pages/TranningType";
import Unauthorized from "../pages/Unauthorized";
import UpdateStudent from "../pages/UpdateStudent";
import PendingReg from "../pages/PendingReg";
import ManageTags from "../pages/ManageTags";
import ManageIndustry from "../pages/ManageIndustry";

const Routes = [
  {
    path: "dashboard",
    component: Dashboard,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "view_dashboard"
  },
  {
    path: "AddStudent",
    component: AddStudent,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "add_student"
  },
  {
    path: "AddStudent/:id",
    component: AddStudent,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "edit_student"
  },
  {
    path: "duration",
    component: TrainingDuration,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "manage_duration"
  },
  {
    path: "tranning",
    component: TranningType,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "manage_training"
  },
  {
    path: "technology",
    component: Technology,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "manage_technology"
  },
  {
    path: "education",
    component: Education,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "manage_education"
  },
  {
    path: "new",
    component: NewReg,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "view_registrations"
  },
  {
    path: "pending",
    component: PendingReg,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "view_registrations"
  },
  {
    path: "accepted",
    component: AcceptReg,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "approve_registration"
  },
  {
    path: "rejected",
    component: RejectReg,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "reject_registration"
  },
  {
    path: "all-students",
    component: AllStudentReg,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "view_students"
  },
  {
    path: "pay-fee",
    component: PayFee,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "collect_fee"
  },
  {
    path: "new-fee",
    component: NewFee,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "view_fee_payments"
  },
  {
    path: "accepted-fee",
    component: AcceptFee,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "approve_fee"
  },
  {
    path: "rejected-fee",
    component: RejectFee,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "reject_fee"
  },
  {
    path: "reg-student/:id",
    component: RegViwe,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "view_student_details"
  },
  {
    path: "course",
    component: Course,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "manage_course"
  },
  {
    path: "collages",
    component: Collages,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "manage_college"
  },
  {
    path: "manage-hr",
    component: ManageHr,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "manage_hr"
  },
  {
    path: "qr-code",
    component: QrCode,
    roles: ["Super Admin", "Admin"],
    requiredPermission: "manage_qrcode"
  },
  {
    path: "employee",
    component: Employee,
    roles: ["Super Admin", "Admin"],
    requiredPermission: "manage_employee"
  },
  {
    path: "profile",
    component: Profile,
    roles: ["Super Admin", "Admin", "Employee"]
  },
  {
    path: "teacher",
    component: Teacher,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "manage_teacher"
  },
  {
    path: "batchs",
    component: Batchs,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "manage_batch"
  },
  {
    path: "branchs",
    component: Branchs,
    roles: ["Super Admin"],
    requiredPermission: "manage_branch"
  },
  {
    path: "tags",
    component: ManageTags,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "manage_tags"
  },
  {
    path: "industries",
    component: ManageIndustry,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "manage_tags"
  },
  {
    path: "addstuinbatch/:batchId",
    component: AddStuInBatch,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "manage_batch_students"
  },
  {
    path: "attendance-marking",
    component: Attendance,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "mark_attendance"
  },
  {
    path: "attendance-view",
    component: AttendanceView,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "view_attendance"
  },
  {
    path: "assignments",
    component: Assignments,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "manage_assignments"
  },
  {
    path: "assignment/:id/grade",
    component: AssignmentGrading,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "grade_assignment"
  },
  {
    path: "update-student/:id",
    component: UpdateStudent,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "edit_student"
  },
  {
    path: "create-company",
    component: Company,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "manage_company"
  },
  {
    path: "create-jobs",
    component: Jobs,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "manage_jobs"
  },
  {
    path: "student-assing-job",
    component: AddStudentInJob,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "assign_jobs"
  },
  {
    path: "job-applications",
    component: JobApplications,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "view_job_applications"
  },
  {
    path: "reg-reoprts",
    component: RegReoprt,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "view_registration_reports"
  },
  {
    path: "fee-reports",
    component: FeeReports,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "view_fee_reports"
  },
  {
    path: "absent-stu-reports",
    component: AbsentsReports,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "view_attendance_reports"
  },
  {
    path: "attendenc-reports",
    component: AttendencReports,
    roles: ["Super Admin", "Admin", "Employee"],
    requiredPermission: "view_attendance_reports"
  },
  {
    path: "unauthorized",
    component: Unauthorized
  },
];

export default Routes;