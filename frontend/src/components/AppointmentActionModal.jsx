import React, { useState } from "react";
import { useNotifications } from "../contexts/NotificationContext";
import ConfirmationModal from "./ConfirmationModal";

const AppointmentActionModal = ({
    isOpen,
    onClose,
    action,
    onConfirm,
    doctorName,
    date,
    time
}) => {
    const { success, error, loading, dismissLoading, successMsg } = useNotifications();
    const [showConfirmation, setShowConfirmation] = useState(false);

    const getActionConfig = () => {
        switch (action) {
            case 'book':
                return {
                    title: 'Confirm Appointment',
                    message: `Book appointment with Dr. ${doctorName} on ${date} at ${time}?`,
                    confirmText: 'Book Appointment',
                    type: 'success',
                    icon: '📅',
                    successMessage: successMsg('appointmentBooked')
                };
            case 'cancel':
                return {
                    title: 'Cancel Appointment',
                    message: `Are you sure you want to cancel your appointment with Dr. ${doctorName} on ${date} at ${time}?`,
                    confirmText: 'Cancel Appointment',
                    type: 'danger',
                    icon: '❌',
                    successMessage: successMsg('appointmentCancelled')
                };
            case 'reschedule':
                return {
                    title: 'Reschedule Appointment',
                    message: `Reschedule appointment with Dr. ${doctorName} from ${date} at ${time}?`,
                    confirmText: 'Reschedule',
                    type: 'warning',
                    icon: '🔄',
                    successMessage: successMsg('appointmentRescheduled')
                };
            default:
                return {
                    title: 'Confirm Action',
                    message: 'Are you sure you want to proceed?',
                    confirmText: 'Confirm',
                    type: 'default',
                    icon: '❓',
                    successMessage: 'Action completed successfully!'
                };
        }
    };

    const config = getActionConfig();

    const handleConfirm = async () => {
        setShowConfirmation(false);
        const loadingKey = `appointment_${action}`;
        loading(loadingKey, `${action === 'book' ? 'Booking' : action === 'cancel' ? 'Cancelling' : 'Rescheduling'} appointment...`);

        try {
            // Call the parent's onConfirm function
            await onConfirm();

            dismissLoading(loadingKey);
            success(config.successMessage);

            // Close modal after success
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            console.log(err)
            dismissLoading(loadingKey);
            error(`Failed to ${action} appointment`);
        }
    };

    const handleActionClick = () => {
        if (action === 'cancel') {
            setShowConfirmation(true);
        } else {
            handleConfirm();
        }
    };

    return (
        <>
            {/* Main Modal */}
            <div className={`fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-4 ${isOpen ? '' : 'hidden'}`}>
                <div className="bg-white w-full max-w-md rounded-[2rem] shadow-xl text-center animate-fade-in">

                    {/* Icon */}
                    <div className={`w-20 h-20 ${config.type === 'danger' ? 'bg-red-100' : config.type === 'warning' ? 'bg-yellow-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mt-8 mb-4`}>
                        <span className="text-3xl">{config.icon}</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-[22px] font-bold text-[#1F2A37] mb-2 px-6">
                        {config.title}
                    </h2>

                    {/* Message */}
                    <p className="text-gray-500 mb-8 px-6">
                        {config.message}
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-3 px-6 pb-8">
                        <button
                            onClick={handleActionClick}
                            className={`w-full py-3 rounded-full font-semibold text-base text-white transition ${config.type === 'danger' ? 'bg-red-500 hover:bg-red-600' :
                                    config.type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' :
                                        'bg-[#004B5C] hover:bg-[#003246]'
                                }`}
                        >
                            {config.confirmText}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-full bg-[#E6E8EB] text-[#1F2A37] font-semibold text-base hover:bg-gray-200 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal for Dangerous Actions */}
            <ConfirmationModal
                isOpen={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={handleConfirm}
                title="Final Confirmation"
                message="This action cannot be undone. Are you absolutely sure?"
                confirmText="Yes, Proceed"
                cancelText="No, Cancel"
                type="danger"
                icon="⚠️"
            />
        </>
    );
};

export default AppointmentActionModal;
