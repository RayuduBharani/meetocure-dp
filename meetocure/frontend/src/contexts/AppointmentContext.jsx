import React, { createContext, useContext, useState } from 'react';

const AppointmentContext = createContext();

export const AppointmentProvider = ({ children }) => {
  const [appointmentData, setAppointmentData] = useState({
    selectedDate: '',
    selectedTime: '',
    patientDetails: null,
    paymentMethod: '',
  });

  const updateAppointmentData = (newData) => {
    setAppointmentData((prevData) => ({
      ...prevData,
      ...newData,
    }));
  };

  return (
    <AppointmentContext.Provider value={{ appointmentData, updateAppointmentData }}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointment = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointment must be used within an AppointmentProvider');
  }
  return context;
};
export default AppointmentProvider;
