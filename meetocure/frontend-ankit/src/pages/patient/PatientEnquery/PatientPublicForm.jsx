"use client";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "../../../components/ui/alert-dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import toast, { Toaster } from "react-hot-toast";

export default function PatientEnquiryForm({ open, setOpen }) {
  const [formData, setFormData] = useState({
    symptoms: "",
    started: "",
    advice: "",
    expectations: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!formData.symptoms || !formData.started || !formData.advice || !formData.expectations) {
      toast.error("⚠️ Please fill out all fields");
      return;
    }

    console.log("Form submitted:", formData);
    toast.success("✅ Enquiry submitted successfully");

    setFormData({ symptoms: "", started: "", advice: "", expectations: "" });
    setOpen(false); // close after submit
  };

  return (
    <>
      <Toaster position="top-right" />
<AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogContent className="w-[90%] max-w-md sm:max-w-[480px] bg-white font-[Poppins] rounded-2xl shadow-lg">
    <AlertDialogHeader className="text-center px-4 sm:px-6">
      <img
        src="/assets/logo.png"
        alt="Logo"
        className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4"
      />
      <AlertDialogTitle className="text-xl sm:text-2xl font-bold text-[#004B5C]">
        Patient Enquiry
      </AlertDialogTitle>
      <AlertDialogDescription className="text-sm sm:text-base text-[#2D3A3A] mt-2">
        Please answer a few questions to help us match you with the right doctor.
      </AlertDialogDescription>
    </AlertDialogHeader>

    <div className="grid gap-4 sm:gap-5 py-4 px-4 sm:px-6">
      {["symptoms", "started", "advice", "expectations"].map((field, idx) => (
        <div key={idx}>
          <label className="block text-left text-sm sm:text-base font-semibold mb-2 text-[#004B5C]">
            {idx + 1}. {field.charAt(0).toUpperCase() + field.slice(1)}?
          </label>
          <Input
            placeholder={`Enter ${field}...`}
            name={field}
            value={formData[field]}
            onChange={handleChange}
            className="w-full border border-[#7A869A] rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-700"
          />
        </div>
      ))}
    </div>

    <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-4 px-4 sm:px-6 pb-4 sm:pb-6">
      <AlertDialogCancel className="w-full sm:w-auto rounded-full px-5 py-2 sm:px-6 sm:py-2 text-[#004B5C] border border-[#7A869A] hover:bg-gray-100">
        Cancel
      </AlertDialogCancel>
      <Button
        onClick={handleSubmit}
        className="w-full sm:w-auto rounded-full px-5 py-2 sm:px-6 sm:py-3 bg-[#004B5C] text-white hover:bg-[#003246] font-semibold"
      >
        Submit Enquiry
      </Button>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>


    </>
  );
}
