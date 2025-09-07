import { createBrowserRouter } from 'react-router-dom';
import Hospitalform from '../components/Hospitalform';
import { DoctorVerification } from '../pages/doctor/DoctorVerification';
import BankingInformation from '../pages/doctor/BankingInformation';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Hospitalform />
  },
  {
    path: "/hospital-form",
    element: <Hospitalform />
  },
  {
    path: "/doctor-verification",
    element: <DoctorVerification />
  },
  {
    path: "/banking-information",
    element: <BankingInformation />
  }
]);
