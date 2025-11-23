import { useState } from 'react';
import MapSearch from '../components/MapSearch';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HomeSections from '../components/HomeSections';

const Home = () => {
  const [tab] = useState('map');

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      {/* Hero Background with Space for Search Box */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 pt-32 pb-24 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
         {/* Abstract shapes */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400 rounded-full blur-3xl mix-blend-multiply animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000"></div>
         </div>

         <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
               Unlock Your Potential with <br className="hidden sm:block" />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
                  Expert Tutors
               </span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
               Connect with verified tutors for any subject, anywhere. Online or in-person, we have the perfect match for your learning goals.
            </p>
         </div>
      </div>

      {/* Map Search UI - Overlapping Hero */}
      {tab === 'map' && (
         <MapSearch mode="gigs" radiusKm={20} />
      )}
    
      <HomeSections/>
      <Footer />
    </div>
  );
};

export default Home;