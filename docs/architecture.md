# Cloud-Based Disaster Management Platform - System Architecture

## Overview
DisasterGuard is a full-stack, cloud-native emergency response and disaster management web platform designed on **Amazon Web Services (AWS)**. It enables citizens to report disaster hazards, transmit high-priority SOS distress signals, receive emergency broadcasts, locate evacuation shelters, and coordinate response operations across municipal authorities and first-responder rescue units.

---

## 1. High-Level Architecture Diagram

```
[ Citizens & Public ]         [ Operations Authority ]       [ Rescue Teams ]       [ Admin ]
         |                                |                          |                 |
         +--------------------------------+--------------------------+-----------------+
                                          |
                                          v
                      [ React + Vite + TypeScript Frontend ]
                                          |
                     +--------------------+--------------------+
                     |                                         |
                     v                                         v
         [ Amazon Cognito User Pool ]                 [ Amazon API Gateway ]
         - CITIZEN group                              - REST APIs with CORS
         - AUTHORITY group                            - Cognito Authorizer
         - RESCUE_TEAM group                          - Request validation
         - ADMIN group                                         |
                                                               v
                                                      [ AWS Lambda (Node.js) ]
                                                      - incidents.handler
                                                      - sos.handler
                                                      - rescue.handler
                                                      - shelters.handler
                                                      - alerts.handler
                                                      - stats.handler
                                                      - uploads.handler
                                                               |
                     +--------------------+--------------------+--------------------+
                     |                    |                    |                    |
                     v                    v                    v                    v
            [ Amazon DynamoDB ]     [ Amazon S3 ]        [ Amazon SNS ]       [ CloudWatch ]
            - disaster_incidents    - Private Bucket     - Emergency Broadcast - Log Groups
            - disaster_sos          - AES256 Encryption    Topic               - Structured JSON
            - disaster_rescue_teams - Presigned URLs     - SMS / Email Alerts  - 14-day retention
            - disaster_shelters     - CORS Configuration
            - disaster_resources
            - disaster_alerts
```

---

## 2. Core Subsystems

### A. Authentication & Role-Based Access Control (RBAC)
- Built on **Amazon Cognito User Pools**.
- Four distinct privilege levels:
  1. `CITIZEN`: Can report incidents, transmit SOS distress signals, view public incidents/shelters, and receive emergency alerts.
  2. `AUTHORITY`: Triage incidents, change severity, verify damage, dispatch rescue teams, and broadcast official SNS alerts.
  3. `RESCUE_TEAM`: Update operational status (`Available`, `Dispatched`, `On Scene`, `Resting`), view assigned incident tickets, log response progress, and complete rescue missions.
  4. `ADMIN`: Full control over user role assignments, DynamoDB record governance, CloudWatch audit inspection, and system configuration.

### B. Incident Triage Engine
- Supports standardized disaster classifications: `Flood`, `Fire`, `Earthquake`, `Cyclone`, `Landslide`, `Industrial Accident`, `Building Collapse`, `Other Emergency`.
- Enforces severity graduation: `Low` &rarr; `Medium` &rarr; `High` &rarr; `Critical`.
- Incident lifecycle progression: `Reported` &rarr; `Under Review` &rarr; `Verified` &rarr; `Response Assigned` &rarr; `In Progress` &rarr; `Resolved` &rarr; `Closed`.

### C. SOS Beacon Distress Dispatch
- Fast-path emergency beacon transmission.
- Transmits GPS coordinates, requester contact, people at risk, and emergency category.
- Prominent statutory disclaimers emphasizing official phone services (911/112).
- Real-time status tracking for citizens and direct dispatch for authorities.

### D. Secure Attachment Upload (Amazon S3)
- Media attachments (damage photos, flood evidence) are uploaded directly to Amazon S3 via short-lived (15 min) presigned URLs.
- MIME type restriction (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`) and 10MB file limit enforcement.
- S3 bucket is 100% private with AWS S3 Block Public Access enabled.

### E. Emergency Broadcasting (Amazon SNS)
- Broadcasts immediate emergency alerts to registered citizens and responders across affected geographical zones.
- Publishes with subject lines, severity attributes, and action directives.

### F. Evacuation Shelters & Relief Supplies
- Tracks community shelters with live occupancy counters, bed capacity, amenities, and facility managers.
- Manages relief inventory across key categories: Trauma Medical Kits, Potable Water, Rescue Boats, and Emergency Generators.
