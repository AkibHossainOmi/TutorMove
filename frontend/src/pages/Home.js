// src/pages/Home.js
import React, { useState } from 'react';
import MapSearch from '../components/MapSearch';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HomeSections from '../components/HomeSections';
import { MapPin } from 'lucide-react';

const Home = () => {
  const [tab] = useState('map');

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <Navbar />

      {/* Hero Section with Map Overlay */}
      <div className="relative pt-16">
        <div className="bg-slate-900 pt-16 pb-32 lg:pt-24 lg:pb-48 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
           {/* Background Elements */}
           <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[100px] opacity-40 mix-blend-screen"></div>
              <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px] opacity-40 mix-blend-screen"></div>
           </div>

           <div className="relative z-10 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  Location-Based Tutoring
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight">
                 Find Tutors <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Near You</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
                 Discover qualified tutors in your neighborhood or connect online.
                 Use our interactive map to find the perfect match for your learning journey.
              </p>
           </div>
        </div>

        {/* Floating Map Section */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 lg:-mt-36 mb-12">
           <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden ring-1 ring-black/5">
              <div className="p-1 bg-slate-50 border-b border-slate-200 flex justify-between items-center px-4 py-2">
                 <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                 </div>
                 <div className="text-xs font-mono text-slate-400">Interactive Map Search</div>
              </div>
              <div className="h-[500px] relative">
                 {/* Map Component */}
                 {tab === 'map' && (
                   <MapSearch mode="gigs" radiusKm={20} />
                 )}
              </div>
           </div>
        </div>
      </div>
    
      <HomeSections/>
      <Footer />
    </div>
  );
};

export default Home;
