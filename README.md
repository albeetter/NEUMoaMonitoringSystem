# NEU MOA Monitoring System
### Project Overview
The NEU MOA Monitoring System is a secure, full-stack web application designed to digitize, streamline, and track Memorandums of Agreement (MOAs) between the university and its industry partners. Built to replace manual tracking methods, the system provides a centralized, real-time database where administrators, college faculty, and students can interact with partnership data based on their specific clearance levels. The application ensures data integrity, improves the visibility of document processing pipelines, and provides actionable analytics for university administrators.

#### Core Technologies
Frontend: React (TypeScript), Tailwind CSS for responsive UI, React Router for secure navigation.

State Management: Zustand for global state handling and derived analytics.

Backend / Database: Firebase Cloud Firestore (NoSQL) for real-time data synchronization.

Authentication: Firebase Authentication (Google Workspace Integration).

#### User Roles & Access Control
The system features strict Role-Based Access Control (RBAC) to ensure data security and appropriate feature delivery:

Institutional Admins: Have full CRUD access to all MOAs across all colleges, manage user permissions, view system-wide analytics, monitor the audit trail, and recover deleted data.

Faculty (Maintainers): Can draft, edit, and track the processing status of MOAs specifically endorsed by their respective colleges.

Students: Have read-only access to a dedicated "Approved MOA Directory" to search for active, verified industry partners for internships and academic requirements.

### Key Features & Functionalities
#### 1. Comprehensive MOA Lifecycle Management

Full Create, Read, Update, and Delete (CRUD) capabilities for partnership records.

Automated status calculations: The system automatically flags active MOAs as "Expiring" or "Expired" based on their calculated end dates, eliminating the need for manual tracking.

Dedicated "View Profile" pages for a clean, read-only presentation of partnership details.
#### 2. Real-Time Analytics Dashboard

Dynamic statistics cards that instantly calculate and display the number of active, drafting, and expiring agreements.

Visual progress bars tracking MOAs as they move through the institutional pipeline (Legal Department -> VPAA Office -> HTE Confirmation).

Dashboard data automatically recalculates based on local College and Date filters.

#### 3. Advanced Search & Reporting

A globally accessible search bar that instantly filters MOA tables by matching text across multiple data points (Company Name, Industry, Contact Person, Address, or HTEID).

1-click CSV Export engine that compiles currently filtered dashboard data into a formatted spreadsheet for offline reporting.

#### 4. Data Integrity & Security

Soft-Delete Architecture: Deleting a record does not erase it from the database; it flags it as hidden, preventing accidental data loss.

Data Recovery Module: A dedicated "Recycle Bin" interface for Admins to review and safely restore soft-deleted records back into the active system.

Automated Audit Trail: A chronological, uneditable system log that records the user, timestamp, and entity details for every CREATE, UPDATE, DELETE, and RECOVER action performed in the system.
