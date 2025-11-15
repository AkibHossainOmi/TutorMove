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
    <span className="font-semibold text-gray-700">
      {label} <span className="text-red-600">*</span>
    </span>
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-4 text-3xl text-gray-500 hover:text-red-600 transition"
        >
          &times;
        </button>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-3">
            Get a Tutor For You
          </h2>

          {/* Location */}
          <div>
            <label className="block text-sm mb-1">
              <RequiredLabel label="Location" />
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter your location"
              className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg p-3 transition"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm mb-1">
              <RequiredLabel label="WhatsApp Number" />
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your WhatsApp number"
              className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg p-3 transition"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm mb-1">
              <RequiredLabel label="Description" />
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your requirements"
              rows={4}
              className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg p-3 transition"
              required
            />
          </div>

          {/* Subjects */}
          <div>
            <label className="block text-sm mb-1">
              <RequiredLabel label="Subjects" />
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                placeholder="Add a subject"
                className="flex-1 border border-gray-300 rounded-lg p-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
              <button
                type="button"
                onClick={() => handleAddItem(subjectInput, "subjects", setSubjectInput)}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.subjects.map((subj, i) => (
                <span
                  key={i}
                  className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1 rounded-full flex items-center text-sm"
                >
                  {subj}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(subj, "subjects")}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Education Level */}
          <div>
            <label className="block text-sm mb-1">
              <RequiredLabel label="Education Level" />
            </label>
            <select
              name="educationLevel"
              value={formData.educationLevel}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              required
            >
              <option value="">Select your level</option>
              {educationLevels.map((level, i) => (
                <option key={i} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-sm mb-1">Service Type</label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="Tutoring">Tutoring</option>
              <option value="Assignment Help">Assignment Help</option>
            </select>
          </div>

          {/* Mode */}
          <div>
            <label className="block text-sm mb-1">
              <RequiredLabel label="Mode" />
            </label>
            <div className="flex flex-wrap gap-4">
              {["Online", "At My Place", "Travel to Tutor"].map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-gray-700">
                  <input
                    type="checkbox"
                    value={opt}
                    checked={formData.mode.includes(opt)}
                    onChange={(e) => handleCheckboxChange(e, "mode")}
                    className="accent-indigo-600"
                  />
                  {opt}
                </label>
              ))}
            </div>
            {showDistanceInput && (
              <input
                type="number"
                name="distance"
                value={formData.distance}
                onChange={handleChange}
                placeholder="Distance in km"
                className="mt-3 w-full border border-gray-300 rounded-lg p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            )}
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm mb-1">
              <RequiredLabel label="Budget" />
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="Enter amount"
                className="flex-1 border border-gray-300 rounded-lg p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
              <select
                name="budgetType"
                value={formData.budgetType}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">Select Type</option>
                {budgetTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Total Hours (Conditional) */}
          {showTotalHours && (
            <div>
              <label className="block text-sm mb-1">{totalHourLabel}</label>
              <input
                type="number"
                name="totalHours"
                value={formData.totalHours}
                onChange={handleChange}
                placeholder={`Enter ${totalHourLabel.toLowerCase()}`}
                className="w-full border border-indigo-400 rounded-lg p-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
              />
            </div>
          )}

          {/* Gender Preference */}
          <div>
            <label className="block text-sm mb-1">Gender Preference</label>
            <select
              name="genderPreference"
              value={formData.genderPreference}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">No Preference</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-sm mb-1">Languages</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={languageInput}
                onChange={(e) => setLanguageInput(e.target.value)}
                placeholder="Add a language"
                className="flex-1 border border-gray-300 rounded-lg p-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
              <button
                type="button"
                onClick={() => handleAddItem(languageInput, "languages", setLanguageInput)}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.languages.map((lang, i) => (
                <span
                  key={i}
                  className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1 rounded-full flex items-center text-sm"
                >
                  {lang}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(lang, "languages")}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm mb-1">Country</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-60"
            >
              {isSubmitting ? "Posting..." : "Post Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobPostForm;
