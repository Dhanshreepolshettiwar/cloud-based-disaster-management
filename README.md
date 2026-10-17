# DisasterGuard: Cloud-Based Disaster Management Platform

A modern, cloud-native full-stack disaster management and emergency response platform built on **Amazon Web Services (AWS)** with **React + TypeScript + Vite** on the frontend and **Serverless AWS Lambda (Node.js)** on the backend.

---

## 🌟 Key Features

1. **🚨 Citizen Emergency Distress & Reporting Portal**:
   - Immediate **SOS Emergency Distress Beacon** with GPS coordinate detection, number of people at risk, and emergency category.
   - Disaster incident reporting with category selection (`Flood`, `Fire`, `Earthquake`, `Cyclone`, `Landslide`, `Industrial Accident`, etc.) and severity indicators (`Low`, `Medium`, `High`, `Critical`).
   - Damage evidence and photo attachments uploaded directly to private Amazon S3 buckets via secure presigned URLs.
   - Interactive disaster map showing real-time incidents with color-coded severity markers and active shelter locations.
   - Real-time emergency directives and safety guidelines.

2. **📡 Authority Operations & Command Center**:
   - Live operational dashboard with real metrics: active incidents, critical emergencies, open SOS distress calls, dispatched rescue units, and shelter vacancy.
   - Real-time incident triage: verify incidents, escalate severity, progress status (`Reported` &rarr; `Verified` &rarr; `Response Assigned` &rarr; `In Progress` &rarr; `Resolved`), and assign rescue units.
   - SOS distress call queue with one-click acknowledgement, team dispatch, and rescue verification.
   - Emergency broadcast publisher integrated directly with **Amazon SNS** to transmit critical regional alerts.

3. **🚑 Rescue Team Coordination Hub**:
   - Field responder management console with operational status toggles (`Available`, `Dispatched`, `On Scene`, `Resting`).
   - Incident & SOS mission ticket assignments with GPS location and victim count.
   - Mission resolution and progress tracking.

4. **🏠 Emergency Shelters & Relief Supplies Directory**:
   - Live community shelter directory tracking total bed capacity vs current occupancy.
   - Dynamic occupancy adjustment for shelter coordinators.
   - Relief supplies inventory (Trauma Medical Kits, Clean Drinking Water, Inflatable Boats, Heavy-Duty Generators).

5. **🛡️ System Administration & Cloud Governance**:
   - Role-Based Access Control (RBAC) supporting four roles: `CITIZEN`, `AUTHORITY`, `RESCUE_TEAM`, `ADMIN`.
   - Live simulated **Amazon CloudWatch** structured JSON logging and audit telemetry.
   - System state reset and data seeding.

---

## 🏗️ Architecture & AWS Tech Stack

```
React (TypeScript + Vite)
        │
        ▼
Amazon Cognito (User Pool & Groups: CITIZEN, AUTHORITY, RESCUE_TEAM, ADMIN)
        │
        ▼
Amazon API Gateway (REST APIs + CORS)
        │
        ▼
AWS Lambda Functions (Node.js 20.x)
        ├── Amazon DynamoDB (disaster_incidents, disaster_sos, rescue_teams, shelters, alerts)
        ├── Amazon S3 (Private Bucket with Presigned URLs for Media Uploads)
        ├── Amazon SNS (Emergency Alerts Broadcast Topic)
        └── Amazon CloudWatch (Structured Logging & Audit Trails)
```

---

## 🚀 Dual-Mode Setup: Run Locally or on Live AWS

This platform features a **Dual-Mode Architecture**:
- **Local Dev & Demo Mode (Default)**: Runs 100% locally with simulated backend storage and rich initial disaster scenarios. You do not need an active AWS account or credentials to run, test, and demo the entire platform!
- **Live AWS Cloud Mode**: Set your AWS credentials and API Gateway URL, and the application connects directly to live AWS resources.

---

## 💻 Quick Start: Running Locally

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Run the Frontend Web Application
```bash
cd "C:\cc project\cloud management platform\frontend"
npm install
npm run dev
```
Open your browser at `http://localhost:5173`. You can switch between all 4 roles (`CITIZEN`, `AUTHORITY`, `RESCUE_TEAM`, `ADMIN`) using the role switcher in the top navigation bar!

### 2. Run Backend Unit & Integration Tests
```bash
cd "C:\cc project\cloud management platform\backend"
npm install
npm test
```
All 7 backend handler test suites will run and verify:
- Incident reporting & retrieval
- RBAC permission enforcement (blocking citizen privilege escalation)
- SOS beacon submission with emergency disclaimer notices
- Rescue team and shelter roster retrieval
- Amazon SNS alert broadcasting
- Amazon S3 presigned upload URL signing
- Dashboard operational metrics calculation

---

## ☁️ Deploying to Real AWS (When AWS Account Activation Completes)

Once your AWS account has completed payment and identity verification:

1. **Install AWS SAM CLI** (if not already installed).
2. **Configure AWS Credentials**:
   ```bash
   aws configure
   # Enter AWS Access Key ID, Secret Access Key, and Region (e.g. us-east-1)
   ```
3. **Deploy Infrastructure**:
   ```bash
   cd "C:\cc project\cloud management platform\infrastructure"
   sam build
   sam deploy --guided
   ```
   SAM will provision:
   - Amazon Cognito User Pool & Web Client
   - 6 Amazon DynamoDB Tables with GSIs
   - 1 Amazon S3 Private Bucket with CORS rules
   - 1 Amazon SNS Emergency Topic
   - 1 Amazon API Gateway REST API
   - 7 AWS Lambda Functions with least-privilege IAM policies
   - CloudWatch Log Groups

4. **Connect Frontend to Live API**:
   Create a `.env` file in `frontend/`:
   ```ini
   VITE_API_BASE_URL=https://<your-api-id>.execute-api.us-east-1.amazonaws.com/prod
   ```
   Then run `npm run build && npm run preview`!

---

## 🌿 Git Branches

- `dhanshree`: Primary feature development branch.
- `main`: Production release branch.

Repository: [https://github.com/Dhanshreepolshettiwar/cloud-based-disaster-management.git](https://github.com/Dhanshreepolshettiwar/cloud-based-disaster-management.git)
