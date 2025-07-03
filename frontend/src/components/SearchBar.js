import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [subject, setSubject] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Only call onSearch if at least one field has a value
    if (subject.trim() || location.trim()) {
      onSearch({ subject: subject.trim(), location: location.trim() });
    } else {
      // Optionally, provide feedback to the user if both fields are empty
      // alert('Please enter a subject or location to search.');
    }
  };

  // --- Inline Styles ---
  const formStyle = {
    display: 'flex',
    flexDirection: 'column', // Stack inputs and button vertically on small screens
    gap: '15px', // Space between elements
    marginBottom: '30px', // More space below the search bar
    alignItems: 'center', // Center items horizontally
    width: '100%',
    maxWidth: '600px', // Max width for the search bar container
    padding: '20px',
    backgroundColor: '#ffffff', // White background
    borderRadius: '12px', // More rounded corners
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)', // Subtle, modern shadow
  };

  const inputStyle = {
    flex: 1, // Allow inputs to grow and shrink
    padding: '12px 18px', // More padding for better touch/click area
    border: '1px solid #e0e0e0', // Light gray border
    borderRadius: '8px', // Rounded input fields
    fontSize: '16px', // Readable font size
    color: '#333',
    outline: 'none', // Remove default focus outline
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease', // Smooth transitions
    width: '100%', // Take full width within the form group
    boxSizing: 'border-box', // Include padding in width
  };

  const inputFocusStyle = {
    borderColor: '#007bff', // Blue border on focus
    boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.25)', // Blue glow on focus
  };

  const buttonStyle = {
    padding: '12px 30px', // Generous padding
    backgroundColor: '#007bff', // Primary blue
    color: 'white',
    border: 'none',
    borderRadius: '8px', // Rounded button
    fontSize: '17px', // Larger font for button text
    fontWeight: '600', // Bolder text
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.1s ease, box-shadow 0.2s ease', // Smooth transitions
    outline: 'none', // Remove default focus outline
    width: '100%', // Take full width within the form group
    maxWidth: '200px', // Max width for the button
  };

  const buttonHoverStyle = {
    backgroundColor: '#0056b3', // Darker blue on hover
    transform: 'translateY(-2px)', // Slight lift effect
    boxShadow: '0 6px 12px rgba(0, 123, 255, 0.3)', // More prominent shadow on hover
  };

  const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column', // Inputs stack vertically on small screens
    gap: '15px',
    width: '100%',
  };

  // Media query equivalent for responsiveness using inline style
  // This is a simplified approach. For complex responsive layouts,
  // it's generally better to use a CSS-in-JS library like styled-components
  // or a global CSS file with media queries.
  // For basic adjustments, we can set a minWidth on inputGroupStyle and rely on flexWrap.
  const handleResize = () => {
    if (window.innerWidth > 768) { // Adjust breakpoint as needed
      formStyle.flexDirection = 'row';
      formStyle.flexWrap = 'nowrap';
      inputGroupStyle.flexDirection = 'row';
    } else {
      formStyle.flexDirection = 'column';
      formStyle.flexWrap = 'wrap';
      inputGroupStyle.flexDirection = 'column';
    }
    // Force re-render to apply new styles
    setSubject(prev => prev); // Dummy state update to trigger re-render
  };

  React.useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize(); // Call once on mount to set initial layout
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <div style={inputGroupStyle}>
        <input
          type="text"
          placeholder="Subject or Skill (e.g., Math, Programming)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={inputStyle}
          onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
          onBlur={(e) => Object.assign(e.currentTarget.style, inputStyle)}
        />
        <input
          type="text"
          placeholder="Location (e.g., Dhaka, Online)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={inputStyle}
          onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
          onBlur={(e) => Object.assign(e.currentTarget.style, inputStyle)}
        />
      </div>
      <button
        type="submit"
        style={buttonStyle}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, buttonHoverStyle)}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, buttonStyle)}
      >
        Search Tutors
      </button>
    </form>
  );
};

export default SearchBar;