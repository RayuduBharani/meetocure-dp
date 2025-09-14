import LinkDoctorsToHospital from "./pages/admin/LinkDoctorsToHospital";
{/* Admin: Link Doctors to Hospital */ }
<Route path="/admin/link-doctors-hospital" element={<LinkDoctorsToHospital />} />
import React from "react";
import { Routes, Route, Router } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Common
import SplashScreen from "./pages/SplashScreen";
import ChooseRoleScreen from "./pages/ChooseRoleScreen";
import { NotificationProvider } from "./contexts/NotificationContext";
// Doctor Side
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorAppointmentsPage from "./pages/doctor/DoctorAppointmentsPage";
import DoctorPatientDetailsPage from "./pages/doctor/DoctorPatientDetailsPage";
import QuickStatsPage from "./pages/doctor/stats/QuickStatsPage";
import DoctorAvailability from "./pages/doctor/availability/DoctorAvailability";
import ChangeAvailability from "./pages/doctor/availability/ChangeAvailability";
import AddAvailability from "./pages/doctor/availability/AddAvailability";
import DoctorProfilePage from "./pages/doctor/profile/DoctorProfilePage";
import EditProfile from "./pages/doctor/profile/EditProfile";
import Notifications from "./pages/doctor/Notifications";
import ChatAI from "./pages/doctor/ChatAI";
import Settings from "./pages/doctor/profile/Settings";
import HelpSupport from "./pages/doctor/profile/HelpSupport";
import TermsConditions from "./pages/doctor/profile/TermsConditions";
import Hospitalform from "./components/Hospitalform";
import BankingInformation from "./pages/doctor/BankingInformation";

// Patient Side
import PatientDashboard from "./pages/patient/PatientDashboard";
import Location from "./pages/patient/Location";
import PatientProfilePage from "./pages/patient/profile/PatientProfilePage";
import PatientEditProfile from "./pages/patient/profile/PatientEditProfile";
import PatientSettings from "./pages/patient/profile/PatientSettings";
import Help from "./pages/patient/profile/Help";
import Terms from "./pages/patient/profile/Terms";
import DateTime from "./pages/patient/Appointmentpage/DateTime";
import PatientDetails from "./pages/patient/Appointmentpage/PatientDetails";
import Payment from "./pages/patient/Appointmentpage/Payment";
import ChatPage from "./pages/patient/contactpages/Chatpage";
import ContactUS from "./pages/patient/contactpages/ContactUs";
import HospitalDetails from "./pages/patient/hospitalpages/HospitalDetails";
import WalletPage from "./pages/patient/walletpages/WalletPage";
import PageNotFound from "./pages/patient/Page-NotFound";
import ContactUs from "./pages/patient/contactpages/ContactUs";

import CardsData from "./pages/patient/doctorspages/Cards-data";
import HospitalCardsData from "./pages/patient/hospitalpages/Cards-data";
import DetailPage from './pages/patient/DetailPage';
import DetailsPage from './pages/patient/DetailsPage';
import HospitalDoctorsPage from './pages/patient/hospitalpages/HospitalDoctorsPage';

import PatientAppointView from "./pages/patient/PatientAppointView";
import PatientLogin from "./pages/patient/PatientLogin";
import DoctorVerify from "./pages/doctor/DoctorVerify";
import { DoctorVerification } from "./pages/doctor/DoctorVerification";
import PatientPublicForm from "./pages/patient/PatientEnquery/PatientPublicForm";
import PatientSos from "./pages/patient/SOS/PatientSos";
import SendNotification from './components/SendNotification.jsx';
import NotificationsList from './components/NotificationList.jsx';
import ProfileView from "./pages/doctor/profile/profileView";


import { GoogleMapsProvider } from './contexts/GoogleMapsContext';
import AppointmentProvider from "./contexts/AppointmentContext.jsx";
import DcoterVerificationPending from "./pages/doctor/DcoterVerificationPending.jsx";

function App() {
  return (
    // <AuthProvider>
    <GoogleMapsProvider>
      <Routes>
        {/* Common Routes */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/choose-role" element={<ChooseRoleScreen />} />
        <Route path="/dual-patient" element={<PatientLogin />} />
        <Route path="/dual-doctor" element={<DoctorVerify />} />
        {/* docter verification pending page */}
        <Route path="/doctor-verify" element={<DcoterVerificationPending />} />

        {/* Doctor Routes */}
        {/* Hospital Details Route */}
        <Route path="/hospital/:id" element={<HospitalDetails />} />
        {/* <Route element={<PrivateRoute allowedRoles={['doctor']} />}> */}
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
        <Route path="/doctor/patient/:id" element={<DoctorPatientDetailsPage />} />
        <Route path="/doctor/stats" element={<QuickStatsPage />} />
        <Route path="/doctor/availability" element={<DoctorAvailability />} />
        <Route path="/doctor/availability/change/:date" element={<ChangeAvailability />} />
        <Route path="/doctor/availability/add" element={<AddAvailability />} />
        <Route path="/doctor/profile" element={<DoctorProfilePage />} />
        <Route path="/doctor/profile-view" element={<ProfileView />} /> /...
        <Route path="/doctor/profile/edit" element={<EditProfile />} />
        <Route path="/doctor/notifications" element={<Notifications />} />
        <Route path="/doctor/ai-chat" element={<ChatAI />} />
        <Route path="/doctor/settings" element={<Settings />} />
        <Route path="/doctor/help" element={<HelpSupport />} />
        <Route path="/doctor/terms" element={<TermsConditions />} />
        <Route path="/doctor-verification" element={<DoctorVerification />} />
        <Route path="/hospital-form" element={<Hospitalform />} />
        <Route path="/banking-information" element={<BankingInformation />} />
        {/* </Route> */}
        {/* Patient Routes */}
        {/* <Route element={<PrivateRoute allowedRoles={['patient']} />}> */}
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/patient/profile" element={<PatientProfilePage />} /> //....
        <Route path="/patient/profile/edit" element={<PatientEditProfile />} />// ....
        <Route path="/patient/settings" element={<PatientSettings />} />
        <Route path="/patient/notifications" element={<Notifications />} />
        <Route path="/patient/calendar" element={<PatientAppointView />} /> //....
        <Route path="/patient/emergency-contact" element={<PatientSos />} />
        <Route path="/patient/help" element={<Help />} />
        <Route path="/patient/terms" element={<Terms />} />
        <Route path="/location" element={<Location />} />
        <Route path="/patient/chat" element={<ChatPage />} />
        <Route path="/patient/contact-us" element={<ContactUs />} />
        {/* <Route path="/patient/hospitals" element={<HospitalsPage />} /> */}
        <Route path="/patient/wallet" element={<WalletPage />} />
        <Route path="/doctorspages/Cards-data" element={<CardsData />} />
        <Route path="/hospitalpages/Cards-data" element={<HospitalCardsData />} />
        <Route path="/details/:id" element={<DetailsPage />} />
        <Route path="/details/:type/:id" element={<DetailsPage />} />
        <Route path="/hospital/:hospitalId/doctors" element={<HospitalDoctorsPage />} />
        <Route path="/patient/appointments/Query" element={<PatientPublicForm />} />
        {/* </Route> */}
        {/* Notifications Route */}



        {/* Patient Appointment Flow (Wrapped in Context) */}
        <Route
          path="/patient/appointments/*"
          element={
            <AppointmentProvider>
              <NotificationProvider>
                <Routes>
                  <Route path="" element={<DateTime />} />
                  <Route path="datetime" element={<DateTime />} />
                  <Route path="patient-detail" element={<PatientDetails />} />

                  {/* <Route path="payment" element={<Payment />} /> */}

                  {/* Add payment page when ready */}
                  {/* <Route path="payment" element={<Payment />} /> */}
                  <Route path="*" element={<PageNotFound />} />

                </Routes>
              </NotificationProvider>
            </AppointmentProvider>
          }
        />

        {/* 404 */}
        <Route path="*" element={<PageNotFound />} />

      </Routes>
      <Toaster position="top-right" />
    </GoogleMapsProvider>
    // {/* </AuthProvider> */}
  );
}

export default App;
