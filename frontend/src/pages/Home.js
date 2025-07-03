import React, { useState } from 'react';
import MapSearch from '../components/MapSearch';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
  const [tab] = useState('map');

  return (
    <div>
      <Navbar />
      <div style={{ height: '200px' }}></div>

      {/* Map Search UI */}
      {tab === 'map' && (
        <div>
          <MapSearch mode="gigs" radiusKm={20} />
        </div>
      )}
      
      <div style={{ height: '100px' }}></div>
      <Footer />
    </div>
  );
};

export default Home;
