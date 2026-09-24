# SafeLifeSathi

## Smart Hospital Management & Emergency Response System

SafeLifeSathi is a healthcare platform that brings useful hospital services together in one place. It helps patients find the right department, understand prescriptions, manage their queue, remember vaccinations, and receive emergency alerts when an ambulance is approaching.

The main idea is to make hospital visits simpler for patients while improving emergency response.

## Features

### AI OPD Assistant

Patients can describe their symptoms and get guidance about which OPD or hospital department they should visit.

### Prescription Scanner

Patients can upload or scan a prescription. The system uses OCR and AI to extract the information and explain it in simpler language.

### Smart Patient Queue

Patients receive a digital token and can check their position in the queue instead of waiting without knowing when their turn will come.

### Vaccination Reminders

The system keeps track of vaccination schedules and provides reminders for upcoming vaccinations.

### Ambulance Road-Clearance Alert

This is the main innovation of SafeLifeSathi.

When an ambulance is approaching, the system identifies vehicles that are:

* Ahead of the ambulance
* On the same road
* Travelling in the same direction
* Within a defined proximity range

Only the relevant vehicles are alerted so that they can safely make way for the ambulance. Vehicles travelling behind the ambulance are not unnecessarily notified.

> *Prototype:* The current version demonstrates this feature using simulated ambulance and vehicle data. Real GPS/GNSS and connected-vehicle integration can be added in future versions.

---

## Problem

Patients and hospitals face several everyday difficulties, such as:

* Long waiting times
* Difficulty finding the correct OPD
* Confusion about prescriptions
* Missed vaccination dates
* Unorganized patient queues
* Traffic-related delays for ambulances
* Limited coordination between different hospital services

SafeLifeSathi brings these functions into one platform instead of making patients depend on multiple separate systems.

---

## How It Works

### Patient Flow

text
Patient
   ↓
Enter Symptoms
   ↓
OPD Recommendation
   ↓
Get Digital Token
   ↓
Track Queue
   ↓
Consult Doctor
   ↓
Scan Prescription
   ↓
View Simple Explanation
   ↓
Receive Vaccination Reminders


### Ambulance Flow

text
Ambulance Starts
       ↓
Get Location & Direction
       ↓
Find Nearby Vehicles
       ↓
Check Same Road
       ↓
Check Same Direction
       ↓
Check Proximity Range
       ↓
Find Vehicles Ahead
       ↓
Send Alert


---

## Technology Used

### Frontend

* React
* TypeScript
* Vite
* HTML
* CSS

### Backend

* Node.js
* Express.js

### AI

* Google Gemini API
* Symptom-based OPD guidance
* Prescription explanation

### Other Technologies

* OCR
* GPS/GNSS concept
* Proximity detection
* Road and direction filtering
* Notification system

### Development

* GitHub
* npm
* Node.js
* Cloud deployment

---

## Project Structure

text
Safe-Life-Saathi/
│
└── safelifesaathi/
    │
    ├── src/
    ├── public/
    ├── server.ts
    ├── vite.config.ts
    ├── package.json
    └── tsconfig.json


---

## Getting Started

### Clone the repository

bash
git clone https://github.com/Pripri-07/Safe-Life-Saathi-.git


### Open the project

bash
cd Safe-Life-Saathi-


Then enter the application folder:

bash
cd safelifesaathi-–-smart-hospital-patient-management-system


### Install dependencies

bash
npm install


### Add the API key

Create a .env file:

env
GEMINI_API_KEY=your_gemini_api_key


Do not upload your actual API key to GitHub.

### Run locally

bash
npm run dev


---

## Production

Build the project:

bash
npm run build


Start the production server:

bash
npm start
The application can be deployed using a Node.js-compatible cloud platform such as Render.

---

## Current Prototype

The current prototype demonstrates:

* AI-based OPD guidance
* Prescription scanning
* Prescription explanation
* Digital patient queue
* Vaccination reminders
* Hospital dashboard
* Ambulance alert simulation
* Vehicle filtering based on road and direction

Some features, including real-time vehicle GPS, connected vehicles, hospital database integration, and production-grade healthcare infrastructure, are planned for future development.

---

## Future Improvements

* Real-time ambulance GPS tracking
* Integration with connected vehicles
* Live traffic information
* Push notifications
* Hospital information system integration
* Doctor and hospital dashboards
* Multilingual support
* Mobile application
* Improved authentication and security
* Hospital analytics

---

## What Makes SafeLifeSathi Different?

The ambulance feature is designed to avoid sending the same alert to every nearby vehicle.

The system focuses on vehicles that are:

*Ahead + Same Road + Same Direction + Within the defined range*

This makes the emergency notification more targeted and relevant.

---

## Vision

*Less Waiting. Better Care. Faster Emergency Response.*

SafeLifeSathi aims to connect patients, hospitals, and emergency services through one simple digital platform.

---

## Disclaimer

SafeLifeSathi is a student prototype created for demonstration and innovation purposes.

Information generated by the AI features should not be considered a medical diagnosis or a replacement for professional medical advice. A real-world healthcare deployment would require appropriate clinical validation, security measures, testing, and regulatory compliance.