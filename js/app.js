const API = 'api/';
const TYPE_COLORS = ['#534AB7', '#1D9E75', '#D85A30', '#185FA5', '#BA7517', '#D4537E'];
const PAGE_META = {
  projects: ['Projects', 'All your workspace projects'],
  new: ['Add project', 'Fill in details and upload files'],
  tasks: ['Task Assignment', 'Manage and assign tasks'],
  detail: ['Project Detail', 'Tasks, documents & description'],
  settings: ['Settings', 'Manage project types']
};

let pendingFiles = [];
let currentProjectId = null;
let currentProjectName = '';
let currentProject = null;
let allProjects = [];

/* ── AUTHENTICATION ── */
async function checkAuth() {
  const res = await fetch(API + 'auth.php');
  const data = await res.json();
  if (data.authenticated) {
    showApp();
  } else {
    showLogin();
  }
}

async function handleLogin() {
  const e = document.getElementById('login-email').value;
  const p = document.getElementById('login-password').value;
  const err = document.getElementById('login-error');
  
  const fd = new FormData();
  fd.append('action', 'login');
  fd.append('email', e);
  fd.append('password', p);

  const res = await fetch(API + 'auth.php', { method: 'POST', body: fd });
  const data = await res.json();

  if (data.success) {
    showApp();
  } else {
    err.textContent = data.error || 'Login failed';
    err.style.display = 'block';
  }
}

async function handleLogout() {
  const fd = new FormData();
  fd.append('action', 'logout');
  await fetch(API + 'auth.php', { method: 'POST', body: fd });
  showLogin();
}

function showApp() {
  document.getElementById('login-screen').style.setProperty('display', 'none', 'important');
  document.getElementById('app-shell').style.setProperty('display', 'flex', 'important');
  loadProjects();
}

function showLogin() {
  document.getElementById('login-screen').style.setProperty('display', 'flex', 'important');
  document.getElementById('app-shell').style.setProperty('display', 'none', 'important');
}

/* ── NAVIGATION ── */
function switchPage(name, projectId = null, projectName = '') {
  if (projectId) {
    currentProjectId = projectId;
    currentProjectName = projectName;
    document.getElementById('detail-project-name').textContent = projectName + ' Tasks';
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#sidebar .nav-link').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  const navLink = document.querySelector(`[onclick="switchPage('${name}')"]`);
  if (navLink) navLink.classList.add('active');
  document.getElementById('page-title').textContent = PAGE_META[name][0];
  document.getElementById('page-sub').textContent = PAGE_META[name][1];
  if (name === 'projects') loadProjects();
  if (name === 'new') loadTypesIntoSelect();
  if (name === 'tasks') {
    if (currentProjectId) {
      loadTasks();
    } else {
      document.getElementById('task-list-pending').innerHTML = '<div class="text-center text-muted p-3">Select a project first to view tasks</div>';
      document.getElementById('task-list-completed').innerHTML = '';
      document.getElementById('task-count-pending').textContent = '0';
      document.getElementById('task-count-completed').textContent = '0';
    }
  }
  if (name === 'detail') loadProjectDetail();
  if (name === 'settings') loadSettings();
}

/* ── PROJECTS ── */
async function loadProjects() {
  const res = await fetch(API + 'projects.php');
  const data = await res.json();
  const projects = data.projects || [];

  document.getElementById('stat-total').textContent = projects.length;
  document.getElementById('stat-active').textContent = projects.filter(p => p.status === 'active').length;
  document.getElementById('stat-files').textContent = projects.reduce((s, p) => s + parseInt(p.file_count || 0), 0);
  document.getElementById('proj-count').textContent = projects.length;

  allProjects = projects;

  const list = document.getElementById('project-list');
  if (!projects.length) {
    list.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-folder2-open"></i>
        <p>No projects yet — add one to get started</p>
      </div>`;
    return;
  }

  const statusClass = { active: 's-active', draft: 's-draft', 'on-hold': 's-on-hold' };
  list.innerHTML = projects.map((p, i) => `
    <div class="project-card" style="cursor:pointer;" onclick="openProject(${p.id})">
      <div class="p-dot" style="background:${TYPE_COLORS[i % TYPE_COLORS.length]}"></div>
      <div class="p-body">
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="p-name">${esc(p.name)}</span>
          <span class="type-badge">${esc(p.type)}</span>
        </div>
        ${p.description ? `<div class="p-desc">${esc(p.description)}</div>` : ''}
        <div class="p-meta">
          <span class="status-pill ${statusClass[p.status] || 's-on-hold'}">${p.status}</span>
          <span><i class="bi bi-calendar3"></i> ${p.created_at}</span>
          ${p.country ? `<span><i class="bi bi-geo-alt"></i> ${esc(p.country)}</span>` : ''}
          ${p.payment_type ? `<span class="badge ${p.payment_type === 'paid' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'} border" style="font-size:10px;">${p.payment_type.toUpperCase()}</span>` : ''}
          ${p.project_origin ? `<span class="badge bg-info-subtle text-info border" style="font-size:10px;">${p.project_origin.toUpperCase()}</span>` : ''}
          ${p.file_count > 0 ? `<span><i class="bi bi-paperclip"></i> ${p.file_count} file${p.file_count > 1 ? 's' : ''}</span>` : ''}
        </div>
      </div>
    </div>`).join('');
}

/* ── PROJECT DETAIL ── */
function openProject(id) {
  currentProject = allProjects.find(p => p.id == id);
  if (!currentProject) return;
  currentProjectId = currentProject.id;
  currentProjectName = currentProject.name;
  switchPage('detail');
}

async function loadProjectDetail() {
  if (!currentProject) return;
  document.getElementById('detail-page-title').textContent = currentProject.name;
  const descEl = document.getElementById('detail-description');
  if (currentProject.description) {
    descEl.innerHTML = esc(currentProject.description).replace(/\n/g, '<br>');
  } else {
    descEl.innerHTML = '<span class="fst-italic text-muted">No description provided.</span>';
  }
  await loadDetailFiles();
  await loadDetailTasks();
  await loadDetailLinks();
}

function toggleDescEdit() {
  const viewEl = document.getElementById('detail-description');
  const editEl = document.getElementById('desc-edit-mode');
  const isEditing = editEl.style.display !== 'none';
  if (isEditing) {
    editEl.style.display = 'none';
    viewEl.style.display = 'block';
  } else {
    document.getElementById('desc-textarea').value = currentProject ? (currentProject.description || '') : '';
    viewEl.style.display = 'none';
    editEl.style.display = 'block';
    document.getElementById('desc-textarea').focus();
  }
}

async function saveDescription() {
  const desc = document.getElementById('desc-textarea').value.trim();
  const fd = new FormData();
  fd.append('action', 'update_desc');
  fd.append('id', currentProjectId);
  fd.append('description', desc);
  try {
    const res = await fetch(API + 'projects.php', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.success) {
      if (currentProject) currentProject.description = desc;
      const descEl = document.getElementById('detail-description');
      descEl.innerHTML = desc
        ? esc(desc).replace(/\n/g, '<br>')
        : '<span class="fst-italic text-muted">No description provided.</span>';
      toggleDescEdit();
      showToast('Description saved!');
    } else {
      showToast(data.error || 'Failed to save');
    }
  } catch (e) { showToast('Failed to save description'); }
}

async function uploadDetailFiles(files) {
  if (!files.length) return;
  showToast('Uploading...');
  for (const file of Array.from(files)) {
    const fd = new FormData();
    fd.append('project_id', currentProjectId);
    fd.append('file', file);
    try {
      await fetch(API + 'files.php', { method: 'POST', body: fd });
    } catch (e) { console.error('Upload failed:', file.name); }
  }
  document.getElementById('detail-file-input').value = '';
  await loadDetailFiles();
  showToast('Upload complete!');
}

async function loadDetailFiles() {
  try {
    const res = await fetch(API + `files.php?project_id=${currentProjectId}`);
    const data = await res.json();
    const files = data.files || [];
    const el = document.getElementById('detail-files');
    if (!files.length) {
      el.innerHTML = '<div class="text-center text-muted" style="font-size:13px; padding:20px 0;"><i class="bi bi-folder2-open d-block mb-2 fs-4"></i>No documents uploaded</div>';
      return;
    }
    el.innerHTML = files.map(f => `
      <div class="d-flex align-items-center gap-2 p-2 mb-2" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;">
        <i class="bi ${getFileIcon(f.original_name)} text-primary fs-5"></i>
        <div class="flex-grow-1" style="min-width:0;">
          <div style="font-size:13px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${esc(f.original_name)}">${esc(truncateName(f.original_name))}</div>
          <div style="font-size:11px; color:#94a3b8;">${formatSize(f.file_size)}</div>
        </div>
        <a href="uploads/${esc(f.stored_name)}" target="_blank" class="btn btn-sm btn-outline-secondary" style="font-size:11px; padding:2px 8px;" onclick="event.stopPropagation()">
          <i class="bi bi-download"></i>
        </a>
      </div>`).join('');
  } catch (e) {
    console.error('Failed to load files', e);
  }
}

async function loadDetailTasks() {
  if (!currentProjectId) return;
  try {
    const res = await fetch(API + `tasks.php?project_id=${currentProjectId}`);
    const data = await res.json();
    const tasks = data.tasks || [];
    const pending = tasks.filter(t => t.status === 'pending');
    const completed = tasks.filter(t => t.status === 'completed');

    document.getElementById('detail-count-pending').textContent = pending.length;

    const pendingEl = document.getElementById('detail-list-pending');

    pendingEl.innerHTML = pending.length
      ? pending.map(t => `
          <div class="card border-0 shadow-sm" style="border-radius:10px;">
            <div class="card-body p-3">
              <div id="task-view-${t.id}">
                <h6 style="font-size:14px; font-weight:600; margin-bottom:3px;">${esc(t.title)}</h6>
                <p class="text-muted mb-2" style="font-size:12px;">${esc(t.description || '')}</p>
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-1">
                  <span class="badge bg-light text-dark border"><i class="bi bi-person me-1"></i>${esc(t.assignee || '')}</span>
                  <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-outline-secondary" style="font-size:11px; padding:2px 8px;" onclick="toggleTaskEdit(${t.id})">
                      <i class="bi bi-pencil"></i> Update
                    </button>
                    <button class="btn btn-sm btn-success" style="font-size:11px; padding:2px 8px;" onclick="completeDetailTask(${t.id})">
                      <i class="bi bi-check-lg"></i> Done
                    </button>
                  </div>
                </div>
              </div>
              <div id="task-edit-${t.id}" style="display:none;">
                <input type="text" class="form-control form-control-sm mb-2" id="edit-title-${t.id}" value="${esc(t.title)}">
                <textarea class="form-control form-control-sm mb-2" id="edit-desc-${t.id}" rows="2" style="resize:none;">${esc(t.description || '')}</textarea>
                <div class="d-flex gap-2">
                  <button class="btn btn-primary btn-sm" style="font-size:11px;" onclick="saveTaskUpdate(${t.id})">
                    <i class="bi bi-check-lg"></i> Save
                  </button>
                  <button class="btn btn-outline-secondary btn-sm" style="font-size:11px;" onclick="toggleTaskEdit(${t.id})">Cancel</button>
                </div>
              </div>
            </div>
          </div>`).join('')
      : '<div class="text-center text-muted p-3" style="font-size:13px;">No pending tasks</div>';
  } catch (e) {
    console.error('Failed to load tasks', e);
  }
}

async function submitDetailTask() {
  if (!currentProjectId) { showToast('No project selected'); return; }
  const title = document.getElementById('detail-task-title').value.trim();
  if (!title) { showToast('Task title is required'); return; }
  const fd = new FormData();
  fd.append('action', 'create');
  fd.append('project_id', currentProjectId);
  fd.append('title', title);
  try {
    const res = await fetch(API + 'tasks.php', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.success) {
      document.getElementById('detail-task-title').value = '';
      loadDetailTasks();
    } else {
      showToast('Error: ' + data.error);
    }
  } catch (e) {
    showToast('Failed to assign task');
  }
}

async function completeDetailTask(id) {
  const fd = new FormData();
  fd.append('action', 'complete');
  fd.append('id', id);
  try {
    const res = await fetch(API + 'tasks.php', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.success) {
      showToast('Task marked as complete!');
      loadDetailTasks();
    } else {
      showToast('Error: ' + data.error);
    }
  } catch (e) {
    showToast('Failed to complete task');
  }
}

function toggleTaskEdit(id) {
  const viewEl = document.getElementById('task-view-' + id);
  const editEl = document.getElementById('task-edit-' + id);
  const isEditing = editEl.style.display !== 'none';
  viewEl.style.display = isEditing ? 'block' : 'none';
  editEl.style.display = isEditing ? 'none' : 'block';
}

async function saveTaskUpdate(id) {
  const title = document.getElementById('edit-title-' + id).value.trim();
  const desc  = document.getElementById('edit-desc-'  + id).value.trim();
  if (!title) { showToast('Title is required'); return; }
  const fd = new FormData();
  fd.append('action', 'update');
  fd.append('id', id);
  fd.append('title', title);
  fd.append('description', desc);
  try {
    const res = await fetch(API + 'tasks.php', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.success) { showToast('Task updated!'); loadDetailTasks(); }
    else showToast('Error: ' + (data.error || 'Update failed'));
  } catch (e) { showToast('Failed to update task'); }
}


async function loadDetailLinks() {
  try {
    const res = await fetch(API + `links.php?project_id=${currentProjectId}`);
    const data = await res.json();
    const links = data.links || [];
    const el = document.getElementById('detail-links-list');
    if (!links.length) {
      el.innerHTML = '<div class="text-center text-muted p-3" style="font-size:13px;">No links added</div>';
      return;
    }
    el.innerHTML = links.map(l => `
      <div class="d-flex align-items-center gap-2 p-2" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;">
        <i class="bi bi-link-45deg text-primary fs-5"></i>
        <div class="flex-grow-1" style="min-width:0;">
          <div style="font-size:13px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(l.title)}</div>
          <a href="${esc(l.url)}" target="_blank" style="font-size:11px; color:#6366f1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:block;">${esc(l.url)}</a>
        </div>
        <button class="btn btn-sm btn-outline-danger" style="font-size:11px; padding:2px 7px;" onclick="removeDetailLink(${l.id})">
          <i class="bi bi-trash"></i>
        </button>
      </div>`).join('');
  } catch (e) { console.error('Failed to load links', e); }
}

async function addDetailLink() {
  const title = document.getElementById('link-title').value.trim();
  const url   = document.getElementById('link-url').value.trim();
  if (!title || !url) { showToast('Title and URL are required'); return; }
  const fd = new FormData();
  fd.append('project_id', currentProjectId);
  fd.append('title', title);
  fd.append('url', url);
  try {
    const res = await fetch(API + 'links.php', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.success) {
      document.getElementById('link-title').value = '';
      document.getElementById('link-url').value   = '';
      loadDetailLinks();
    } else showToast(data.error || 'Failed to add link');
  } catch (e) { showToast('Failed to add link'); }
}

async function removeDetailLink(id) {
  try {
    await fetch(API + 'links.php?id=' + id, { method: 'DELETE' });
    loadDetailLinks();
  } catch (e) { showToast('Failed to remove link'); }
}

/* ── SUBMIT PROJECT ── */
let isUploading = false;

async function submitProject() {
  if (isUploading) return;
  const name = document.getElementById('proj-name').value.trim();
  const type = document.getElementById('proj-type').value;
  const status = document.getElementById('proj-status').value;
  const country = document.getElementById('proj-country').value;
  const paymentType = document.querySelector('input[name="paymentType"]:checked').value;
  const projectOrigin = document.querySelector('input[name="projectOrigin"]:checked').value;
  const desc = document.getElementById('proj-desc').value.trim();

  if (!name) { showToast('Enter a project name'); return; }
  if (!type) { showToast('Select a project type'); return; }

  const validFiles = pendingFiles.filter(f => f.valid);
  if (pendingFiles.some(f => !f.valid)) {
    if (!confirm('Some files have errors and will be skipped. Continue?')) return;
  }

  isUploading = true;
  document.getElementById('upload-overall').style.display = 'block';
  document.getElementById('upload-overall').textContent = 'Creating project...';

  const fd = new FormData();
  
  fd.append('name', name);
  fd.append('type', type);
  fd.append('status', status);
  fd.append('payment_type', paymentType);
  fd.append('project_origin', projectOrigin);
  fd.append('country', country);
  fd.append('description', desc);

  try {
    const res = await fetch(API + 'projects.php', { method: 'POST', body: fd });
    const data = await res.json();

    if (data.success) {
      if (validFiles.length > 0) {
        await uploadFilesSequential(data.id, validFiles);
      } else {
        finishUpload();
      }
    } else {
      throw new Error(data.error || 'Failed to create project');
    }
  } catch (err) {
    showToast(err.message);
    isUploading = false;
    document.getElementById('upload-overall').style.display = 'none';
  }
}

async function uploadFilesSequential(projectId, files) {
  for (let i = 0; i < files.length; i++) {
    document.getElementById('upload-overall').textContent = `Uploading ${i + 1} of ${files.length}...`;
    await uploadSingleFile(projectId, files[i]);
  }
  finishUpload();
}

function uploadSingleFile(projectId, fileObj) {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append('project_id', projectId);
    fd.append('file', fileObj.file);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        fileObj.progress = Math.round((e.loaded / e.total) * 100);
        updateFileUI(fileObj.id);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.success) {
            fileObj.status = 'success';
          } else {
            fileObj.status = 'error';
            fileObj.error = res.error || 'Upload failed';
          }
        } catch (e) {
          fileObj.status = 'error';
          fileObj.error = 'Invalid response';
        }
      } else {
        fileObj.status = 'error';
        fileObj.error = `HTTP ${xhr.status}`;
      }
      fileObj.progress = 100;
      updateFileUI(fileObj.id);
      resolve();
    };

    xhr.onerror = () => {
      fileObj.status = 'error';
      fileObj.error = 'Network error';
      fileObj.progress = 100;
      updateFileUI(fileObj.id);
      resolve();
    };

    xhr.open('POST', API + 'files.php', true);
    xhr.send(fd);
  });
}

function finishUpload() {
  showToast('Project saved!');
  resetForm();
  switchPage('projects');
  isUploading = false;
  document.getElementById('upload-overall').style.display = 'none';
}

function resetForm() {
  document.getElementById('proj-name').value = '';
  document.getElementById('proj-desc').value = '';
  document.getElementById('proj-type').value = '';
  document.getElementById('proj-status').value = 'active';
  document.getElementById('proj-country').value = '';
  document.getElementById('payPaid').checked = true;
  document.getElementById('originClient').checked = true;
  pendingFiles = [];
  renderFileList();
  document.getElementById('file-input').value = '';
  document.getElementById('folder-input').value = '';
}

/* ── FILE UPLOAD ── */
function onDragOver(e) { e.preventDefault(); document.getElementById('drop-zone').classList.add('drag-over'); }
function onDragLeave() { document.getElementById('drop-zone').classList.remove('drag-over'); }
function onDrop(e) { e.preventDefault(); document.getElementById('drop-zone').classList.remove('drag-over'); handleFiles(e.dataTransfer.files); }

function handleFiles(files) {
  const disallowedExts = ['.exe', '.bat', '.sh', '.php'];
  const maxSizeBytes = 50 * 1024 * 1024;

  let hasErrors = false;

  Array.from(files).forEach(f => {
    if (!pendingFiles.find(x => x.file && x.file.name === f.name)) {
      let valid = true;
      let error = '';

      const extMatch = f.name.match(/\.[0-9a-z]+$/i);
      const ext = extMatch ? extMatch[0].toLowerCase() : '';

      if (disallowedExts.includes(ext)) {
        valid = false;
        error = 'File type not allowed';
        hasErrors = true;
      } else if (f.size > maxSizeBytes) {
        valid = false;
        error = 'File exceeds 50MB';
        hasErrors = true;
      }

      pendingFiles.push({
        id: 'file_' + Math.random().toString(36).substr(2, 9),
        file: f,
        valid: valid,
        error: error,
        progress: 0,
        status: 'pending'
      });
    }
  });

  const errDiv = document.getElementById('file-error');
  if (hasErrors) {
    errDiv.textContent = 'Some files have errors and will be skipped.';
    errDiv.style.display = 'block';
  } else {
    errDiv.style.display = 'none';
  }

  renderFileList();
}

function getFileIcon(filename) {
  const extMatch = filename.match(/\.[0-9a-z]+$/i);
  const ext = extMatch ? extMatch[0].toLowerCase() : '';
  if (['.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(ext)) return 'bi-file-image';
  if (ext === '.pdf') return 'bi-file-pdf';
  if (['.zip', '.rar', '.7z'].includes(ext)) return 'bi-file-zip';
  if (['.doc', '.docx'].includes(ext)) return 'bi-file-word';
  return 'bi-file-earmark';
}

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / 1024).toFixed(1) + ' KB';
}

function truncateName(name) {
  if (name.length > 30) {
    const parts = name.split('.');
    const ext = parts.length > 1 ? '.' + parts.pop() : '';
    const base = parts.join('.');
    return base.substring(0, 26 - ext.length) + '...' + ext;
  }
  return name;
}

function renderFileList() {
  const sumDiv = document.getElementById('upload-summary');
  if (pendingFiles.length > 0) {
    const totalSize = pendingFiles.reduce((sum, f) => sum + f.file.size, 0);
    sumDiv.textContent = `${pendingFiles.length} files selected · ${formatSize(totalSize)}`;
    sumDiv.style.display = 'block';
  } else {
    sumDiv.style.display = 'none';
  }

  document.getElementById('file-list').innerHTML = pendingFiles.map((f, i) => `
    <div class="file-item ${!f.valid ? 'has-error' : ''}" id="${f.id}">
      <i class="bi ${getFileIcon(f.file.name)} file-icon"></i>
      <div class="d-flex flex-column flex-grow-1" style="min-width: 0;">
        <span class="file-name" title="${esc(f.file.name)}">${esc(truncateName(f.file.name))}</span>
        <span class="file-size">${!f.valid ? '<span class="text-danger">' + f.error + '</span>' : formatSize(f.file.size)}</span>
      </div>
      ${renderFileStatus(f, i)}
      ${f.valid ? `<div class="file-progress-container"><div class="file-progress-bar" style="width: ${f.progress}%"></div></div>` : ''}
    </div>`).join('');
}

function renderFileStatus(f, index) {
  if (f.status === 'success') return `<i class="bi bi-check-circle-fill file-status-icon success"></i>`;
  if (f.status === 'error') return `<i class="bi bi-x-circle-fill file-status-icon error" title="${esc(f.error || '')}"></i>`;
  if (isUploading) return ``;
  return `<button class="file-rm" onclick="removeFile(${index})" aria-label="Remove"><i class="bi bi-x"></i></button>`;
}

function updateFileUI(id) {
  const f = pendingFiles.find(x => x.id === id);
  if (!f) return;
  const el = document.getElementById(id);
  if (!el) return;

  const progBar = el.querySelector('.file-progress-bar');
  if (progBar) progBar.style.width = f.progress + '%';

  if (f.status === 'success' || f.status === 'error') {
    renderFileList();
  }
}

function removeFile(i) {
  pendingFiles.splice(i, 1);
  const hasErrors = pendingFiles.some(f => !f.valid);
  document.getElementById('file-error').style.display = hasErrors ? 'block' : 'none';
  renderFileList();
}

/* ── SETTINGS ── */
async function loadSettings() {
  const res = await fetch(API + 'types.php');
  const data = await res.json();
  renderTypeTags(data.types || []);
}

function renderTypeTags(types) {
  document.getElementById('type-tags').innerHTML = types.map((t, i) => `
    <span class="tag-pill">${esc(t.name)}
      <button onclick="removeType(${t.id})" aria-label="Remove ${esc(t.name)}">×</button>
    </span>`).join('');
}

async function addType() {
  const inp = document.getElementById('new-type-input');
  const val = inp.value.trim();
  if (!val) return;

  const fd = new FormData();
  fd.append('name', val);
  const res = await fetch(API + 'types.php', { method: 'POST', body: fd });
  const data = await res.json();

  if (data.success) {
    inp.value = '';
    loadSettings();
  } else {
    showToast(data.error || 'Already exists');
  }
}

async function removeType(id) {
  await fetch(API + 'types.php?id=' + id, { method: 'DELETE' });
  loadSettings();
}

async function loadTypesIntoSelect() {
  try {
    const res = await fetch(API + 'types.php');
    const data = await res.json();
    if (data.types && data.types.length > 0) {
      const sel = document.getElementById('proj-type');
      sel.innerHTML = '<option value="">Select type…</option>' +
        data.types.map(t => `<option value="${esc(t.name)}">${esc(t.name)}</option>`).join('');
    }
  } catch (e) {
    console.error("Failed to fetch types:", e);
  }
}

/* ── HELPERS ── */
function esc(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

/* ── TASKS ── */
async function loadTasks() {
  if (!currentProjectId) return;
  try {
    const res = await fetch(API + `tasks.php?project_id=${currentProjectId}`);
    const data = await res.json();
    const tasks = data.tasks || [];

    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    document.getElementById('task-count-pending').textContent = pendingTasks.length;
    document.getElementById('task-count-completed').textContent = completedTasks.length;

    const listPending = document.getElementById('task-list-pending');
    const listCompleted = document.getElementById('task-list-completed');

    if (!pendingTasks.length) {
      listPending.innerHTML = '<div class="text-center text-muted p-3" style="font-size:13px;">No pending tasks</div>';
    } else {
      listPending.innerHTML = pendingTasks.map(t => `
        <div class="card border-0 shadow-sm" style="border-radius:10px;">
          <div class="card-body p-3">
            <h6 class="card-title" style="font-size:14px; font-weight:600;">${esc(t.title)}</h6>
            <p class="card-text text-muted mb-2" style="font-size:12px;">${esc(t.description)}</p>
            <div class="d-flex justify-content-between align-items-center">
              <span class="badge bg-light text-dark border"><i class="bi bi-person me-1"></i>${esc(t.assignee)}</span>
              <button class="btn btn-sm btn-success" style="font-size:11px;" onclick="completeTask(${t.id})">
                <i class="bi bi-check-lg"></i> Complete
              </button>
            </div>
          </div>
        </div>
      `).join('');
    }

    if (!completedTasks.length) {
      listCompleted.innerHTML = '<div class="text-center text-muted p-3" style="font-size:13px;">No completed tasks</div>';
    } else {
      listCompleted.innerHTML = completedTasks.map(t => `
        <div class="card border-0 shadow-sm" style="background:#F0FDF4; border-radius:10px;">
          <div class="card-body p-3">
            <h6 class="card-title text-success" style="font-size:14px; font-weight:600;"><del>${esc(t.title)}</del></h6>
            <p class="card-text text-muted mb-2" style="font-size:12px;">${esc(t.description)}</p>
            <div class="d-flex justify-content-between align-items-center">
              <span class="badge bg-light text-dark border"><i class="bi bi-person me-1"></i>${esc(t.assignee)}</span>
              <span class="text-success" style="font-size:11px; font-weight:600;"><i class="bi bi-check-circle-fill"></i> Done</span>
            </div>
          </div>
        </div>
      `).join('');
    }
  } catch (e) {
    console.error("Failed to load tasks", e);
  }
}

async function submitTask() {
  if (!currentProjectId) {
    showToast('No project selected');
    return;
  }

  const title = document.getElementById('task-title').value.trim();
  const assignee = document.getElementById('task-assignee').value.trim();
  const desc = document.getElementById('task-desc').value.trim();

  if (!title) {
    showToast('Task title is required');
    return;
  }

  const fd = new FormData();
  fd.append('action', 'create');
  fd.append('project_id', currentProjectId);
  fd.append('title', title);
  fd.append('assignee', assignee);
  fd.append('description', desc);

  try {
    const res = await fetch(API + 'tasks.php', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.success) {
      showToast('Task assigned successfully!');
      document.getElementById('task-title').value = '';
      document.getElementById('task-assignee').value = '';
      document.getElementById('task-desc').value = '';
      loadTasks();
    } else {
      showToast('Error: ' + data.error);
    }
  } catch (e) {
    console.error("Failed to assign task", e);
    showToast('Failed to assign task');
  }
}

async function completeTask(id) {
  const fd = new FormData();
  fd.append('action', 'complete');
  fd.append('id', id);

  try {
    const res = await fetch(API + 'tasks.php', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.success) {
      showToast('Task marked as complete!');
      loadTasks();
    } else {
      showToast('Error: ' + data.error);
    }
  } catch (e) {
    console.error("Failed to complete task", e);
    showToast('Failed to complete task');
  }
}

/* ── INIT ── */
checkAuth();

/* ── CHART.JS DASHBOARD CHARTS ── */
function initDashboardCharts() {
  const incomeData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [{
      label: 'Income',
      data: [400, 300, 600, 800, 1100, 600, 800],
      fill: true,
      backgroundColor: function(ctx) {
        const chart = ctx.chart;
        const { ctx: c, chartArea } = chart;
        if (!chartArea) return 'rgba(244,63,94,0.1)';
        const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, 'rgba(244,63,94,0.8)');
        gradient.addColorStop(1, 'rgba(251,146,60,0)');
        return gradient;
      },
      borderColor: '#f43f5e',
      borderWidth: 4,
      tension: 0.45,
      pointRadius: 0
    }]
  };

  const incomeCanvas = document.getElementById('incomeChart');
  if (incomeCanvas) {
    new Chart(incomeCanvas, {
      type: 'line',
      data: incomeData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { color: '#9ca3af', font: { size: 12 } } },
          y: { grid: { color: '#f3f4f6' }, border: { display: false }, ticks: { color: '#9ca3af', font: { size: 12 } } }
        }
      }
    });
  }

  const growthCanvas = document.getElementById('growthChart');
  if (growthCanvas) {
    new Chart(growthCanvas, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [{
          data: [400, 300, 600, 800, 1100, 600, 800],
          backgroundColor: ['#9d50bb','#ec4899','#9d50bb','#ec4899','#9d50bb','#ec4899','#9d50bb'],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });
  }

  function makePie(id, value, color) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    new Chart(canvas, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [value, 100 - value],
          backgroundColor: [color, '#f3f4f6'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } }
      }
    });
  }

  makePie('expenseChart1', 50, '#9d50bb');
  makePie('expenseChart2', 25, '#f87171');
  makePie('expenseChart3', 60, '#6366f1');
}

initDashboardCharts();
