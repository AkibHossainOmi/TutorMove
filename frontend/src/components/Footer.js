import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#f8f9fa',
      padding: '40px 0',
      marginTop: 'auto',
      borderTop: '1px solid #dee2e6'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '30px'
      }}>
        <div>
          <h3>About Us</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><Link to="/about" style={{ textDecoration: 'none', color: '#6c757d' }}>About TutorMove</Link></li>
            <li><Link to="/how-it-works" style={{ textDecoration: 'none', color: '#6c757d' }}>How It Works</Link></li>
            <li><Link to="/contact" style={{ textDecoration: 'none', color: '#6c757d' }}>Contact Us</Link></li>
          </ul>
        </div>
        
        <div>
          <h3>For Teachers</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><Link to="/teacher-guide" style={{ textDecoration: 'none', color: '#6c757d' }}>Teacher Guide</Link></li>
            <li><Link to="/create-gig" style={{ textDecoration: 'none', color: '#6c757d' }}>Create a Gig</Link></li>
            <li><Link to="/teacher-faq" style={{ textDecoration: 'none', color: '#6c757d' }}>Teacher FAQ</Link></li>
          </ul>
        </div>
        
        <div>
          <h3>For Students</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><Link to="/find-tutors" style={{ textDecoration: 'none', color: '#6c757d' }}>Find Tutors</Link></li>
            <li><Link to="/post-requirement" style={{ textDecoration: 'none', color: '#6c757d' }}>Post Requirement</Link></li>
            <li><Link to="/student-faq" style={{ textDecoration: 'none', color: '#6c757d' }}>Student FAQ</Link></li>
          </ul>
        </div>
        
        <div>
          <h3>Legal</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><Link to="/privacy-policy" style={{ textDecoration: 'none', color: '#6c757d' }}>Privacy Policy</Link></li>
            <li><Link to="/terms" style={{ textDecoration: 'none', color: '#6c757d' }}>Terms of Service</Link></li>
            <li><Link to="/refund-policy" style={{ textDecoration: 'none', color: '#6c757d' }}>Refund Policy</Link></li>
          </ul>
        </div>
      </div>
      
      <div style={{
        textAlign: 'center',
        marginTop: '40px',
        padding: '20px 0',
        borderTop: '1px solid #dee2e6',
        color: '#6c757d'
      }}>
        <p>&copy; {new Date().getFullYear()} TutorMove. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
