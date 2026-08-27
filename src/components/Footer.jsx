"use client";

import React from "react";
import Link from "next/link";
import { Car, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#0f172a",
        color: "#94a3b8",
        borderTop: "1px solid #1e293b",
        padding: "48px 20px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "36px",
          marginBottom: "36px",
        }}
      >
        {/* Brand */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#ffffff",
              fontWeight: 900,
              fontSize: "1.25rem",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #10b981, #06b6d4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
              }}
            >
              <Car size={18} />
            </div>

            <span>RideShare System</span>
          </div>

          <p
            style={{
              fontSize: "0.8125rem",
              lineHeight: 1.6,
              color: "#64748b",
            }}
          >
            Experience convenient and reliable car and bike rides with
            transparent fares, trusted drivers, and a seamless booking
            experience.
          </p>
        </div>

        {/* Quick Navigation */}
        <div>
          <h4
            style={{
              color: "#ffffff",
              fontSize: "0.875rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "16px",
            }}
          >
            Quick Navigation
          </h4>

          <ul
            style={{
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              fontSize: "0.8125rem",
              padding: 0,
              margin: 0,
            }}
          >
            <li>
              <Link href="/" style={{ color: "#94a3b8" }}>
                Home
              </Link>
            </li>

            <li>
              <Link href="/login" style={{ color: "#94a3b8" }}>
                Sign In
              </Link>
            </li>

            <li>
              <Link href="/register" style={{ color: "#94a3b8" }}>
                Create Account
              </Link>
            </li>

            <li>
              <Link href="/user/book-ride" style={{ color: "#94a3b8" }}>
                Book a Ride
              </Link>
            </li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4
            style={{
              color: "#ffffff",
              fontSize: "0.875rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "16px",
            }}
          >
            Our Services
          </h4>

          <ul
            style={{
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              fontSize: "0.8125rem",
              padding: 0,
              margin: 0,
            }}
          >
            <li>Car Rides</li>
            <li>Bike Rides</li>
            <li>Ride Booking</li>
            <li>Fare Estimation</li>
          </ul>
        </div>

        {/* Why RideShare */}
        <div>
          <h4
            style={{
              color: "#ffffff",
              fontSize: "0.875rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "16px",
            }}
          >
            Why RideShare
          </h4>

          <div
            style={{
              fontSize: "0.8125rem",
              lineHeight: 1.6,
              color: "#64748b",
            }}
          >
            <p>
              <strong style={{ color: "#cbd5e1" }}>Move smarter.</strong> Enjoy
              seamless ride booking, transparent fares, and dependable journeys.
            </p>

            <p style={{ marginTop: "8px" }}>
              Built to make every trip simple, safe, and convenient.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          paddingTop: "24px",
          borderTop: "1px solid #1e293b",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          fontSize: "0.75rem",
        }}
      >
        <div>
          © {new Date().getFullYear()} RideShare System. All rights reserved.
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span>Crafted with</span>

          <Heart
            size={14}
            style={{
              color: "#e11d48",
              fill: "#e11d48",
            }}
          />

          <span>for smarter journeys</span>
        </div>
      </div>
    </footer>
  );
}
