<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Projex — TimeGlobal</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <link href="css/style.css" rel="stylesheet">
</head>

<body>

  <!-- LOGIN SCREEN -->
  <div id="login-screen" class="d-flex align-items-center justify-content-center vh-100" style="background: var(--bg-page);">
    <div class="stat-card" style="width: 100%; max-width: 400px; padding: 2.5rem;">
      <div class="text-center mb-4">
        <div class="brand-icon mx-auto mb-3" style="width: 48px; height: 48px; font-size: 24px;">
          <i class="bi bi-kanban"></i>
        </div>
        <h4 class="fw-bold">Admin Login</h4>
        <p class="text-muted small">Enter your email and password to continue</p>
      </div>
      <div class="mb-3">
        <label class="form-label">Email address</label>
        <input type="email" id="login-email" class="form-control" placeholder="admin@example.com" autocomplete="off">
      </div>
      <div class="mb-4">
        <label class="form-label">Password</label>
        <input type="password" id="login-password" class="form-control" placeholder="••••••••" autocomplete="new-password">
      </div>
      <button class="btn btn-primary w-100 py-2" onclick="handleLogin()">
        <i class="bi bi-box-arrow-in-right me-2"></i>Sign In
      </button>
      <div id="login-error" class="text-danger small mt-3 text-center" style="display: none;"></div>
    </div>
  </div>

  <div class="d-flex" id="app-shell" style="display: none !important;">

    <!-- SIDEBAR -->
    <nav id="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon"><i class="bi bi-kanban"></i></div>
        <span class="brand-name">Projex</span>
      </div>

      <div class="nav-section-label">Menu</div>
      <ul class="nav flex-column px-2">
        <li class="nav-item">
          <a class="nav-link active" href="#" onclick="switchPage('projects')">
            <i class="bi bi-grid-fill"></i> Projects
            <span class="badge nav-badge ms-auto" id="proj-count">0</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" onclick="switchPage('new')">
            <i class="bi bi-plus-lg"></i> Add project
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" onclick="switchPage('tasks')">
            <i class="bi bi-list-check"></i> Tasks
          </a>
        </li>
      </ul>

      <hr class="sidebar-divider">

      <div class="nav-section-label">Workspace</div>
      <ul class="nav flex-column px-2">

        <li class="nav-item">
          <a class="nav-link" href="#" onclick="switchPage('settings')">
            <i class="bi bi-gear"></i> Settings
          </a>
        </li>
      </ul>
    </nav>

    <!-- MAIN -->
    <div class="main-area d-flex flex-column flex-grow-1">

      <!-- TOPBAR -->
      <div class="topbar d-flex align-items-center px-4">
        <div>
          <div class="topbar-title" id="page-title">Projects</div>
          <div class="topbar-sub" id="page-sub">All your workspace projects</div>
        </div>
        <button class="btn btn-primary btn-sm ms-auto" onclick="switchPage('new')">
          <i class="bi bi-plus-lg me-1"></i> New project
        </button>
        <button class="btn btn-outline-danger btn-sm ms-2" onclick="handleLogout()" title="Logout">
          <i class="bi bi-box-arrow-right"></i>
        </button>
      </div>

      <!-- CONTENT -->
      <div class="content-area flex-grow-1 p-4">

        <!-- PROJECTS PAGE -->
        <div class="page active" id="page-projects">
          <div class="row g-3 mb-4">
            <div class="col-4">
              <div class="stat-card">
                <div class="stat-label"><i class="bi bi-folder"></i> Total</div>
                <div class="stat-value" id="stat-total">0</div>
                <div class="stat-meta">projects</div>
              </div>
            </div>
            <div class="col-4">
              <div class="stat-card">
                <div class="stat-label"><i class="bi bi-check-circle"></i> Active</div>
                <div class="stat-value" id="stat-active">0</div>
                <div class="stat-meta">in progress</div>
              </div>
            </div>
            <div class="col-4">
              <div class="stat-card">
                <div class="stat-label"><i class="bi bi-paperclip"></i> Files</div>
                <div class="stat-value" id="stat-files">0</div>
                <div class="stat-meta">uploaded</div>
              </div>
            </div>
          </div>
          <div class="section-header d-flex align-items-center mb-3">
            <span class="section-title">Recent projects</span>
          </div>
          <div id="project-list"></div>
        </div>

        <!-- ADD PROJECT PAGE -->
        <div class="page" id="page-new">
          <div class="form-card">
            <div class="mb-3">
              <label class="form-label">Project name</label>
              <input type="text" class="form-control" id="proj-name" placeholder="e.g. Website Redesign Q3">
            </div>
            <div class="row g-3 mb-3">
              <div class="col-4">
                <label class="form-label">Project type</label>
                <select class="form-select" id="proj-type">
                  <option value="">Select type…</option>
                  <option value="web development">Strategic Partnership </option>
                  <option value="mobile development">Strategic Research </option>
                  <option value="design">Quick Cash </option>
                  <option value="design">Inter.N Commercial </option>
                  <option value="design">Local Commercial </option>

                  <option value="design">Volunteer  </option>

                  <option value="design">Demo  </option>
                  <option value="design">Free Demo </option>
                  <option value="design">Internal Internship </option>
                  <option value="design">Internal Commercial </option>
                  <option value="design">Internship Research  </option>
                  <option value="design">Internship Commercial  </option>


                </select>
              </div>
              <div class="col-4">
                <label class="form-label">Main services</label>
                <select class="form-select" id="proj-service">
                  <option value="">Select service…</option>
                  <option value="web-development">Website</option>
                  <option value="mobile-development">Mobile App  </option>
                  <option value="ui-ux">Social Media </option>
                  <option value="marketing">Graphics </option>
                  <option value="marketing">Research </option>
                </select>
              </div>
              <div class="col-4">
                <label class="form-label">Status</label>
                <select class="form-select" id="proj-status">
                  <option value="active">In Progress</option>
                  <option value="on-hold">On hold</option>
                  <option value="draft">Waiting for Internal Approval</option>
                  <option value="draft">Waiting Client Approva</option>
                  <option value="draft">Waiting for Client Payment</option>
                  <option value="draft">Waiting for Budget Allocation</option>
                  <option value="draft">Waiting in Queue</option>
                  <option value="draft">Unable to Understand</option>
                </select>
              </div>
            </div>
            
            <div class="row g-3 mb-3">
              <div class="col-4">
                <label class="form-label d-block mb-2">Payment Type</label>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" name="paymentType" id="payPaid" value="paid" checked>
                  <label class="form-check-label" style="font-size: 14px; color: var(--text-main);" for="payPaid">Paid work</label>
                </div>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" name="paymentType" id="payUnpaid" value="unpaid">
                  <label class="form-check-label" style="font-size: 14px; color: var(--text-main);" for="payUnpaid">Unpaid work</label>
                </div>
              </div>
              <div class="col-4">
                <label class="form-label d-block mb-2">Project Origin</label>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" name="projectOrigin" id="originClient" value="client" checked>
                  <label class="form-check-label" style="font-size: 14px; color: var(--text-main);" for="originClient">Client project</label>
                </div>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" name="projectOrigin" id="originInternal" value="internal">
                  <label class="form-check-label" style="font-size: 14px; color: var(--text-main);" for="originInternal">Internal project</label>
                </div>
              </div>
              <div class="col-4">
                <label class="form-label mb-2">Country</label>
                <select class="form-select" id="proj-country">
                  <option value="">Select country…</option>
                  <option value="Saudi Arabia">Saudi Arabia</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="UAE">UAE</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="USA">USA</option>
                  <option value="Portugal">Portugal</option>
                </select>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea class="form-control" id="proj-desc" rows="3" placeholder="Brief description…"></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Upload files</label>
              <div class="drop-zone" id="drop-zone"
                onclick="document.getElementById('file-input').click()"
                ondragover="onDragOver(event)"
                ondragleave="onDragLeave(event)"
                ondrop="onDrop(event)">
                <i class="bi bi-cloud-upload fs-3 d-block mb-2"></i>
                <p class="mb-1">Drop files or folders here or click to browse</p>
                <span>Any file type · multiple files supported</span>
              </div>
              <div class="d-flex gap-2 mt-2 justify-content-center">
                <button class="btn btn-outline-secondary btn-sm" onclick="document.getElementById('file-input').click()">
                  <i class="bi bi-files me-1"></i> Upload Files
                </button>
                <button class="btn btn-outline-secondary btn-sm" onclick="document.getElementById('folder-input').click()">
                  <i class="bi bi-folder-plus me-1"></i> Upload Folder
                </button>
              </div>
              <input type="file" id="file-input" multiple style="display:none" onchange="handleFiles(this.files)">
              <input type="file" id="folder-input" webkitdirectory style="display:none" onchange="handleFiles(this.files)">
              <div id="upload-summary" class="mt-3 text-center fw-medium" style="font-size: 12px; color: var(--text-muted); display: none;"></div>
              <div id="file-error" class="mt-1 text-danger text-center" style="font-size: 12px; display: none;"></div>
              <div id="file-list" class="mt-2"></div>
              <div id="upload-overall" class="mt-2 text-center" style="font-size: 13px; color: var(--purple); font-weight: 500; display: none;"></div>
            </div>
            <div class="d-flex gap-2 pt-3 border-top">
              <button class="btn btn-primary" onclick="submitProject()">
                <i class="bi bi-check-lg me-1"></i> Save project
              </button>
              <button class="btn btn-outline-secondary" onclick="resetForm()">Clear</button>
            </div>
          </div>
        </div>

        <!-- SETTINGS PAGE -->
        <div class="page" id="page-settings">
          <div class="form-card">
            <label class="form-label">Project types</label>
            <div class="tag-wrap mb-2" id="type-tags"></div>
            <div class="d-flex gap-2">
              <input type="text" class="form-control form-control-sm" id="new-type-input"
                placeholder="Add a type…" onkeydown="if(event.key==='Enter')addType()">
              <button class="btn btn-outline-primary btn-sm" onclick="addType()">
                <i class="bi bi-plus-lg me-1"></i>Add
              </button>
            </div>
          </div>
        </div>

        <!-- TASKS PAGE -->
        <div class="page" id="page-tasks">
          <div class="d-flex align-items-center mb-4">
            <button class="btn btn-outline-secondary btn-sm me-3" onclick="switchPage('projects')">
              <i class="bi bi-arrow-left me-1"></i> Back
            </button>
            <h4 class="m-0" id="detail-project-name" style="font-weight:700;">Project Tasks</h4>
          </div>

          <div class="row g-4">
            <!-- Assign Task Form -->
            <div class="col-md-4">
              <div class="form-card h-100">
                <h5 class="mb-4" style="font-weight:600;">Assign New Task</h5>
                <div class="mb-3">
                  <label class="form-label">Task Title</label>
                  <input type="text" class="form-control" id="task-title" placeholder="e.g. Design Homepage">
                </div>
                <div class="mb-3">
                  <label class="form-label">Assign To</label>
                  <input type="text" class="form-control" id="task-assignee" placeholder="e.g. John Doe">
                </div>
                <div class="mb-4">
                  <label class="form-label">Description</label>
                  <textarea class="form-control" id="task-desc" rows="3" placeholder="Task details..."></textarea>
                </div>
                <button class="btn btn-primary w-100" onclick="submitTask()">Assign Task</button>
              </div>
            </div>

            <!-- Task Board -->
            <div class="col-md-8">
              <div class="row g-4">
                <!-- Pending -->
                <div class="col-md-6">
                  <div class="form-card h-100 p-3" style="background: #F8FAFC;">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <h6 class="m-0" style="font-weight:600; color: #475569;">Pending</h6>
                      <span class="badge bg-warning text-dark rounded-pill" id="task-count-pending">0</span>
                    </div>
                    <div id="task-list-pending" class="d-flex flex-column gap-3">
                      <!-- Tasks injected via JS -->
                    </div>
                  </div>
                </div>
                
                <!-- Completed -->
                <div class="col-md-6">
                  <div class="form-card h-100 p-3" style="background: #F8FAFC;">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <h6 class="m-0" style="font-weight:600; color: #475569;">Completed</h6>
                      <span class="badge bg-success rounded-pill" id="task-count-completed">0</span>
                    </div>
                    <div id="task-list-completed" class="d-flex flex-column gap-3">
                      <!-- Tasks injected via JS -->
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- PROJECT DETAIL PAGE -->
        <div class="page" id="page-detail">
          <div class="d-flex align-items-center mb-4">
            <button class="btn btn-outline-secondary btn-sm me-3" onclick="switchPage('projects')">
              <i class="bi bi-arrow-left me-1"></i> Back
            </button>
            <h4 class="m-0" id="detail-page-title" style="font-weight:700;">Project Detail</h4>
          </div>

          <!-- Description + Documents -->
          <div class="row g-4 mb-4">
            <!-- Description -->
            <div class="col-md-6">
              <div class="form-card h-100">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6 class="m-0" style="font-weight:600; color:#334155;"><i class="bi bi-card-text me-2 text-primary"></i>Description</h6>
                  <button class="btn btn-sm btn-outline-secondary" style="font-size:11px;" onclick="toggleDescEdit()">
                    <i class="bi bi-pencil"></i> Edit
                  </button>
                </div>
                <div id="detail-description" style="font-size:14px; line-height:1.7; color:#64748b;">
                  <span class="fst-italic">No description provided.</span>
                </div>
                <div id="desc-edit-mode" style="display:none;">
                  <textarea class="form-control mb-2" id="desc-textarea" rows="4" placeholder="Add description..."></textarea>
                  <div class="d-flex gap-2">
                    <button class="btn btn-primary btn-sm" onclick="saveDescription()"><i class="bi bi-check-lg me-1"></i>Save</button>
                    <button class="btn btn-outline-secondary btn-sm" onclick="toggleDescEdit()">Cancel</button>
                  </div>
                </div>
              </div>
            </div>
            <!-- Documents -->
            <div class="col-md-6">
              <div class="form-card h-100">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6 class="m-0" style="font-weight:600; color:#334155;"><i class="bi bi-paperclip me-2 text-primary"></i>Documents</h6>
                  <label class="btn btn-sm btn-outline-secondary" style="font-size:11px; cursor:pointer; margin:0;">
                    <i class="bi bi-upload me-1"></i> Upload
                    <input type="file" id="detail-file-input" multiple style="display:none;" onchange="uploadDetailFiles(this.files)">
                  </label>
                </div>
                <div id="detail-files">
                  <div class="text-center text-muted" style="font-size:13px; padding:20px 0;">
                    <i class="bi bi-folder2-open d-block mb-2 fs-4"></i>No documents uploaded
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tasks Section: 3 tabs -->
          <div class="row g-4">

            <!-- Tab 1: Task (Add new task form) -->
            <div class="col-md-4">
              <div class="form-card h-100 p-0" style="overflow:hidden;">
                <div style="background:#f8fafc; border-bottom:1px solid #e2e8f0; padding:10px 16px;">
                  <span style="display:inline-flex; align-items:center; gap:6px; background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:5px 14px; font-size:13px; font-weight:600; color:#334155;">
                    <i class="bi bi-plus-circle text-primary"></i> Task
                  </span>
                </div>
                <div class="p-4">
                  <div class="d-flex gap-2">
                    <input type="text" class="form-control" id="detail-task-title" placeholder="Task title…" onkeydown="if(event.key==='Enter') submitDetailTask()">
                    <button class="btn btn-primary" onclick="submitDetailTask()" style="white-space:nowrap;">
                      <i class="bi bi-plus-lg"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab 2: Update (Pending tasks with inline edit) -->
            <div class="col-md-4">
              <div class="form-card h-100 p-0" style="overflow:hidden;">
                <div style="background:#f8fafc; border-bottom:1px solid #e2e8f0; padding:10px 16px;">
                  <span style="display:inline-flex; align-items:center; gap:6px; background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:5px 14px; font-size:13px; font-weight:600; color:#334155;">
                    <i class="bi bi-arrow-repeat text-warning"></i> Update
                    <span class="badge bg-warning text-dark rounded-pill ms-1" id="detail-count-pending">0</span>
                  </span>
                </div>
                <div class="p-3 d-flex flex-column gap-3" id="detail-list-pending">
                  <div class="text-center text-muted p-3" style="font-size:13px;">No pending tasks</div>
                </div>
              </div>
            </div>

            <!-- Tab 3: Links -->
            <div class="col-md-4">
              <div class="form-card h-100 p-0" style="overflow:hidden;">
                <div style="background:#f8fafc; border-bottom:1px solid #e2e8f0; padding:10px 16px;">
                  <span style="display:inline-flex; align-items:center; gap:6px; background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:5px 14px; font-size:13px; font-weight:600; color:#334155;">
                    <i class="bi bi-link-45deg text-primary"></i> Links
                  </span>
                </div>
                <div class="p-3">
                  <div class="d-flex gap-2 mb-3">
                    <input type="text" class="form-control form-control-sm" id="link-title" placeholder="Title">
                    <input type="url" class="form-control form-control-sm" id="link-url" placeholder="https://...">
                    <button class="btn btn-primary btn-sm" onclick="addDetailLink()" style="white-space:nowrap; padding:4px 10px;">
                      <i class="bi bi-plus-lg"></i>
                    </button>
                  </div>
                  <div id="detail-links-list" class="d-flex flex-column gap-2">
                    <div class="text-center text-muted p-3" style="font-size:13px;">No links added</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- TOAST -->
  <div class="toast-box" id="toast"></div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="js/app.js"></script>
</body>

</html>