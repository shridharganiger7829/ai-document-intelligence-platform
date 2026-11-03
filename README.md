# DocuFlow AI | Intelligent Document & Workflow Automation Platform

DocuFlow AI is an enterprise-grade multi-tenant B2B SaaS platform for document intelligence, OCR processing, Groq Cloud LLM structured data extraction, human-in-the-loop verification, administrative approval workflows, and immutable compliance auditing.

The visual interface is inspired by **Sight Banking / Modern Webflow SaaS**: featuring a dark marine teal palette (`#060F13` / `#0C1F24`), warm terracotta sunset accents (`#F26A36`), glassmorphic cards, floating metric pills, and split-screen document verification workspaces.

---

## 1. Technology Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v3.4 + Custom Dark Marine & Terracotta Theme
- **Icons**: Lucide React
- **Visual Analytics**: Recharts (Donut, Workflow Pipeline & Workload Distribution)
- **HTTP Client**: Centralized Axios with Bearer JWT Interceptors & Blob Streamers
- **Routing**: React Router DOM v7 (Role-based Protected Route Enforcers)
- **State & Alerts**: React Context API (`AuthContext`, `NotificationContext`)

### Backend
- **Framework**: Python 3.15 + Flask
- **Authentication**: Flask-JWT-Extended (Role & Company ID Tenant Claims)
- **ORM & Database**: SQLAlchemy + PostgreSQL (Supabase)
- **AI & OCR**: PyMuPDF + Groq Cloud LLM (`openai/gpt-oss-120b`, `qwen/qwen3.8-27b`)
- **Queueing & Async**: Celery + Redis

---

## 2. Quick Start Guide

### Start Backend API Server
```powershell
cd Backend
.\venv\Scripts\Activate.ps1
python run.py
```
> The backend runs on: `http://127.0.0.1:5000`

### Start Frontend Client
```powershell
cd Frontend
npm install
npm run dev
```
> The frontend runs on: `http://localhost:5173`

---

## 3. Verified Multi-Role Workspace Accounts

| Role | Email | Password | Primary Workflow |
|---|---|---|---|
| **Admin** | `alexander@sightintel.com` | `EnterpriseSecurePassword123!` | Executive dashboard, reviewer assignment, user management, pending approvals & audit logs |
| **Reviewer** | `sarah.reviewer@sightintel.com` | `ReviewerPass123!` | Assigned queue, split-screen PDF preview, data correction & verification submission |
| **Employee** | `john.employee@sightintel.com` | `EmployeePass123!` | Document ingestion, real-time status tracking & correction resubmissions |

*Note: You can also register any new company tenant at `/register` to test multi-tenant data isolation.*

---

## 4. Key Platform Features

1. **Enterprise Design System**:
   - High-contrast dark marine backdrop with radial teal glow
   - Floating 3D card statistics, live API health indicator, and interactive charts
   - Glassmorphic modal dialogs and confirmation drawers for destructive actions

2. **Split-Screen Review Workspace**:
   - **Left**: Authenticated PDF viewer with zoom controls, download, and multi-page preview
   - **Right**: Structured AI entity tables (Invoice #, Dates, Line Items, Financial Totals, Vendor/Client metadata) with inline correction fields and discrepancy findings log

3. **Complete Workflow Automation**:
   - **Company Registration**: Automatic tenant isolation with `company_id`
   - **Document Upload**: Single & bulk drag-and-drop PDF ingestion (up to 10 files, 16 MB each)
   - **AI Extraction**: Synchronous OCR and Groq LLM structured data extraction
   - **Reviewer Assignment**: Administrative workload allocation across active reviewers
   - **Review Verification**: Reviewers inspect PDFs, correct fields, log findings, and submit decisions
   - **Admin Approval**: Final compliance sign-off or change request
   - **Audit Logs**: Immutable activity logging with actor, target entity, IP, and payload inspection
