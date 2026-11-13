# CyberMine ThreatMine

**A Big Data Mining-Based Cyber Threat Intelligence System**

CyberMine ThreatMine is a cybersecurity analytics project designed to analyze network and security logs, discover suspicious patterns, detect anomalous behaviour, classify malicious activity, and present security insights through an interactive dashboard.

The project brings together four areas:

- **Big Data:** processing and organizing large volumes of security events.
- **Data Mining:** discovering patterns, clusters, and relationships in security logs.
- **Artificial Intelligence:** identifying anomalies and classifying potentially malicious activity.
- **Cybersecurity:** correlating events and helping analysts investigate possible threats.

## Key capabilities

The application is designed around the following modules:

| Module | Purpose |
|---|---|
| Overview | Summarizes processed events, threat levels, and incidents. |
| Log Explorer | Uploads, searches, and filters security log data. |
| Threat Detection | Presents anomaly and malicious-activity detection results. |
| Attack Correlation | Groups related events from different security sources into incidents. |
| Threat Memory | Tracks recurring and emerging suspicious patterns. |
| Data Mining | Presents clusters and association-rule results. |
| AI Analytics | Displays model metrics and analysis results. |
| Reports | Provides security summaries and export options. |
| Settings | Manages application and analysis settings. |

## Proposed project improvements

CyberMine ThreatMine focuses on three additional capabilities:

1. **Multi-Source Attack Correlation** — connect related network, firewall, system, and authentication events to provide incident-level context rather than treating every log entry independently.
2. **Explainable Threat Scoring** — calculate a configurable risk score and show the factors that contributed to it, so analysts can understand why an event was prioritized.
3. **Emerging Threat Memory** — retain suspicious patterns, track their recurrence over time, and flag patterns that may warrant further investigation.

These are project design goals. A pattern flagged as suspicious should not be treated as a confirmed attack until it has been investigated.

## Current technology

### Frontend in this repository

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Lucide React

### Backend and analytics architecture

The frontend API service is configured to call endpoints under `/api` for datasets, log events, detection, correlation, threat memory, data mining, model analytics, reports, and settings.

A Python backend (for example, FastAPI), data-processing components, persistent storage, and machine-learning/data-mining models are part of the intended system architecture. Check the implementation and deployment configuration before assuming these services are available or running.

## Application structure

```text
src/
├── components/
│   ├── common/
│   ├── layout/
│   └── views/
├── services/
│   └── api.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

## Getting started

### Prerequisites

- Node.js (LTS recommended)
- npm

### Install dependencies

```bash
npm install
```

### Run the frontend development server

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal.

### Build for production

```bash
npm run build
```

### Run lint checks

```bash
npm run lint
```

> **Backend note:** The frontend calls the `/api` endpoints listed in `src/services/api.ts`. To use data-driven features, configure and run a compatible backend and its API routing/proxy. The frontend alone does not perform the full log processing or model training.

## Data and evaluation

The planned workflow supports security-log datasets such as **CIC-IDS2017** and **UNSW-NB15**, subject to implementing the appropriate dataset loaders and column mappings. Dataset-specific preprocessing and evaluation should be documented, and reported model metrics should come from actual experiments rather than placeholder values.

## Project workflow

```text
Network / Security Logs
        ↓
Data Ingestion and Validation
        ↓
Cleaning and Feature Extraction
        ↓
Big Data Processing
        ↓
Data Mining and AI Analysis
        ↓
Anomaly Detection and Classification
        ↓
Attack Correlation and Threat Scoring
        ↓
Emerging Threat Memory
        ↓
Interactive Security Dashboard
```

## Project status

This repository currently contains the React + TypeScript frontend. Backend services, dataset processing, model training, and end-to-end functionality should be verified separately as development progresses. Do not interpret dashboard elements or sample records as validated detection results unless they are connected to a working backend and real evaluation data.

## Academic project

Developed as an academic mini project in the area of Information Science and Engineering.

**Project name:** CyberMine ThreatMine  
**Focus:** Big Data Processing • Data Mining • Artificial Intelligence • Cybersecurity
