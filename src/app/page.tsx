'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { METRO_LOCATIONS, getEstimatedDistance, calculateFare, formatCurrency } from '@/lib/fareCalculator';
import { VehicleType } from '@/lib/types';
import { 
  Car, 
  Bike, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  CreditCard, 
  Star, 
  ArrowRight, 
  CheckCircle2, 
  Smartphone, 
  Users, 
  Sparkles,
  Award,
  ChevronRight,
  Calculator
} from 'lucide-react';

export default function LandingPage() {
  const [pickup, setPickup] = useState('Chennai Central');
  const [drop, setDrop] = useState('T Nagar');
  const [vehicle, setVehicle] = useState<VehicleType>('Car');

  const distance = getEstimatedDistance(pickup, drop);
  const fareResult = calculateFare(vehicle, distance);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Background ambient lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-emerald-600" /> Fast, Safe & Affordable City Commute
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                Your Ride, <br />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-600 bg-clip-text text-transparent">
                  Your Way.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Book affordable car and bike rides quickly with transparent upfront pricing, verified local drivers, and live GPS trip tracking.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/user/book-ride"
                  className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all"
                >
                  <Car className="w-5 h-5" />
                  <span>Book a Ride</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  href="/register?role=driver"
                  className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white border-2 border-slate-200 dark:border-slate-800 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all"
                >
                  <Bike className="w-5 h-5 text-emerald-600" />
                  <span>Become a Driver</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-8 text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Zero Surge on Bikes
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> 100% Verified Drivers
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" /> 4.9/5 Rating
                </div>
              </div>
            </div>

            {/* Hero Right: Live Interactive Fare Estimator Widget */}
            <div id="fare-calculator" className="lg:col-span-5">
              <div className="glass-card dark:glass-card-dark p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 relative">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        Instant Fare Calculator
                      </h3>
                      <p className="text-xs text-slate-400">Accurate city distance estimates</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 rounded-full">
                    Live
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Vehicle Type Toggle */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setVehicle('Car')}
                      className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2.5 transition-all ${
                        vehicle === 'Car'
                          ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400 font-medium'
                      }`}
                    >
                      <Car className="w-5 h-5" />
                      <div className="text-left">
                        <div className="text-xs">City Car</div>
                        <div className="text-[10px] opacity-75">Base ₹50 + ₹15/km</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVehicle('Bike')}
                      className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2.5 transition-all ${
                        vehicle === 'Bike'
                          ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400 font-medium'
                      }`}
                    >
                      <Bike className="w-5 h-5" />
                      <div className="text-left">
                        <div className="text-xs">Swift Bike</div>
                        <div className="text-[10px] opacity-75">Base ₹30 + ₹8/km</div>
                      </div>
                    </button>
                  </div>

                  {/* Pickup Drop Selectors */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Pickup Location
                    </label>
                    <select
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {METRO_LOCATIONS.map((loc) => (
                        <option key={`pick-${loc}`} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" /> Destination
                    </label>
                    <select
                      value={drop}
                      onChange={(e) => setDrop(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {METRO_LOCATIONS.filter((l) => l !== pickup).map((loc) => (
                        <option key={`drop-${loc}`} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fare Estimate Card */}
                  <div className="p-4 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-sky-500/10 rounded-2xl border border-emerald-500/20 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                      <span>Estimated Distance:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{distance} km</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                      <span>Approx. Duration:</span>
                      <span className="font-bold text-slate-900 dark:text-white">~{fareResult.estimatedDurationMins} mins</span>
                    </div>
                    <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        Estimated Fare:
                      </span>
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(fareResult.totalFare)}
                      </span>
                    </div>
                  </div>

                  {/* Proceed to Book CTA */}
                  <Link
                    href={`/user/book-ride?pickup=${encodeURIComponent(pickup)}&drop=${encodeURIComponent(drop)}&vehicle=${vehicle}`}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Book this {vehicle} Ride</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-600">10,000+</div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Completed Rides</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-sky-600">500+</div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Verified Drivers</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-amber-500">4.9 ★</div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">User Satisfaction</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-purple-600">&lt; 3 mins</div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Avg Pickup Match</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full">
              Simple 4-Step Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              How RideShare Works
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              From doorstep pickup to smooth destination drop-off in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Select Pickup & Drop',
                desc: 'Enter your pickup spot and destination. Choose between a budget Bike or comfortable Car.',
                icon: MapPin,
                color: 'text-emerald-500'
              },
              {
                step: '02',
                title: 'Driver Matching',
                desc: 'Our real-time engine matches you with the closest available online driver partner.',
                icon: Users,
                color: 'text-sky-500'
              },
              {
                step: '03',
                title: 'Live Trip Tracking',
                desc: 'Track your driver route with simulated GPS navigation, vehicle model, and secure OTP.',
                icon: Smartphone,
                color: 'text-amber-500'
              },
              {
                step: '04',
                title: 'Flexible Payment',
                desc: 'Pay seamlessly via simulated UPI, Debit/Credit Card, or direct Cash to the driver.',
                icon: CreditCard,
                color: 'text-purple-500'
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:shadow-xl transition-all"
                >
                  <div className="text-4xl font-black text-slate-100 dark:text-slate-800 absolute top-4 right-6 group-hover:text-emerald-500/20 transition-colors">
                    {item.step}
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl w-fit mb-4">
                    <Icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 bg-slate-100/60 dark:bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100/60 dark:bg-emerald-950 px-3 py-1 rounded-full">
              Why Choose Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Engineered for Modern City Travel
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Designed with reliability, transparency, and safety at every turn.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-2xl w-fit">
                <Car className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dual Vehicle Fleet</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose budget-friendly Bike rides for solo quick errands through city traffic, or air-conditioned Sedan & Hatchback Cars for group rides.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="p-3 bg-sky-100 dark:bg-sky-950 text-sky-600 rounded-2xl w-fit">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verified Drivers</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every driver undergoes strict license verification, vehicle registration checks, and passenger rating monitoring.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-950 text-purple-600 rounded-2xl w-fit">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Zero Hidden Charges</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                What you see is what you pay. Fares are calculated dynamically based on verified distance matrix with zero unexpected surge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SAFETY SECTION */}
      <section id="safety" className="py-20 bg-emerald-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-700">
                Safety First
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Your Safety is Our Top Priority
              </h2>
              <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
                We implement multi-layered safety features including secure ride start OTPs, emergency contact notifications, driver background validation, and sanitized bike helmets.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-800 rounded-lg text-emerald-300">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold">4-Digit Secure OTP verification before ride start</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-800 rounded-lg text-emerald-300">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold">Emergency SOS contact sync on user profile</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-800 rounded-lg text-emerald-300">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold">24/7 Academic Demo Monitoring & Feedback</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-950/60 p-8 rounded-3xl border border-emerald-800 space-y-6">
              <h3 className="text-xl font-bold">Driver Standards</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-900/50 rounded-2xl border border-emerald-800/60">
                  <Award className="w-6 h-6 text-emerald-300 mb-2" />
                  <h4 className="font-bold text-sm">Valid License</h4>
                  <p className="text-xs text-emerald-200 mt-1">Verified RTO driving license records.</p>
                </div>
                <div className="p-4 bg-emerald-900/50 rounded-2xl border border-emerald-800/60">
                  <Star className="w-6 h-6 text-amber-400 fill-amber-400 mb-2" />
                  <h4 className="font-bold text-sm">4.5+ Rating Standard</h4>
                  <p className="text-xs text-emerald-200 mt-1">Top-rated partners on our platform.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-sm">
                  RS
                </div>
                <span className="font-black text-lg">Ride Sharing System</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                A complete frontend-only Web-Based Ride Sharing System built with React, Next.js, and LocalStorage for MCA academic project demonstration.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/" className="hover:text-emerald-400">Home</Link></li>
                <li><Link href="/user/book-ride" className="hover:text-emerald-400">Book Ride</Link></li>
                <li><Link href="/register?role=driver" className="hover:text-emerald-400">Become a Driver</Link></li>
                <li><Link href="/login" className="hover:text-emerald-400">Login to Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Dashboards</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/user/dashboard" className="hover:text-emerald-400">Passenger Dashboard</Link></li>
                <li><Link href="/driver/dashboard" className="hover:text-emerald-400">Driver Dashboard</Link></li>
                <li><Link href="/admin/dashboard" className="hover:text-emerald-400">Admin Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Technology Stack</h4>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded">HTML5</span>
                <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded">CSS3</span>
                <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded">React.js</span>
                <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded">Next.js 14</span>
                <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded">LocalStorage</span>
                <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded">JSON Data</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
            © 2026 Ride Sharing System. MCA Academic Project Demonstration. Pure Frontend Application.
          </div>
        </div>
      </footer>
    </div>
  );
}
