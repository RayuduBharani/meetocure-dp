# Notification System Documentation

## Overview

This document describes the comprehensive notification system implemented in the MeetoCure application. The system provides consistent error handling, success messages, and user feedback for all major actions.

## Features

- ✅ **Toast Notifications**: Success, error, warning, info, and loading states
- 🚨 **Error Handling**: Comprehensive API error handling with user-friendly messages
- 🔄 **Loading States**: Visual feedback during async operations
- 💬 **Confirmation Dialogs**: User confirmation for important actions
- 🎨 **Consistent UI**: Unified design across all notification types
- 📱 **Mobile Optimized**: Responsive design for all screen sizes

## Components

### 1. Notification Utilities (`src/utils/notifications.js`)

Core notification functions that can be imported directly:

```javascript
import {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  handleApiError,
  successMessages,
  errorMessages,
  confirmWithToast,
} from "../utils/notifications";

// Basic usage
showSuccess("Operation completed successfully!");
showError("Something went wrong");
showWarning("Please check your input");
showInfo("New update available");

// Loading with dismiss
const loadingToast = showLoading("Processing...");
// ... do work ...
loadingToast.dismiss();

// API error handling
try {
  await apiCall();
} catch (err) {
  handleApiError(err, "Custom error message");
}
```

### 2. Notification Context (`src/contexts/NotificationContext.jsx`)

React context for centralized notification management:

```javascript
import { useNotifications } from "../contexts/NotificationContext";

const MyComponent = () => {
  const {
    success,
    error,
    loading,
    dismissLoading,
    handleError,
    successMsg,
    errorMsg,
  } = useNotifications();

  const handleAction = async () => {
    const loadingKey = "myAction";
    loading(loadingKey, "Processing...");

    try {
      await apiCall();
      dismissLoading(loadingKey);
      success(successMsg("dataSaved"));
    } catch (err) {
      dismissLoading(loadingKey);
      handleError(err, "Action failed");
    }
  };
};
```

### 3. Confirmation Modal (`src/components/ConfirmationModal.jsx`)

Reusable confirmation dialog:

```javascript
import ConfirmationModal from "../components/ConfirmationModal";

const [showConfirm, setShowConfirm] = useState(false);

<ConfirmationModal
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleConfirm}
  title="Confirm Action"
  message="Are you sure you want to proceed?"
  confirmText="Yes, Continue"
  cancelText="No, Cancel"
  type="danger" // 'default', 'danger', 'warning', 'success'
  icon="⚠️"
/>;
```

### 4. Success Modal (`src/components/SuccessModal.jsx`)

Success feedback modal with auto-close:

```javascript
import SuccessModal from "../components/SuccessModal";

const [showSuccess, setShowSuccess] = useState(false);

<SuccessModal
  isOpen={showSuccess}
  onClose={() => setShowSuccess(false)}
  title="Success!"
  message="Your action was completed successfully"
  buttonText="Continue"
  autoClose={true}
  autoCloseDelay={3000}
  icon="✅"
/>;
```

### 5. Appointment Action Modal (`src/components/AppointmentActionModal.jsx`)

Specialized modal for appointment actions:

```javascript
import AppointmentActionModal from "../components/AppointmentActionModal";

<AppointmentActionModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  action="cancel" // 'book', 'cancel', 'reschedule'
  onConfirm={handleAppointmentAction}
  doctorName="Dr. Smith"
  date="2024-01-15"
  time="10:00 AM"
/>;
```

## Usage Examples

### Login/Authentication

```javascript
const handleLogin = async () => {
  const loadingKey = "login";
  loading(loadingKey, "Signing in...");

  try {
    const response = await loginAPI(credentials);
    dismissLoading(loadingKey);
    success(successMsg("login"));
    navigate("/dashboard");
  } catch (err) {
    dismissLoading(loadingKey);
    handleError(err, "Login failed");
  }
};
```

### Form Submission

```javascript
const handleSubmit = async (formData) => {
  const loadingKey = "formSubmit";
  loading(loadingKey, "Saving...");

  try {
    await saveData(formData);
    dismissLoading(loadingKey);
    success(successMsg("dataSaved"));
    resetForm();
  } catch (err) {
    dismissLoading(loadingKey);
    handleError(err, "Failed to save data");
  }
};
```

### Data Deletion

```javascript
const handleDelete = () => {
  confirm("Are you sure you want to delete this item?", async () => {
    const loadingKey = "delete";
    loading(loadingKey, "Deleting...");

    try {
      await deleteAPI(id);
      dismissLoading(loadingKey);
      success("Item deleted successfully");
      refreshData();
    } catch (err) {
      dismissLoading(loadingKey);
      handleError(err, "Failed to delete item");
    }
  });
};
```

### File Upload

```javascript
const handleFileUpload = async (file) => {
  if (!file) {
    error("Please select a file");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    error(errorMsg("fileTooLarge"));
    return;
  }

  const loadingKey = "upload";
  loading(loadingKey, "Uploading file...");

  try {
    await uploadFile(file);
    dismissLoading(loadingKey);
    success("File uploaded successfully");
  } catch (err) {
    dismissLoading(loadingKey);
    handleError(err, "File upload failed");
  }
};
```

## Predefined Messages

### Success Messages

```javascript
successMessages = {
  login: "Successfully logged in!",
  logout: "Successfully logged out!",
  register: "Registration successful!",
  profileUpdate: "Profile updated successfully!",
  appointmentBooked: "Appointment booked successfully!",
  appointmentCancelled: "Appointment cancelled successfully!",
  appointmentRescheduled: "Appointment rescheduled successfully!",
  availabilityUpdated: "Availability updated successfully!",
  settingsSaved: "Settings saved successfully!",
  verificationSubmitted: "Verification submitted successfully!",
  paymentSuccessful: "Payment completed successfully!",
  dataSaved: "Data saved successfully!",
  emailSent: "Email sent successfully!",
  passwordChanged: "Password changed successfully!",
  otpSent: "OTP sent successfully!",
  otpVerified: "OTP verified successfully!",
};
```

### Error Messages

```javascript
errorMessages = {
  loginFailed: "Login failed. Please check your credentials.",
  registerFailed: "Registration failed. Please try again.",
  invalidOtp: "Invalid OTP. Please try again.",
  otpExpired: "OTP has expired. Please request a new one.",
  sessionExpired: "Your session has expired. Please login again.",
  networkError: "Network error. Please check your internet connection.",
  serverError: "Server error. Please try again later.",
  validationError: "Please check your input and try again.",
  unauthorized: "You are not authorized to perform this action.",
  notFound: "The requested resource was not found.",
  conflict: "This resource already exists.",
  tooManyRequests: "Too many requests. Please try again later.",
  paymentFailed: "Payment failed. Please try again.",
  appointmentNotFound: "Appointment not found.",
  doctorUnavailable: "Doctor is not available at this time.",
  invalidDate: "Please select a valid date.",
  invalidTime: "Please select a valid time.",
  fileUploadFailed: "File upload failed. Please try again.",
  fileTooLarge: "File size is too large.",
  invalidFileType: "Invalid file type.",
};
```

## Error Handling

### Network Errors

The system automatically detects and handles network-related errors:

```javascript
// Automatically shows "Network Error: Please check your internet connection"
handleApiError(networkError);
```

### HTTP Status Codes

Different HTTP status codes show appropriate error messages:

- **400**: Bad Request - Input validation errors
- **401**: Unauthorized - Authentication required
- **403**: Forbidden - Access denied
- **404**: Not Found - Resource doesn't exist
- **409**: Conflict - Resource already exists
- **422**: Validation Error - Invalid input data
- **429**: Too Many Requests - Rate limiting
- **500**: Server Error - Internal server error
- **502**: Bad Gateway - Service unavailable
- **503**: Service Unavailable - Maintenance mode

### Custom Error Messages

You can override default error messages:

```javascript
handleApiError(err, "Custom error message for this specific action");
```

## Best Practices

### 1. Always Use Loading States

```javascript
// Good
const loadingKey = "actionName";
loading(loadingKey, "Processing...");
try {
  await apiCall();
  dismissLoading(loadingKey);
  success("Success!");
} catch (err) {
  dismissLoading(loadingKey);
  handleError(err);
}

// Bad
try {
  await apiCall(); // No loading feedback
  success("Success!");
} catch (err) {
  handleError(err);
}
```

### 2. Use Predefined Messages

```javascript
// Good
success(successMsg("profileUpdate"));
error(errorMsg("networkError"));

// Bad
success("Profile updated successfully!"); // Hardcoded message
```

### 3. Handle All Error Cases

```javascript
// Good
try {
  await apiCall();
  success("Success!");
} catch (err) {
  handleError(err, "Custom context message");
}

// Bad
try {
  await apiCall();
  success("Success!");
} catch (err) {
  // Silent failure - user doesn't know what went wrong
}
```

### 4. Use Appropriate Modal Types

```javascript
// For dangerous actions
<ConfirmationModal type="danger" />

// For warnings
<ConfirmationModal type="warning" />

// For success confirmations
<ConfirmationModal type="success" />
```

## Integration with Existing Components

### Update Existing Components

Replace `alert()` calls with notification functions:

```javascript
// Before
alert("Error: " + error.message);

// After
handleError(error, "Custom error message");
```

### Replace Toast Imports

```javascript
// Before
import toast from "react-hot-toast";
toast.success("Success!");

// After
import { useNotifications } from "../contexts/NotificationContext";
const { success } = useNotifications();
success("Success!");
```

## Troubleshooting

### Common Issues

1. **Notifications not showing**: Ensure `NotificationProvider` wraps your app
2. **Loading states not dismissing**: Check that `dismissLoading` is called in both success and error cases
3. **Context errors**: Make sure component is within `NotificationProvider`

### Debug Mode

Enable debug logging by setting environment variable:

```bash
REACT_APP_DEBUG_NOTIFICATIONS=true
```

## Migration Guide

### Step 1: Wrap App with Provider

```javascript
// App.jsx
import { NotificationProvider } from "./contexts/NotificationContext";

function App() {
  return <NotificationProvider>{/* Your app content */}</NotificationProvider>;
}
```

### Step 2: Update Component Imports

```javascript
// Before
import toast from "react-hot-toast";

// After
import { useNotifications } from "../contexts/NotificationContext";
```

### Step 3: Replace Toast Calls

```javascript
// Before
const { success, error } = useNotifications();
toast.success("Success!");
toast.error("Error!");

// After
const { success, error } = useNotifications();
success("Success!");
error("Error!");
```

### Step 4: Add Loading States

```javascript
// Before
try {
  await apiCall();
  success("Done!");
} catch (err) {
  handleError(err);
}

// After
const loadingKey = "action";
loading(loadingKey, "Processing...");
try {
  await apiCall();
  dismissLoading(loadingKey);
  success("Done!");
} catch (err) {
  dismissLoading(loadingKey);
  handleError(err);
}
```

## Conclusion

This notification system provides a comprehensive, user-friendly way to handle all types of user feedback in your application. By following the patterns and best practices outlined in this document, you can ensure consistent, professional user experience across all components.

For additional support or questions, refer to the component source code or create an issue in the project repository.
