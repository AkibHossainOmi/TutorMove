import { useState } from "react";
import { jobAPI } from "../utils/apiService";

const countries = ["Bangladesh", "India", "USA", "UK", "Canada"];
const educationLevels = ["Primary", "Secondary", "Higher Secondary", "Bachelor", "Masters", "PhD"];
const budgetTypes = ["Fixed", "Per Hour", "Per Month", "Per Week", "Per Year"];

const JobPostForm = ({ onClose, onJobCreated }) => {
  const [formData, setFormData] = useState({
    location: "",
    phone: "",
    description: "",
    subjects: [],
    educationLevel: "",
    serviceType: "Tutoring",
    mode: [],
    distance: null,
    budget: "",
    budgetType: "",
    totalHours: "",
    genderPreference: "",
    languages: [],
    country: ""
  });

  const [subjectInput, setSubjectInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [showDistanceInput, setShowDistanceInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e, name) => {
    const { checked, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked ? [...prev[name], value] : prev[name].filter((v) => v !== value),
    }));
    if (name === "mode" && value === "Travel to Tutor") {
      setShowDistanceInput(checked);
    }
  };

  const handleAddItem = (input, field, setInput) => {
    if (input && !formData[field].includes(input)) {
      setFormData((prev) => ({ ...prev, [field]: [...prev[field], input] }));
    }
    setInput("");
  };

  const handleRemoveItem = (item, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((i) => i !== item),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const storedUser = localStorage.getItem("user");
      const studentId = storedUser ? JSON.parse(storedUser)?.user_id : null;

      const payload = {
        student: studentId,
        location: formData.location,
        phone: formData.phone,
        description: formData.description,
        subjects: formData.subjects, // M2M
        languages: formData.languages,
        mode: formData.mode,
        education_level: formData.educationLevel || "Primary",
        service_type: formData.serviceType || "Tutoring",
        distance: formData.distance || null,
        budget: formData.budget || null,
        budget_type: formData.budgetType || "Fixed",
        total_hours: formData.totalHours || null,
        gender_preference: formData.genderPreference || "Any",
        country: formData.country || "Unknown",
      };

      const response = await jobAPI.createJob(payload);

      if (response?.status === 201 || response?.id) {
        onJobCreated && onJobCreated(response);
        setTimeout(() => onClose(), 1500);
      }
    } catch (error) {
      console.error("Error posting job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showTotalHours =
    formData.budgetType &&
    formData.budgetType.toLowerCase() !== "fixed" &&
    formData.budgetType.trim() !== "";

  const totalHourLabel = {
    "Per Hour": "Total Hours",
    "Per Month": "Total Hours per Month",
    "Per Week": "Total Hours per Week",
    "Per Year": "Total Hours per Year",
  }[formData.budgetType] || "Total Hours";

  // Helper to add red star for required fields
  const RequiredLabel = ({ label }) => (
    <span className="block text-sm font-semibold text-gray-700 mb-1">
      {label} <span className="text-red-500">*</span>
    </span>
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden relative">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Post a Job</h2>
            <p className="text-gray-500 text-sm mt-1">Find the perfect tutor for your needs</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
            aria-label="Close form"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          <form id="jobForm" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section: Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location */}
                <div>
                  <RequiredLabel label="Location" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, Area"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <RequiredLabel label="WhatsApp / Phone" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Contact number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <RequiredLabel label="Description" />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your requirements in detail..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition resize-y"
                  required
                />
              </div>
            </div>

            {/* Section: Academic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Academic Requirements</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Education Level */}
                <div>
                  <RequiredLabel label="Level" />
                  <select
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition bg-white"
                    required
                  >
                    <option value="">Select Level</option>
                    {educationLevels.map((level, i) => (
                      <option key={i} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                {/* Service Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Service Type</label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition bg-white"
                  >
                    <option value="Tutoring">Tutoring</option>
                    <option value="Assignment Help">Assignment Help</option>
                  </select>
                </div>
              </div>

              {/* Subjects */}
              <div>
                <RequiredLabel label="Subjects" />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    placeholder="Add a subject (e.g. Math)"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem(subjectInput, "subjects", setSubjectInput))}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddItem(subjectInput, "subjects", setSubjectInput)}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition font-medium"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.subjects.map((subj, i) => (
                    <span
                      key={i}
                      className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg flex items-center text-sm font-medium"
                    >
                      {subj}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(subj, "subjects")}
                        className="ml-2 text-indigo-400 hover:text-red-500 transition"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Section: Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Preferences & Budget</h3>

              {/* Mode */}
              <div>
                <RequiredLabel label="Mode" />
                <div className="flex flex-wrap gap-4 mt-2">
                  {["Online", "At My Place", "Travel to Tutor"].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition">
                      <input
                        type="checkbox"
                        value={opt}
                        checked={formData.mode.includes(opt)}
                        onChange={(e) => handleCheckboxChange(e, "mode")}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
                {showDistanceInput && (
                  <div className="mt-3 max-w-xs">
                     <label className="text-xs text-gray-500 mb-1 block">Max Distance (km)</label>
                    <input
                      type="number"
                      name="distance"
                      value={formData.distance}
                      onChange={handleChange}
                      placeholder="e.g. 5"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
                    />
                  </div>
                )}
              </div>

              {/* Budget Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <RequiredLabel label="Budget Amount" />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
                    />
                    <select
                      name="budgetType"
                      value={formData.budgetType}
                      onChange={handleChange}
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition bg-white"
                    >
                      <option value="">Type</option>
                      {budgetTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Total Hours */}
                {showTotalHours && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{totalHourLabel}</label>
                    <input
                      type="number"
                      name="totalHours"
                      value={formData.totalHours}
                      onChange={handleChange}
                      placeholder="e.g. 10"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
                    />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Gender Preference */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tutor Gender Preference</label>
                  <select
                    name="genderPreference"
                    value={formData.genderPreference}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition bg-white"
                  >
                    <option value="">No Preference</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition bg-white"
                  >
                    <option value="">Select Country</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="jobForm"
            disabled={isSubmitting}
            className={`px-8 py-2.5 rounded-xl font-semibold text-white shadow-lg transform transition-all active:scale-95 ${
              isSubmitting
                ? "bg-indigo-400 cursor-wait"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl"
            }`}
          >
            {isSubmitting ? "Posting..." : "Post Job"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobPostForm;
