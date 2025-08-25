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

export default function PatientEnquiryForm({ open, setOpen,handleCategoryClick }) {
  const [formData, setFormData] = useState({
    symptoms: "",
    started: "",
    advice: "",
    expectations: "",
  });

const symptomCategoryMap = {
  chest: "Cardiology",
  heart: "Cardiology",
  teeth: "Dentistry",
  cough: "Pulmonary",
  asthma: "Pulmonary",
  fever: "General",
  headache: "Neurology",
  stomach: "Gastroen",
  liver: "Gastroen",
  child: "General",
  lab: "Laboratory",
  vaccination: "Vaccination",
};

const placeholders = {
  symptoms: "e.g. chest pain, persistent cough, high fever",
  started: "e.g. started 3 days ago / since last week",
  advice: "e.g. took paracetamol, visited clinic, used inhaler",
  expectations: "e.g. want diagnosis, specialist consult, lab tests",
};
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = () => {
  if (!formData.symptoms || !formData.started || !formData.advice || !formData.expectations) {
    toast.error("Please fill all fields", { duration: 1500 });
    return;
  }

  const words = formData.symptoms.toLowerCase().split(" ");
  const matchedCategories = words
    .map((w) => symptomCategoryMap[w])
    .filter(Boolean);

  if (matchedCategories.length === 0) {
    toast.error("No matching category found");
    return;
  }

  handleCategoryClick(matchedCategories[0]); // call the dashboard function
  setOpen(false); // close modal
  setFormData({ symptoms: "", started: "", advice: "", expectations: "" });
  toast.success("Doctors & hospitals filtered successfully");
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
        Struggling to find a doctor?
      </AlertDialogTitle>
      <AlertDialogDescription className="text-sm sm:text-base text-[#2D3A3A] mt-2">
        Tell us your symptoms below and we'll suggest the right specialist and nearby facilities.
      </AlertDialogDescription>
    </AlertDialogHeader>

    <div className="grid gap-4 sm:gap-5 py-4 px-4 sm:px-6">
            {["symptoms", "started", "advice", "expectations"].map((field, idx) => (
        <div key={idx}>
          <label className="block text-left text-sm sm:text-base font-semibold mb-2 text-[#004B5C]">
            {idx + 1}. {field.charAt(0).toUpperCase() + field.slice(1)}?
          </label>
          <Input
            placeholder={placeholders[field] || `Enter ${field}...`}
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

