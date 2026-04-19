# SyncTalent AI - Precision Matching Platform

Built for the **Microsoft Elevate Hackathon (Dicoding AI Impact Challenge)**. This platform solves the mismatch problem in recruitment using high-precision AI analysis and skill validation.

## ✨ Features

- **Hard-Locking Matching**: Prevents applications if core skills don't match.
- **AI Skill Gap Analysis**: Detects missing competencies and recommends Microsoft Learn paths.
- **Precision Posting**: AI-driven job descriptions and automated validation tests.
- **Premium UX**: Dynamic animations, glassmorphism, and responsive dashboard.

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion
- **AI Services**: 
  - Azure AI Document Intelligence (CV Parsing)
  - Azure AI Language (Skill Extraction & Matching)

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ installed.
- A Microsoft Azure account.

### 2. Set Up Environment Variables
Create a `.env` file in the root directory (based on `.env.example`) and fill in your Azure API credentials:

```bash
# Azure AI Document Intelligence
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com/
AZURE_DOCUMENT_INTELLIGENCE_KEY=your_key_here

# Azure AI Language
AZURE_LANGUAGE_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com/
AZURE_LANGUAGE_KEY=your_key_here
```

### 3. Run the Development Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

- `src/app`: Application routes and pages.
- `src/components`: Reusable UI components.
- `src/lib`: Logic for Azure AI integration.
- `src/app/candidate`: Candidate-facing matching dashboard.
- `src/app/employer`: Employer-facing precision hiring dashboard.

## 📝 Hackathon Submission Notes
- **Challenge Match**: This project corresponds to **Challenge #22 (Job Matching & Workforce Upskilling)**.
- **AI Usage**: Uses Azure AI to bridge the gap between CVs and Job Descriptions.
- **Azure Usage**: Implements `DocumentAnalysisClient` and `TextAnalysisClient` via the official Azure SDKs.
