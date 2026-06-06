<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

/* ── GET — list all projects with file counts ── */
if ($method === 'GET') {
    $stmt = $db->query("
        SELECT
            p.id,
            p.name,
            p.type,
            p.status,
            p.payment_type,
            p.project_origin,
            p.country,
            p.description,
            DATE_FORMAT(p.created_at, '%d %b %Y') AS created_at,
            COUNT(f.id) AS file_count
        FROM projects p
        LEFT JOIN project_files f ON f.project_id = p.id
        GROUP BY p.id
        ORDER BY p.created_at DESC
    ");
    jsonResponse(['projects' => $stmt->fetchAll()]);
}

/* ── POST — update description ── */
if ($method === 'POST' && ($_POST['action'] ?? '') === 'update_desc') {
    $id   = intval($_POST['id'] ?? 0);
    $desc = trim($_POST['description'] ?? '');
    if (!$id) jsonResponse(['success' => false, 'error' => 'Project ID required'], 400);
    $stmt = $db->prepare("UPDATE projects SET description = :desc WHERE id = :id");
    $stmt->execute([':desc' => $desc, ':id' => $id]);
    jsonResponse(['success' => true]);
}

/* ── POST — create project + upload files ── */
if ($method === 'POST') {
    $name        = trim($_POST['name']        ?? '');
    $type        = trim($_POST['type']        ?? '');
    $status      = trim($_POST['status']      ?? 'active');
    $payment_type = trim($_POST['payment_type'] ?? 'paid');
    $project_origin = trim($_POST['project_origin'] ?? 'client');
    $country     = trim($_POST['country']     ?? '');
    $description = trim($_POST['description'] ?? '');

    if (!$name) jsonResponse(['success' => false, 'error' => 'Project name is required'], 422);
    if (!$type) jsonResponse(['success' => false, 'error' => 'Project type is required'], 422);

    $allowed_statuses = ['active', 'on-hold', 'draft'];
    if (!in_array($status, $allowed_statuses)) $status = 'active';

    $stmt = $db->prepare("
        INSERT INTO projects (name, type, status, payment_type, project_origin, country, description)
        VALUES (:name, :type, :status, :payment_type, :project_origin, :country, :description)
    ");
    $stmt->execute([
        ':name'           => $name,
        ':type'           => $type,
        ':status'         => $status,
        ':payment_type'   => $payment_type,
        ':project_origin' => $project_origin,
        ':country'        => $country,
        ':description'    => $description,
    ]);
    $projectId = $db->lastInsertId();

    /* The file uploads are now handled separately via api/files.php */

    jsonResponse(['success' => true, 'id' => $projectId]);
}

/* ── DELETE — remove a project and its files ── */
if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) jsonResponse(['success' => false, 'error' => 'Invalid ID'], 400);

    /* Delete stored files from disk */
    $stmt = $db->prepare("SELECT stored_name FROM project_files WHERE project_id = :id");
    $stmt->execute([':id' => $id]);
    foreach ($stmt->fetchAll() as $row) {
        $path = __DIR__ . '/../uploads/' . $row['stored_name'];
        if (file_exists($path)) unlink($path);
    }

    $db->prepare("DELETE FROM project_files WHERE project_id = :id")->execute([':id' => $id]);
    $db->prepare("DELETE FROM projects WHERE id = :id")->execute([':id' => $id]);

    jsonResponse(['success' => true]);
}

jsonResponse(['error' => 'Method not allowed'], 405);
