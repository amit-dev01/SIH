# 🧊 Polar Science Outreach Portal — Backend API

### SIH26063 | National Centre for Polar and Ocean Research (NCPOR) | Ministry of Earth Sciences

---

## 📋 Problem Statement

NCPOR conducts vital polar expeditions to Antarctica, the Arctic, the Southern Ocean, and the Himalayas, generating massive amounts of scientific reports, field photography, video surveys, datasets, and peer-reviewed publications. Currently, this content is fragmented across disparate systems with no unified platform for digital preservation, geo-spatial discovery, or public science outreach.

## 💡 Our Solution

A high-performance, modular backend API that:
- **Archives** all expedition assets (reports, media, papers, datasets) in a centralized repository
- **Serves** geo-tagged data for interactive 2D/3D polar map visualization
- **Generates** AI-powered multi-platform social media posts from stored research
- **Disseminates** outreach through an administrative approval and scheduling workflow

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js 18+ (CommonJS) |
| **Framework** | Express.js 4.x |
| **Database & Auth** | Supabase (PostgreSQL 15 + Row Level Security + Auth JWT) |
| **File Storage** | Supabase Storage (S3-compatible bucket storage) |
| **AI / LLM** | Groq (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`), OpenAI, local Ollama, or built-in Mock mode |
| **Data Validation** | Zod 3.x |
| **Image Processing** | Sharp (dynamic WebP thumbnails) |
| **File Uploads** | Multer |
| **API Documentation** | Swagger UI (`/api-docs`) & OpenAPI 3.0 |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- A free Supabase project ([supabase.com](https://supabase.com))

### 1. Setup Supabase
1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** → run `database/setup.sql`.
3. In **Storage** → create 3 public buckets:
   - `polar-media`
   - `polar-publications`
   - `polar-datasets`
4. In **Project Settings → API** → copy the Project URL, `anon` public key, and `service_role` secret key.

### 2. Run the Server
```bash
# Clone the repository
git clone https://github.com/amit-dev01/SIH.git
cd SIH/polar-backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server (auto-reloading with nodemon)
npm run dev
```

### 3. Verify
- **Health Check**: [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)
- **Interactive Swagger Docs**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 📡 API Endpoints Summary

### Public Endpoints (No Auth)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Server and database health status |
| `GET` | `/api/v1/expeditions` | Paginated and filtered expedition list |
| `GET` | `/api/v1/expeditions/:id` | Expedition details by ID or Slug |
| `GET` | `/api/v1/expeditions/:id/stats` | Expedition stats (media, paper, dataset counts) |
| `GET` | `/api/v1/media` | List media assets with type & tag filters |
| `GET` | `/api/v1/media/:id` | Single media item details |
| `GET` | `/api/v1/publications` | Research papers list |
| `GET` | `/api/v1/publications/stats` | Publication metrics by year and expedition |
| `GET` | `/api/v1/publications/:id` | Publication details |
| `GET` | `/api/v1/datasets` | Scientific datasets list |
| `GET` | `/api/v1/datasets/:id` | Dataset details |
| `GET` | `/api/v1/datasets/:id/download` | Download dataset & increment download counter |
| `GET` | `/api/v1/search?q=` | Unified full-text search across all modules |
| `GET` | `/api/v1/search/suggest?q=` | Autocomplete title suggestions |
| `GET` | `/api/v1/map/locations` | Geo-tagged base stations & media pins |
| `GET` | `/api/v1/map/expeditions` | Expedition station coordinates |
| `GET` | `/api/v1/map/media` | Geo-tagged photo/video pins |
| `GET` | `/api/v1/outreach/published` | Public feed of approved & published posts |
| `GET` | `/api/v1/analytics/popular` | Popular content highlights |
| `GET` | `/api/v1/analytics/timeline` | Expedition timeline events |

### Protected Endpoints (Bearer Token Required)
| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `POST` | `/api/v1/expeditions` | `ADMIN`, `RESEARCHER` | Create expedition |
| `PUT` | `/api/v1/expeditions/:id` | `ADMIN`, `RESEARCHER` | Update expedition |
| `DELETE` | `/api/v1/expeditions/:id` | `ADMIN` | Delete expedition |
| `POST` | `/api/v1/media/upload` | `ADMIN`, `RESEARCHER` | Upload single media asset |
| `POST` | `/api/v1/media/bulk-upload` | `ADMIN`, `RESEARCHER` | Bulk upload media files |
| `DELETE` | `/api/v1/media/:id` | `ADMIN`, `RESEARCHER` | Delete media asset |
| `POST` | `/api/v1/publications` | `ADMIN`, `RESEARCHER` | Create publication (optional PDF) |
| `PUT` | `/api/v1/publications/:id` | `ADMIN`, `RESEARCHER` | Update publication |
| `DELETE` | `/api/v1/publications/:id` | `ADMIN` | Delete publication |
| `POST` | `/api/v1/datasets` | `ADMIN`, `RESEARCHER` | Upload and register scientific dataset |
| `PUT` | `/api/v1/datasets/:id` | `ADMIN`, `RESEARCHER` | Update dataset metadata |
| `DELETE` | `/api/v1/datasets/:id` | `ADMIN` | Delete dataset |
| `POST` | `/api/v1/outreach/generate` | `ADMIN`, `RESEARCHER` | AI generate social media post |
| `GET` | `/api/v1/outreach/drafts` | `ADMIN`, `RESEARCHER` | List generated outreach drafts |
| `PUT` | `/api/v1/outreach/:id` | `ADMIN`, `RESEARCHER` | Update draft content text |
| `PUT` | `/api/v1/outreach/:id/approve` | `ADMIN` | Approve outreach draft |
| `PUT` | `/api/v1/outreach/:id/reject` | `ADMIN` | Reject outreach draft |
| `PUT` | `/api/v1/outreach/:id/publish` | `ADMIN` | Mark outreach post as published |
| `PUT` | `/api/v1/outreach/:id/schedule` | `ADMIN` | Schedule draft for future release |
| `GET` | `/api/v1/analytics/overview` | `ADMIN` | Administrative dashboard metrics |
| `GET` | `/api/v1/analytics/content-calendar` | `ADMIN` | Outreach release calendar |
| `GET` | `/api/v1/analytics/activity-log` | `ADMIN` | Audit trail of actions |

---

## 🤖 AI Content Generation

Set `AI_PROVIDER` in `.env`:
- `groq` *(Primary)*: Ultra-fast LPUs powered by `llama-3.3-70b-versatile` or `llama-3.1-8b-instant` via `GROQ_API_KEY`.
- `mock` *(Demo-Safe)*: Produces realistic, NCPOR-tailored science communication templates without requiring an API key.
- `openai`: Connects to OpenAI (`gpt-4o-mini`) using `OPENAI_API_KEY`.
- `ollama`: Uses a local LLM (`llama3.2`) via `OLLAMA_URL`.

**Supported Output Formats:**
- **Twitter/X**: Catchy hooks with character limits ($\le 280$ chars) and hashtags.
- **Facebook**: Conversational narrative with call-to-action (100–200 words).
- **Instagram**: Descriptive captions with rich hashtags (100–150 words).
- **Website**: Structured article summaries with headlines (300–500 words).
- **LinkedIn**: Professional executive summaries highlighting national impact (150–250 words).

---

## 📁 Project Directory Structure

```
polar-backend/
├── database/
│   └── setup.sql            # PostgreSQL schema definition
├── src/
│   ├── config/              # Configuration (Supabase, Swagger, Environment)
│   │   ├── index.js
│   │   ├── supabase.js
│   │   └── swagger.js
│   ├── middleware/          # Express middlewares
│   │   ├── auth.js          # Supabase JWT & Role authorization
│   │   ├── errorHandler.js  # Global error & Zod validation handler
│   │   └── upload.js        # Multer memory storage & MIME filtering
│   ├── modules/             # Business logic modules
│   │   ├── analytics/
│   │   ├── dataset/
│   │   ├── expedition/
│   │   ├── health/
│   │   ├── map/
│   │   ├── media/
│   │   ├── outreach/
│   │   ├── publication/
│   │   └── search/
│   ├── services/            # Shared AI Service
│   │   └── ai.service.js
│   ├── utils/               # Common utilities
│   │   ├── apiResponse.js   # Standardized JSON response envelope
│   │   ├── asyncHandler.js  # Async route handler wrapper
│   │   ├── cache.js         # In-memory TTL cache
│   │   ├── logger.js        # ANSI colored logger
│   │   └── tagHelper.js     # Tag parser and storage URL extractor
│   ├── app.js               # Express application initialization
│   └── server.js            # Server entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 📄 License

Built for **Smart India Hackathon 2026** under Problem Statement **SIH26063**.
