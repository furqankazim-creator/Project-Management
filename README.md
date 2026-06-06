# Projex — Project Management Tool

## Stack
- Frontend: Bootstrap 5.3 + Bootstrap Icons + Vanilla JS
- Backend: PHP 8+ with PDO
- Database: MySQL / MariaDB

---

## Setup Instructions

### 1. Database
```bash
mysql -u root -p < database.sql
```
This creates the `projex_db` database, all tables, and seeds 4 default project types.

### 2. Configure DB credentials
Open `api/config.php` and update:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'projex_db');
define('DB_USER', 'root');     // your MySQL user
define('DB_PASS', '');         // your MySQL password
```

### 3. Uploads folder
Create the uploads folder and set permissions:
```bash
mkdir uploads
chmod 755 uploads
```

### 4. Web server
Place the entire `projex/` folder inside your web root:
- **XAMPP**: `htdocs/projex/`
- **WAMP**: `www/projex/`
- **Laravel Valet / native PHP**: `php -S localhost:8000`

Then open: `http://localhost/projex/`

---

## File Structure
```
projex/
├── index.php          ← Main HTML shell
├── database.sql       ← Run once to create DB + tables
├── css/
│   └── style.css      ← All custom styles
├── js/
│   └── app.js         ← Frontend logic + API calls
├── api/
│   ├── config.php     ← DB connection + helpers
│   ├── projects.php   ← GET / POST / DELETE projects
│   └── types.php      ← GET / POST / DELETE project types
└── uploads/           ← Uploaded project files (create manually)
```

---

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `api/projects.php` | List all projects with file counts |
| POST | `api/projects.php` | Create project + upload files |
| DELETE | `api/projects.php?id=N` | Delete project + its files |
| GET | `api/types.php` | List all project types |
| POST | `api/types.php` | Add a new project type |
| DELETE | `api/types.php?id=N` | Delete a project type |
