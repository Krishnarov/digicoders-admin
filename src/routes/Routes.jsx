
import AcceptFee from "../pages/AcceptFee";
import AcceptReg from "../pages/AcceptReg";
import AddStudent from "../pages/AddStudent";
import AllStudentReg from "../pages/AllStudentReg";
import Dashboard from "../pages/Dashboard";
import Education from "../pages/Education";
import NewFee from "../pages/NewFee";
import NewReg from "../pages/NewReg";
import PayFee from "../pages/PayFee";
import RejectFee from "../pages/RejectFee";
import RejectReg from "../pages/RejectReg";
import Technology from "../pages/Technology";
import TranningType from "../pages/TranningType";




const Routes = [
  {
    path: "dashboard",
    component: Dashboard,
  },
  {
    path: "AddStudent",
    component: AddStudent,
  },
  {
    path: "tranning",
    component: TranningType,
  },
  {
    path: "technology",
    component: Technology,
  },
  {
    path: "education",
    component: Education,
  },
  {
    path: "new",
    component: NewReg,
  },
  {
    path: "accepted",
    component: AcceptReg,
  },
  {
    path: "rejected",
    component: RejectReg,
  },
  {
    path: "all-students",
    component: AllStudentReg,
  },
  {
    path: "pay-fee",
    component: PayFee,
  },
  {
    path: "new-fee",
    component: NewFee,
  },
  {
    path: "accepted-fee",
    component: AcceptFee,
  },
  {
    path: "rejected-fee",
    component: RejectFee,
  },

  
];

export default Routes;
