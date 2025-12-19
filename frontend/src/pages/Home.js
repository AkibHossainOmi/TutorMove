// src/pages/Home.js
import React, { useState } from 'react';
import MapSearch from '../components/MapSearch';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HomeSections from '../components/HomeSections';
import ChatBot from '../components/ChatBot';
import { MapPin, Search, ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [tab] = useState('map');
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 dark:bg-dark-bg min-h-screen flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      {/* Hero Section with Vibrant Background */}
      <div className="relative pt-20 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-white dark:bg-dark-bg transition-colors duration-300"></div>
          <div className="absolute -top-[30%] -right-[10%] w-[800px] h-[800px] bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] bg-gradient-to-tr from-accent-400/20 to-primary-400/20 rounded-full blur-[80px] animate-float"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 text-center">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-primary-200 dark:border-white/10 backdrop-blur-sm shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
             </span>
             <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
               #1 Trusted Tutoring Platform
             </span>
           </div>

           <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8 leading-[1.1]">
              Master Any Subject with <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-secondary-500 to-accent-500 animate-gradient-x">
                Expert Tutors
              </span>
           </h1>

           <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              Connect with top-rated tutors in your area or online.
              Personalized learning that fits your schedule and budget.
           </p>

           <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={() => navigate('/tutors')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold text-lg shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Find a Tutor
              </button>
              <button
                 onClick={() => navigate('/signup')}
                 className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-white/5 text-slate-700 dark:text-white font-bold text-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                Start Teaching
                <ArrowRight className="w-5 h-5" />
              </button>
           </div>

           {/* Trust Indicators */}
           <div className="flex items-center justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-1">
                 <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                       <div key={i} className={`w-8 h-8 rounded-full border-2 border-white dark:border-dark-bg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold`}>
                         {/* Placeholder avatars */}
                         <span className="text-slate-400">U{i}</span>
                       </div>
                    ))}
                 </div>
                 <div className="flex flex-col text-left ml-3">
                    <div className="flex text-amber-400 text-xs">
                       <Star className="w-3 h-3 fill-current" />
                       <Star className="w-3 h-3 fill-current" />
                       <Star className="w-3 h-3 fill-current" />
                       <Star className="w-3 h-3 fill-current" />
                       <Star className="w-3 h-3 fill-current" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Loved by 10k+ Students</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Floating Map Section */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-20">
           <div className="glass rounded-3xl p-2 sm:p-4 shadow-2xl dark:shadow-none ring-1 ring-slate-200 dark:ring-white/10 transform transition-transform hover:scale-[1.01] duration-500">
              <div className="bg-white dark:bg-dark-card rounded-2xl overflow-hidden relative shadow-inner h-[500px] sm:h-[600px]">
                 {/* Map overlay controls could go here */}
                 {tab === 'map' && (
                   <MapSearch mode="gigs" radiusKm={20} />
                 )}

                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-dark-card/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-white/20 dark:border-white/5 flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary-500" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Interactive Tutor Map</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    
      <HomeSections/>
      <Footer />

      {/* ChatBot Assistant */}
      <ChatBot />
    </div>
  );
};

export default Home;
