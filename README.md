# NexusHive Solutions LLP — Enterprise Corporate Portal & Custom CMS

A premium, highly interactive corporate website, knowledge hub, and custom content management system (CMS) for **NexusHive Solutions LLP**, a premier Indian consulting firm specializing in HR strategy, labour law compliance, startup advisory, payroll systems, POSH compliance, staffing, and corporate modernization.

Designed with an elite, consulting-focused branding aesthetic, the portal integrates modern UI components, smooth micro-interactions, responsive mega-navigation, a resource hub containing interactive documentation tools, and a local server-powered administration dashboard that allows managing all page content.

---

## 🌐 Overview & Core Verticals

NexusHive Solutions serves as a strategic infrastructure partner for high-growth startups and established enterprises across India. The website establishes a strong corporate identity through carefully segmented consulting pillars, premium layout elements, real-time trust validation, and interactive lead-generation systems.

The portal covers:
*   **HR Strategy & Organizational Architecture**: Org structure, policy manuals, and audit readiness.
*   **Labour Law & Statutory Compliance**: Labour law filings, inspections, and regulatory adherence.
*   **POSH Consulting & Internal Committee (IC) Support**: Corporate sensitization training and compliance management.
*   **Talent Sourcing & Staffing**: Executive search, candidate sourcing, and onboarding protocols.
*   **Payroll & Finance Operations**: End-to-end payroll automation, TDS, GST flows, and filings.
*   **Training & Skilling**: Specialized workforce workshops.
*   **Business Growth & Technology Enablement**: Modernizing IT systems, software procurement, and organizational growth.

---

## 🚀 Key Features

### 1. In-Browser Microsoft Office Online PPT Viewer Modal
Located in the [Resources & Knowledge Hub](file:///c:/Users/Abhishekh/nexushivesolutionss/resources.html), this custom viewer allows users to view presentation resources like the **India Compliance Calendar** and the **NexusHive Startup Guide** directly on the website without downloading them.
*   **Localhost Fallback**: Since Microsoft's embedding API requires a publicly accessible URL, the viewer dynamically checks if the site is running locally (`localhost`, `127.0.0.1`, or `""`). If local, it presents a user-friendly notice indicating how to view it locally, while hiding the loader.
*   **Interactive Controls**: Includes dynamic title rendering, loading states (using custom-designed CSS spinners), escape key event handling, overlay clicking for modal dismissal, and download actions.

### 2. Auto-Scrolling Recent Events & Workshops Marquee
An elegant, continuous horizontal ticker banner displayed on the [Home Page](file:///c:/Users/Abhishekh/nexushivesolutionss/index.html) to keep users updated on upcoming events, such as:
*   *HR Compliance Essentials Workshop* (Mumbai)
*   *Payroll & Statutory Flow Masterclass* (Online Zoom Webinar)
*   *People Operations Roundtable* (Bengaluru)
*   The ticker features automatic keyframe animations, card overlays, calendar badges, and direct links to register.

### 3. Responsive Mega Navigation System
An enterprise-grade header layout on all pages featuring:
*   A multi-column desktop dropdown system grouping services into clear, logical sub-categories.
*   Smooth hamburger transition state (bars rotating to form a close icon) for mobile device views.
*   Mobile slide-out overlay menu.

### 4. Interactive Services Carousel Slider
A responsive touch-ready services carousel on the home page highlighting operational capabilities. Includes navigation controls (Prev/Next buttons) and smooth CSS transforms (`translateY` hover shifts, shadows, and content reveals).

### 5. Custom CMS Administration Dashboard
The portal features an integrated visual admin panel (`admin.html` & `js/admin.js`) served by a lightweight Node.js/Express backend (`server.js`) that reads and writes page configurations dynamically as JSON databases.
*   **Image File Uploads**: Interactive file pickers replace manual file paths. Users select files directly from their local machine, which are base64-encoded, uploaded to the server's `img/` folder on disk, and immediately previewed in the dashboard.
*   **Simple English Labels**: Developer jargon is translated to plain English (e.g. "Category Badge" -> "Type of Event", "Graphics File Path" -> "Service Picture") for an intuitive, non-technical editing experience.
*   **Static Fallback / Offline Mode**: If the local Node.js server is not running, the dashboard switches automatically to a **Statically Offline Mode**, allowing edits and facilitating a **Download JSON** config backup file to put in the `data/` folder.

---

## 🛠️ Technology Stack

*   **HTML5**: Semantic web architecture.
*   **CSS3 (Vanilla)**: Features modular CSS variables, custom transition vectors (150ms micro-animations, 350ms modal sliding), bento grid layouts, HSL color palettes, and responsive media queries.
*   **JavaScript (Vanilla ES6)**: Handles interactive state toggling (modal open/close, custom dropdown select bindings, carousel calculations, and scroll-responsive headers).
*   **Backend / Server**: Node.js & Express body-parser with custom base64 image decoding/saving middleware.
*   **Integrations & Assets**:
    *   **Microsoft Office Online Embed API**: Iframe viewer engine.
    *   **Font Awesome v6.4.0**: Modern iconography.
    *   **Google Fonts**: *Outfit* (for professional consulting headers) and *Inter* (for body text).

---

## 📁 Project Structure

```bash
nexushivesolutionss/
│
├── index.html                                  # Main Landing Page (Hero, Trust, Events Ticker, Services Carousel, Contact)
├── about.html                                  # About Us Page (Founder Profile, Certifications, Registrations)
├── services.html                               # Detailed pillars (HR Strategy, Labour Law, Staffing, Payroll, Support)
├── resources.html                              # Knowledge Hub (Compliance Calendar, Bento Guides, PPT Viewer Modal)
├── admin.html                                  # Custom Admin CMS Dashboard
├── server.js                                   # Node.js + Express CMS Server API
│
├── css/
│   └── style.css                               # Core design tokens, global styles, animation keyframes, and layout
│
├── js/
│   ├── main.js                                 # Core navigation and page-wide scroll animations
│   ├── interactions.js                         # Dynamic JSON Hydration engine and client animations
│   └── admin.js                                # CMS dashboard controller, image uploads, offline downloader
│
├── data/                                       # Local JSON database files
│   ├── hero.json                               # Hero configurations
│   ├── services.json                           # Services info & sub-services
│   ├── events.json                             # Upcoming ticker events
│   ├── testimonials.json                       # Written and featured reviews
│   ├── about.json                              # Mission details and Founder Partner Profile
│   ├── resources.json                          # Resource PPT files metadata
│   ├── glossary.json                           # Glossary terms
│   └── tips.json                               # Expert Tips and Startup Toolkits
│
├── img/                                        # Assets (Logos, Client testimonial indicators, and uploaded files)
│   ├── Amphora.png
│   ├── Curl.tech.png
│   ├── hr_compliance_event.png
│   ├── payroll_statutory_event.png
│   ├── leadership_roundtable_event.png
│   └── whatwedocards/                          # Custom graphics mapping to specific services
│
├── India_Compliance_Calendar_NexusHive.pptx    # Resource PPT: Statutory deadlines guide
└── NexusHive_Startup_Guide.pptx                # Resource PPT: Incorporation & scaling playbook
```

---

## ⚙️ How it Works: CMS Backend Server APIs

The CMS server `server.js` exposes the following HTTP endpoints:
1.  `GET /api/data/:filename`: Safely reads the requested file from the `data/` subdirectory. Allowed filenames are whitelisted: `hero.json`, `services.json`, `events.json`, `testimonials.json`, `about.json`, `resources.json`, `glossary.json`, `tips.json`.
2.  `POST /api/save`: Formats and saves JSON payload contents to disk under the whitelisted files.
3.  `POST /api/upload-image`: Accepts a base64 string, converts it to a buffer, verifies image extension sanity, generates a unique filename (`upload_[timestamp].[ext]`), saves it under the `img/` folder on disk, and returns the public relative path (e.g. `img/upload_1717596000000.png`) to be stored in the JSON database.

---

## ⚙️ Running Locally

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Start the CMS Local server**:
    ```bash
    npm start
    ```
3.  **Access the applications**:
    *   Corporate Website: `http://localhost:5000`
    *   CMS Admin Panel: `http://localhost:5000/admin.html`
4.  **Note on Statically Offline fallback**: If running the project from disk by double-clicking the HTML files, the system will switch to offline mode automatically. Any changes edited in the CMS can be saved to local disk via download triggers and placed manually into the `data/` folder.

---

## 📞 Corporate Information

### NexusHive Solutions LLP
*   **Address**: No 11 & 12, Ganesh Nagar Layout, Telecom Road, Virupakshapura, Bangalore - 560097
*   **Email**: [info@nexushive.com](mailto:info@nexushive.com)
*   **Call**: [+91 80880 52874](tel:+918088052874)
*   **GSTIN**: `29AAXFN7873P1ZQ`
*   **LinkedIn**: [NexusHive Solutions LLP](https://www.linkedin.com/company/nexushive-solutions-llp/)
