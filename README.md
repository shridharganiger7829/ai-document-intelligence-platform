# DocuFlow AI — Enterprise AI Document Intelligence & Workflow Automation Platform

[![Live Frontend (Vercel)](https://img.shields.io/badge/Frontend-Vercel%20Live-brightgreen?style=for-the-badge&logo=vercel)](https://ai-document-intelligence-platform-o3s1-pghxxcavy-acme-9507.vercel.app)
[![Live Backend (Render)](https://img.shields.io/badge/Backend-Render%20Live-blue?style=for-the-badge&logo=render)](https://ai-travel-operations-platform-1.onrender.com)
[![Database (Supabase)](https://img.shields.io/badge/Database-Supabase%20Postgres-emerald?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Groq AI](https://img.shields.io/badge/AI%20Inference-Groq%20Cloud%20LLM-orange?style=for-the-badge&logo=fastapi)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

> A modern, multi-tenant B2B SaaS platform that automates document ingestion, PyMuPDF optical character recognition (OCR), Groq Cloud LLM structured data extraction, human-in-the-loop split-screen verification, executive approval workflows, and immutable compliance auditing.

---

## 🌐 Live Deployments

| Component | Provider | Live URL |
|---|---|---|
| **Web Client (Frontend)** | **Vercel** | **[ai-document-intelligence-platform-o3s1-pghxxcavy-acme-9507.vercel.app](https://ai-document-intelligence-platform-o3s1-pghxxcavy-acme-9507.vercel.app)** |
| **API Server (Backend)** | **Render** | **[ai-travel-operations-platform-1.onrender.com](https://ai-travel-operations-platform-1.onrender.com)** |
| **GitHub Repository** | **GitHub** | **[github.com/shridharganiger7829/ai-document-intelligence-platform](https://github.com/shridharganiger7829/ai-document-intelligence-platform)** |

---

## 📸 Visual Design Philosophy

The user interface is inspired by **Sight Banking / Modern Webflow SaaS**:
- **Color Palette**: Deep marine slate background (`#060F13` / `#0C1F24`), warm terracotta sunset accents (`#F26A36`), with emerald and ice-sky telemetry badges.
- **Enterprise Controls**: Floating 3D metric cards, responsive collapsible sidebar, glassmorphic modal dialogs, and a split-screen review workspace.
- **Data Visualizations**: Interactive Recharts analytics covering document lifecycle states and reviewer workload allocation.

---

## 📑 Table of Contents

1. [Platform Architecture](#-platform-architecture)
2. [Key Features](#-key-features)
3. [User Roles & Permissions](#-user-roles--permissions)
4. [Document Workflow Lifecycle](#-document-workflow-lifecycle)
5. [Complete API Reference](#-complete-api-reference)
6. [Technology Stack](#-technology-stack)
7. [Environment Variables](#-environment-variables)
8. [Local Development Setup](#-local-development-setup)
9. [Pre-configured Test Accounts](#-pre-configured-test-accounts)
10. [Production Deployment Guide (Render & Vercel)](#-production-deployment-guide)
11. [Supabase Keep-Alive Automation (GitHub Actions)](#-supabase-keep-alive-automation)

---

## 🏗 Platform Architecture

```
                                  [ Client Browser ]
                                          │
                        (Vercel SPA - React 19 + Vite)
                                          │
                     HTTPS REST API / Bearer JWT / PDF Blobs
                                          │
                                          ▼
                         [ Render Cloud Python Service ]
                           (Gunicorn + Flask 3.1 WSGI)
                                          │
          ┌───────────────────────────────┼──────────────────────────────┐
          ▼                               ▼                              ▼
 [ PyMuPDF + Groq LLM ]          [ Celery + Redis ]            [ Supabase Postgres ]
  • Layout OCR & Text             • Batch Task Queue            • companies (Tenants)
  • Structured JSON Parsing       • Async Status Polling        • users (RBAC)
  • Line Item & Tax Extraction                                  • documents (JSONB)
                                                                • audit_logs (Immutable)
```

---

## ✨ Key Features

- **Multi-Tenant Isolation**: Organizations have separate data silos. Every database query enforces tenant boundaries via `company_id`.
- **Two-Stage AI Extraction**:
  1. *Stage 1 (PyMuPDF OCR)*: Extracts text from PDFs up to 16 MB.
  2. *Stage 2 (Groq Cloud LLM)*: Transforms raw text into structured JSON (invoice metadata, vendor, customer, line items table, financial totals).
- **Split-Screen Reviewer Workspace**:
  - *Left*: High-resolution PDF viewer with zoom and download.
  - *Right*: Extracted AI entities with inline editing, findings log, and decision buttons (`verified`, `corrections_requested`, `flagged_for_admin`).
- **Executive Approval Pipeline**: Admins inspect reviewer findings and grant final sign-offs (`approved`, `rejected`, `corrections_requested`).
- **Employee Correction Loop**: Employees receive notifications, correct flagged values, and resubmit for verification.
- **Immutable Audit Logging**: Every critical action logs the actor, entity, status change, remote IP, and timestamp.
- **Automated Supabase Heartbeat**: Scheduled GitHub Action pings the database every 3 days to prevent free-tier auto-pausing.

---

## 👥 User Roles & Permissions

| Capability | Admin (Company Manager) | Reviewer (Data Verifier) | Employee (Submitter) |
|---|:---:|:---:|:---:|
| **Register Organization** | ✅ | ❌ | ❌ |
| **Manage Users & Roles** | ✅ | ❌ | ❌ |
| **Upload Single & Bulk PDFs** | ✅ | ❌ | ✅ |
| **View All Company Documents** | ✅ | ❌ *(Assigned only)* | ❌ *(Own uploads only)* |
| **Trigger AI OCR Extraction** | ✅ | ✅ *(Assigned only)* | ❌ |
| **Split-Screen Verification** | ❌ | ✅ | ❌ |
| **Final Administrative Sign-Off** | ✅ | ❌ | ❌ |
| **Resubmit Corrections** | ❌ | ❌ | ✅ |
| **View Compliance Audit Logs** | ✅ | ❌ | ❌ |

---

## 🔄 Document Workflow Lifecycle

```mermaid
flowchart TD
    UP["uploaded"] -->|PyMuPDF + Groq AI| EX["extracted"]
    EX -->|Admin Assigns Reviewer| AR["Assigned to Reviewer"]
    AR -->|Reviewer Verification| RS["review_submitted"]
    
    RS -->|Admin Approves| AP["approved"]
    RS -->|Admin Rejects| RJ["rejected"]
    RS -->|Corrections Needed| CR["corrections_requested"]
    
    CR -->|Employee Resubmits| EX
    
    style AP fill:#10b981,stroke:#059669,color:#fff
    style RJ fill:#ef4444,stroke:#dc2626,color:#fff
    style CR fill:#f26a36,stroke:#ea580c,color:#fff
```

1. **`uploaded`**: PDF stored in backend storage; MIME and 16 MB limit validated.
2. **`processing`**: PyMuPDF extracts text layout; Groq LLM parses structured JSON.
3. **`extracted`**: Structured entities stored in PostgreSQL JSONB; ready for review.
4. **`review_submitted`**: Reviewer verified values, made inline corrections, and submitted findings.
5. **`approved`**: Admin finalized executive sign-off; document cleared.
6. **`rejected`**: Admin declined document.
7. **`corrections_requested`**: Flagged back to employee for discrepancy resolution.

---

## 📡 Complete API Reference

All protected endpoints require `Authorization: Bearer <JWT_ACCESS_TOKEN>`.

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Body / Params | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Public | `{ company_name, name, email, password }` | Registers company and initial Admin. |
| `POST` | `/api/auth/login` | Public | `{ email, password }` | Authenticates user; returns access token and role. |

### 2. Dashboard Analytics (`/api/dashboard`)
| Method | Endpoint | Access | Response | Description |
|---|---|---|---|---|
| `GET` | `/api/dashboard/admin` | Admin | `{ statistics, reviewer_workload }` | Total docs, reviews, approvals, active users. |
| `GET` | `/api/dashboard/reviewer` | Reviewer | `{ statistics }` | Assigned, pending, verified, flagged counts. |
| `GET` | `/api/dashboard/employee` | Employee | `{ statistics }` | Uploaded, processing, approved, rejected counts. |

### 3. User & Team Management (`/api/users`)
| Method | Endpoint | Access | Body / Params | Description |
|---|---|---|---|---|
| `GET` | `/api/users/` | Admin | None | Lists company team members. |
| `POST` | `/api/users/` | Admin | `{ name, email, password, role }` | Creates Reviewer or Employee account. |
| `PATCH` | `/api/users/<id>/status` | Admin | `{ is_active: bool }` | Activates/deactivates user (protects self). |

### 4. Document Ingestion & Workflows (`/api/documents`)
| Method | Endpoint | Access | Body / Params | Description |
|---|---|---|---|---|
| `POST` | `/api/documents/upload` | Admin, Employee | `multipart/form-data`: `file`, `document_type` | Uploads single PDF (max 16 MB). |
| `POST` | `/api/documents/bulk-upload` | Admin, Employee | `multipart/form-data`: `files` (up to 10) | Bulk upload of business PDFs. |
| `GET` | `/api/documents/` | All Roles | `search`, `status`, `page`, `per_page` | Paginated documents filtered by tenant. |
| `PATCH` | `/api/documents/<id>/assign-reviewer` | Admin | `{ reviewer_id: int }` | Assigns company reviewer to document. |
| `GET` | `/api/documents/<id>/review` | Reviewer | None | Fetches document and AI extraction for review. |
| `POST` | `/api/documents/<id>/review` | Reviewer | `{ decision, comments, findings, corrected_data }` | Submits reviewer findings (`verified`, etc.). |
| `GET` | `/api/documents/pending-reviews` | Admin | None | Documents awaiting admin approval. |
| `PATCH` | `/api/documents/<id>/admin-decision` | Admin | `{ decision, comments }` | Final decision (`approved`, `rejected`, etc.). |
| `GET` | `/api/documents/<id>/tracking` | Employee | None | Lifecycle tracking and reviewer feedback. |
| `POST` | `/api/documents/<id>/resubmit-corrections` | Employee | `{ corrected_data, comments }` | Resubmits corrected document. |
| `GET` | `/api/documents/<id>/preview` | All Roles | None | Streams PDF blob with auth validation. |
| `GET` | `/api/documents/<id>/download` | All Roles | None | Downloads original PDF file. |

### 5. AI Processing (`/api/processing`)
| Method | Endpoint | Access | Body / Params | Description |
|---|---|---|---|---|
| `POST` | `/api/processing/<id>/extract` | Admin, Reviewer | None | Synchronous OCR + Groq LLM extraction. |
| `POST` | `/api/processing/bulk-extract` | Admin, Reviewer | `{ document_ids: int[] }` | Async Celery batch extraction. |
| `GET` | `/api/processing/status/<id>` | All Roles | None | Current extraction status. |
| `POST` | `/api/processing/bulk-status` | All Roles | `{ document_ids: int[] }` | Batch progress status. |

### 6. Audit & Compliance (`/api/audit-logs`)
| Method | Endpoint | Access | Body / Params | Description |
|---|---|---|---|---|
| `GET` | `/api/audit-logs/` | Admin | `page`, `per_page`, `action`, `user_id` | Audit trail of all actions. |

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v3.4 + Custom Dark Marine & Terracotta Theme
- **Icons**: Lucide React
- **Analytics Charts**: Recharts
- **HTTP Client**: Axios (Bearer token interceptor, 401 handling, blob streaming)
- **Routing**: React Router DOM v7 (Role-based Protected Routes)
- **State Management**: React Context API (`AuthContext`, `NotificationContext`)

### Backend
- **Framework**: Python 3.14/3.15 + Flask 3.1
- **WSGI Production Server**: Gunicorn 23.0
- **Database & ORM**: Supabase PostgreSQL + SQLAlchemy 2.1
- **Authentication**: Flask-JWT-Extended 4.7
- **AI & OCR Engines**:
  - `PyMuPDF 1.28`: PDF text and layout extraction
  - `Groq Cloud SDK 1.7`: LLM structured JSON mapping (`openai/gpt-oss-120b`, `qwen/qwen3.8-27b`)
- **Background Tasks**: Celery 5.6 + Redis 8.1

---

## ⚙️ Environment Variables

### Backend (`Backend/.env` / Render Environment Variables)
```ini
# Flask Secrets
SECRET_KEY=your-production-secret-key-min-32-chars
JWT_SECRET_KEY=your-production-jwt-secret-key

# Database Connection (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres?sslmode=require

# Groq Cloud AI
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
GROQ_VISION_MODEL=qwen/qwen3.8-27b

# Celery & Redis (Optional for batch mode)
REDIS_URL=redis://localhost:6379/0
```

### Frontend (`Frontend/.env` / Vercel Environment Variables)
```ini
# Production API endpoint (Render Backend)
VITE_API_BASE_URL=https://ai-travel-operations-platform-1.onrender.com

# Local development fallback
# VITE_API_BASE_URL=http://127.0.0.1:5000
```

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **Python**: v3.10+ (tested on Python 3.14 and 3.15)
- **Git**

### 2. Clone the Repository
```bash
git clone https://github.com/shridharganiger7829/ai-document-intelligence-platform.git
cd ai-document-intelligence-platform
```

### 3. Backend Setup
```bash
cd Backend
python -m venv venv

# Windows:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python run.py
```
> Backend runs at `http://127.0.0.1:5000`

### 4. Frontend Setup
```bash
cd ../Frontend
npm install
npm run dev
```
> Frontend runs at `http://localhost:5173`

---

## 🔑 Pre-configured Test Accounts

You can test every role on the live Vercel deployment:

| Role | Email | Password | Primary Workflow |
|---|---|---|---|
| **Admin** | `alexander@sightintel.com` | `EnterpriseSecurePassword123!` | Executive dashboard, reviewer assignment, user management, pending approvals, and audit logs |
| **Reviewer** | `sarah.reviewer@sightintel.com` | `ReviewerPass123!` | Assigned queue, split-screen PDF preview, data correction, and review submission |
| **Employee** | `john.employee@sightintel.com` | `EmployeePass123!` | Document upload, real-time status tracking, and correction resubmissions |

*Note: You can also register a new company at [`/register`](https://ai-document-intelligence-platform-o3s1-pghxxcavy-acme-9507.vercel.app/register) to test tenant isolation.*

---

## 🚀 Production Deployment Guide

### Deploying the Backend on Render
1. Create a **Web Service** on [Render](https://render.com) connected to your repository.
2. Configure settings:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn "app:create_app()"` (or `gunicorn wsgi:app`)
3. Add Environment Variables:
   - `DATABASE_URL`, `SECRET_KEY`, `JWT_SECRET_KEY`, `GROQ_API_KEY`.
4. Render will deploy and assign an HTTPS URL (e.g., `https://ai-travel-operations-platform-1.onrender.com`).

### Deploying the Frontend on Vercel
1. Import the project on [Vercel](https://vercel.com).
2. Set **Root Directory** to `Frontend`.
3. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://ai-travel-operations-platform-1.onrender.com`
4. Deploy. Vercel builds the SPA and handles client-side routing.

---

## ⏰ Supabase Keep-Alive Automation

Supabase free-tier projects pause after **7 days of inactivity**. This repository includes a GitHub Action to prevent pausing.

### Workflow Details ([`.github/workflows/keep_supabase_active.yml`](.github/workflows/keep_supabase_active.yml))
- **Trigger**: Runs every 3 days at `06:00 UTC` (`0 6 */3 * *`).
- **Heartbeat Script** ([`scripts/keep_supabase_active.py`](scripts/keep_supabase_active.py)): Executes a lightweight PostgreSQL query (`SELECT NOW()`, database name, active record count).
- **Manual Trigger**: Can be run on demand from the **Actions** tab on GitHub (`workflow_dispatch`).

### Enabling in GitHub:
1. Go to **Settings** > **Secrets and variables** > **Actions** in your GitHub repository.
2. Click **New repository secret**:
   - **Name**: `DATABASE_URL`
   - **Value**: Your Supabase PostgreSQL connection string.
3. The action runs automatically every 3 days to keep your Supabase instance active.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
