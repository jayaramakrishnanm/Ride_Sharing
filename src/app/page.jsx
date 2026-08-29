"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  METRO_LOCATIONS,
  getEstimatedDistance,
  calculateFare,
  formatCurrency,
} from "@/lib/fareCalculator";

import {
  Car,
  Bike,
  ShieldCheck,
  Clock,
  CreditCard,
  ArrowRight,
  Compass,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [vehicleType, setVehicleType] = useState("Car");

  const hasRoute = Boolean(pickup && drop && pickup.trim().toLowerCase() !== drop.trim().toLowerCase());
  const distanceKm = hasRoute ? getEstimatedDistance(pickup, drop) : 0;
  const fareDetails = hasRoute ? calculateFare(vehicleType, distanceKm) : null;

  return (
    <div className="app-container">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section
          style={{
            padding: "64px 20px",
            background:
              "radial-gradient(circle at 50% 10%, rgba(16, 185, 129, 0.12) 0%, transparent 65%)",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "48px",
              alignItems: "center",
            }}
          >
            {/* Hero Content */}
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 14px",
                  backgroundColor: "var(--primary-light)",
                  color: "var(--primary-text)",
                  borderRadius: "99px",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  marginBottom: "18px",
                }}
              >
                <Sparkles size={14} />
                <span>Smart Car & Bike Rides</span>
              </div>

              <h1
                style={{
                  fontSize: "2.75rem",
                  fontWeight: 900,
                  lineHeight: 1.15,
                  letterSpacing: "-0.03em",
                  color: "var(--navy)",
                  marginBottom: "18px",
                }}
              >
                Smart, Safe & Affordable Rides for{" "}
                <span style={{ color: "var(--primary)" }}>Every Journey</span>.
              </h1>

              <p
                style={{
                  fontSize: "1rem",
                  color: "var(--text-muted)",
                  lineHeight: 1.6,
                  marginBottom: "28px",
                }}
              >
                Book reliable car and bike rides with transparent fares, trusted
                drivers, secure ride verification, and convenient digital
                payments.
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "14px",
                  marginBottom: "32px",
                }}
              >
                <Link href="/login" className="btn btn-primary btn-lg">
                  <span>Book a Ride Now</span>
                  <ArrowRight size={18} />
                </Link>

                <Link href="/register" className="btn btn-secondary btn-lg">
                  <span>Register as Driver</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "20px",
                  fontSize: "0.8125rem",
                  color: "var(--text-muted)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <ShieldCheck size={18} style={{ color: "var(--primary)" }} />
                  <span>Secure Ride Verification</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Clock size={18} style={{ color: "var(--sky)" }} />
                  <span>Quick Ride Matching</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <CreditCard size={18} style={{ color: "var(--purple)" }} />
                  <span>UPI / Card / Cash</span>
                </div>
              </div>
            </div>

            {/* Fare Calculator */}
            <div
              id="fare-calculator"
              className="card"
              style={{
                padding: "32px",
                boxShadow: "var(--shadow-xl)",
                border: "2px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 900,
                      color: "var(--text-main)",
                    }}
                  >
                    Fare Estimator
                  </h3>

                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    Get an instant estimate for your journey
                  </p>
                </div>

                <span className="badge badge-success">Transparent Pricing</span>
              </div>

              {/* Vehicle Selector */}
              <div
                className="vehicle-selector-grid"
                style={{ marginBottom: "16px" }}
              >
                <button
                  type="button"
                  className={`vehicle-card-btn ${
                    vehicleType === "Car" ? "active" : ""
                  }`}
                  onClick={() => setVehicleType("Car")}
                >
                  <div className="vehicle-icon-wrap">
                    <Car size={20} />
                  </div>

                  <div>
                    <div className="vehicle-card-name">City Car</div>

                    <div className="vehicle-card-desc">Base ₹50 + ₹15/km</div>
                  </div>
                </button>

                <button
                  type="button"
                  className={`vehicle-card-btn ${
                    vehicleType === "Bike" ? "active" : ""
                  }`}
                  onClick={() => setVehicleType("Bike")}
                >
                  <div className="vehicle-icon-wrap">
                    <Bike size={20} />
                  </div>

                  <div>
                    <div className="vehicle-card-name">Swift Bike</div>

                    <div className="vehicle-card-desc">Base ₹30 + ₹8/km</div>
                  </div>
                </button>
              </div>

              {/* Pickup */}
              <div className="form-group">
                <label className="form-label">Pickup Location</label>

                <select
                  className="form-select"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                >
                  <option value="" disabled>Select pickup location...</option>
                  {METRO_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc} disabled={loc === drop}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination */}
              <div className="form-group">
                <label className="form-label">Destination</label>

                <select
                  className="form-select"
                  value={drop}
                  onChange={(e) => setDrop(e.target.value)}
                >
                  <option value="" disabled>Select destination...</option>
                  {METRO_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc} disabled={loc === pickup}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fare Details */}
              <div
                style={{
                  backgroundColor: "#f8fafc",
                  padding: "16px",
                  borderRadius: "12px",
                  margin: "16px 0",
                  fontSize: "0.8125rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                    color: "var(--text-muted)",
                  }}
                >
                  <span>Route Distance:</span>
                  <strong>{hasRoute ? `${distanceKm} km` : "—"}</strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                    color: "var(--text-muted)",
                  }}
                >
                  <span>Estimated Time:</span>
                  <strong>{hasRoute && fareDetails ? `~${fareDetails.estimatedDurationMins} minutes` : "—"}</strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: "10px",
                    borderTop: "1px solid var(--border-color)",
                    fontWeight: 900,
                    fontSize: "1.125rem",
                  }}
                >
                  <span>Estimated Fare:</span>

                  <span style={{ color: hasRoute ? "var(--primary)" : "var(--text-muted)" }}>
                    {hasRoute && fareDetails ? formatCurrency(fareDetails.totalFare) : "Select locations"}
                  </span>
                </div>
              </div>

              <Link
                href={hasRoute ? `/user/book-ride?pickup=${encodeURIComponent(pickup)}&drop=${encodeURIComponent(drop)}&vehicleType=${vehicleType}` : "/user/book-ride"}
                className="btn btn-primary btn-block"
              >
                <span>{hasRoute ? "Book This Route" : "Book a Ride"}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          style={{
            padding: "64px 20px",
            maxWidth: "1280px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "48px",
            }}
          >
            <span
              className="badge badge-purple"
              style={{ marginBottom: "8px" }}
            >
              Simple & Convenient
            </span>

            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 900,
                color: "var(--navy)",
                letterSpacing: "-0.025em",
              }}
            >
              Your Journey in Four Simple Steps
            </h2>

            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-muted)",
                marginTop: "6px",
              }}
            >
              From booking your ride to reaching your destination
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "24px",
            }}
          >
            {[
              {
                step: "01",
                title: "Choose Your Ride",
                desc: "Select your pickup location, destination, and preferred car or bike.",
              },
              {
                step: "02",
                title: "Get Matched",
                desc: "Connect with an available driver near your pickup location.",
              },
              {
                step: "03",
                title: "Start Your Journey",
                desc: "Confirm your ride securely and enjoy a smooth journey.",
              },
              {
                step: "04",
                title: "Arrive & Pay",
                desc: "Reach your destination and pay conveniently using your preferred method.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="card"
                style={{ position: "relative" }}
              >
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 900,
                    color: "#eb59f3da",
                    lineHeight: 1,
                    marginBottom: "12px",
                  }}
                >
                  {item.step}
                </div>

                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "var(--text-main)",
                    marginBottom: "6px",
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--text-muted)",
                    lineHeight: 1.5,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Key Features */}
        <section
          id="features"
          style={{
            padding: "64px 20px",
            backgroundColor: "#ffffff",
            borderTop: "1px solid var(--border-color)",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                textAlign: "center",
                marginBottom: "48px",
              }}
            >
              <span
                className="badge badge-info"
                style={{ marginBottom: "8px" }}
              >
                Everything You Need
              </span>

              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: 900,
                  color: "var(--navy)",
                  letterSpacing: "-0.025em",
                }}
              >
                Designed for a Better Ride Experience
              </h2>

              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-muted)",
                  marginTop: "6px",
                }}
              >
                Simple, reliable, and convenient features for every journey
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "24px",
              }}
            >
              {/* Car & Bike */}
              <div className="card">
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    backgroundColor: "var(--primary-light)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}
                >
                  <Car size={22} />
                </div>

                <h3
                  style={{
                    fontSize: "1.0625rem",
                    fontWeight: 800,
                    marginBottom: "6px",
                  }}
                >
                  Car & Bike Rides
                </h3>

                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--text-muted)",
                    lineHeight: 1.5,
                  }}
                >
                  Choose the ride that suits your journey with clear and
                  transparent pricing.
                </p>
              </div>

              {/* Smart Matching */}
              <div className="card">
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    backgroundColor: "var(--sky-light)",
                    color: "var(--sky)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}
                >
                  <Compass size={22} />
                </div>

                <h3
                  style={{
                    fontSize: "1.0625rem",
                    fontWeight: 800,
                    marginBottom: "6px",
                  }}
                >
                  Convenient Ride Matching
                </h3>

                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--text-muted)",
                    lineHeight: 1.5,
                  }}
                >
                  Get connected with available drivers based on your pickup
                  location.
                </p>
              </div>

              {/* Safety */}
              <div className="card">
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    backgroundColor: "var(--purple-light)",
                    color: "var(--purple)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}
                >
                  <ShieldCheck size={22} />
                </div>

                <h3
                  style={{
                    fontSize: "1.0625rem",
                    fontWeight: 800,
                    marginBottom: "6px",
                  }}
                >
                  Safe & Reliable
                </h3>

                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--text-muted)",
                    lineHeight: 1.5,
                  }}
                >
                  Enjoy secure ride verification, trusted drivers, and
                  convenient payment options.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
