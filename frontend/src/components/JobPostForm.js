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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e, name) => {
    const { checked, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked ? [...prev[name], value] : prev[name].filter(v => v !== value)
    }));
    if (name === "mode" && value === "Travel to Tutor") {
      setShowDistanceInput(checked);
    }
  };

  const handleAddItem = (input, field, setInput) => {
    if (input && !formData[field].includes(input)) {
      setFormData(prev => ({ ...prev, [field]: [...prev[field], input] }));
    }
    setInput("");
  };

  const handleRemoveItem = (item, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(i => i !== item)
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
        ...formData
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg max-h-[60vh] overflow-y-auto relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-3 text-2xl text-red-600 hover:text-red-800"
        >
          &times;
        </button>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-xl font-bold mb-2">Get a Tutor For You</h2>

          <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} className="w-full border p-2 rounded" required />

          <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="w-full border p-2 rounded" required />

          <textarea name="description" placeholder="Details of your Requirements" value={formData.description} onChange={handleChange} className="w-full border p-2 rounded" required rows={4}></textarea>

          {/* Subjects */}
          <div>
            <label>Subjects:</label>
            <div className="flex gap-2">
              <input type="text" value={subjectInput} onChange={(e) => setSubjectInput(e.target.value)} className="border p-2 rounded w-full" placeholder="Add a subject" />
              <button type="button" onClick={() => handleAddItem(subjectInput, "subjects", setSubjectInput)} className="bg-blue-500 text-white px-4 py-1 rounded">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.subjects.map((subj, i) => (
                <span key={i} className="bg-gray-200 px-3 py-1 rounded-full flex items-center">
                  {subj} <button type="button" onClick={() => handleRemoveItem(subj, "subjects" )} className="ml-2 text-red-500">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Education Level */}
          <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} className="w-full border p-2 rounded" required>
            <option value="">Your Level of Education</option>
            {educationLevels.map((level, i) => (
              <option key={i} value={level}>{level}</option>
            ))}
          </select>

          {/* Service Type */}
          <select name="serviceType" value={formData.serviceType} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="Tutoring">Tutoring</option>
            <option value="Assignment Help">Assignment Help</option>
          </select>

          {/* Mode */}
          <div>
            <label>I want:</label>
            <div className="flex gap-4 mt-1">
              {["Online", "At My Place", "Travel to Tutor"].map((opt) => (
                <label key={opt} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={opt}
                    checked={formData.mode.includes(opt)}
                    onChange={(e) => handleCheckboxChange(e, "mode")}
                  />
                  {opt}
                </label>
              ))}
            </div>
            {showDistanceInput && (
              <input type="number" name="distance" placeholder="Distance in km" value={formData.distance} onChange={handleChange} className="w-full border p-2 mt-2 rounded" />
            )}
          </div>

          {/* Budget */}
          <div className="flex gap-2 items-center">
            <input type="number" name="budget" placeholder="Budget Amount" value={formData.budget} onChange={handleChange} className="border p-2 rounded w-full" />
            <select name="budgetType" value={formData.budgetType} onChange={handleChange} className="border p-2 rounded">
              <option value="">Select Type</option>
              {budgetTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/*Total Hours Input */}
          <input
            type="number"
            name="totalHours"
            placeholder="Total Hours"
            value={formData.totalHours}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          {/* Gender Preference */}
          <select name="genderPreference" value={formData.genderPreference} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="">Gender Preference</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          {/* Languages */}
          <div>
            <label>Languages:</label>
            <div className="flex gap-2">
              <input type="text" value={languageInput} onChange={(e) => setLanguageInput(e.target.value)} className="border p-2 rounded w-full" placeholder="Add a language" />
              <button type="button" onClick={() => handleAddItem(languageInput, "languages", setLanguageInput)} className="bg-blue-500 text-white px-4 py-1 rounded">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.languages.map((lang, i) => (
                <span key={i} className="bg-gray-200 px-3 py-1 rounded-full flex items-center">
                  {lang} <button type="button" onClick={() => handleRemoveItem(lang, "languages")} className="ml-2 text-red-500">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Country */}
          <select name="country" value={formData.country} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Submit */}
          <div className="flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50" disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobPostForm;
