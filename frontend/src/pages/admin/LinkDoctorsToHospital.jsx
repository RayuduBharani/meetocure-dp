import React, { useEffect, useState } from "react";

const LinkDoctorsToHospital = () => {
    const [hospitals, setHospitals] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [selectedHospital, setSelectedHospital] = useState("");
    const [selectedDoctors, setSelectedDoctors] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        // Fetch hospitals
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/hospitals/hospitallogins`)
            .then(res => res.json())
            .then(setHospitals);
        // Fetch doctors
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/doctor`)
            .then(res => res.json())
            .then(setDoctors);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedHospital || selectedDoctors.length === 0) {
            setMessage("Select a hospital and at least one doctor.");
            return;
        }
        setMessage("Linking doctors...");
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/hospitals/hospitallogins/${selectedHospital}/doctors`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ doctorIds: selectedDoctors })
        });
        const data = await res.json();
        if (res.ok) {
            setMessage("Doctors linked successfully!");
        } else {
            setMessage(data.message || "Error linking doctors.");
        }
    };

    return (
        <div className="max-w-xl mx-auto py-10">
            <h2 className="text-2xl font-bold mb-6">Link Doctors to Hospital</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block mb-2 font-medium">Select Hospital:</label>
                    <select value={selectedHospital} onChange={e => setSelectedHospital(e.target.value)} className="w-full p-2 border rounded">
                        <option value="">-- Choose Hospital --</option>
                        {hospitals.map(h => (
                            <option key={h._id} value={h._id}>{h.hospitalName} ({h.address})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block mb-2 font-medium">Select Doctors:</label>
                    <div className="max-h-48 overflow-y-auto border rounded p-2">
                        {doctors.map(d => (
                            <label key={d._id} className="block mb-1">
                                <input
                                    type="checkbox"
                                    value={d._id}
                                    checked={selectedDoctors.includes(d._id)}
                                    onChange={e => {
                                        if (e.target.checked) {
                                            setSelectedDoctors([...selectedDoctors, d._id]);
                                        } else {
                                            setSelectedDoctors(selectedDoctors.filter(id => id !== d._id));
                                        }
                                    }}
                                /> {d.fullName || d.name || d.email}
                            </label>
                        ))}
                    </div>
                </div>
                <button type="submit" className="px-4 py-2 bg-[#0A4D68] text-white rounded">Link Doctors</button>
            </form>
            {message && <div className="mt-4 text-blue-600">{message}</div>}
        </div>
    );
};

export default LinkDoctorsToHospital;
