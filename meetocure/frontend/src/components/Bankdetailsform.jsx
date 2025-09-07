import React, { useState } from 'react';

const App = () => {
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Form submitted! Check the console for data.');
  };

  return (
    <div className="bg-slate-100 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-2xl bg-white p-10 sm:p-12 rounded-2xl shadow-xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary">
            Doctor Bank Details
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            id="accountNumber"
            label="Account Number"
            type="text"
            placeholder="Enter your bank account number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
          <FormField
            id="ifscCode"
            label="IFSC Code"
            type="text"
            placeholder="e.g., SBIN0001234"
            value={ifscCode}
            onChange={(e) => setIfscCode(e.target.value)}
          />
          <FormField
            id="accountHolderName"
            label="Account Holder Name"
            type="text"
            placeholder="Enter the account holder's full name"
            value={accountHolderName}
            onChange={(e) => setAccountHolderName(e.target.value)}
          />
          <div className="pt-6 flex justify-center">
            <Button type="submit">Next</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reusable Button Component
const Button = ({ children, onClick, type = 'button', disabled = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="bg-primary text-white font-bold text-lg py-3 px-32 rounded-full hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary focus:ring-opacity-50 transition-all duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
};

// Reusable FormField Component
const FormField = ({ id, label, type, placeholder, value, onChange }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-base font-bold text-gray-700 mb-2">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full px-4 py-3 bg-white border border-gray-400 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
        required
      />
    </div>
  );
};

export default App;
