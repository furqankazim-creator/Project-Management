<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

if ($method === 'GET') {
    $projectId = intval($_GET['project_id'] ?? 0);
    if (!$projectId) jsonResponse(['success' => false, 'error' => 'Project ID is required'], 400);
    $stmt = $db->prepare("SELECT id, original_name, stored_name, file_size FROM project_files WHERE project_id = :pid ORDER BY id DESC");
    $stmt->execute([':pid' => $projectId]);
    jsonResponse(['files' => $stmt->fetchAll()]);
}

if ($method === 'POST') {
    $projectId = intval($_POST['project_id'] ?? 0);
    if (!$projectId) {
        jsonResponse(['success' => false, 'error' => 'Project ID is required'], 400);
    }

    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        jsonResponse(['success' => false, 'error' => 'File upload failed or no file sent'], 400);
    }

    $file = $_FILES['file'];

    // Validation
    $maxSize = 50 * 1024 * 1024;
    if ($file['size'] > $maxSize) {
        jsonResponse(['success' => false, 'error' => 'File size exceeds 50MB'], 400);
    }

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $disallowedExts = ['exe', 'bat', 'sh', 'php'];
    if (in_array($ext, $disallowedExts)) {
        jsonResponse(['success' => false, 'error' => 'File type not allowed'], 400);
    }

    // Save file
    $uploadDir = __DIR__ . '/../uploads/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

    $stored = uniqid('file_', true) . ($ext ? '.' . $ext : '');
    $dest   = $uploadDir . $stored;

    if (move_uploaded_file($file['tmp_name'], $dest)) {
        // Insert into database
        $stmt = $db->prepare("
            INSERT INTO project_files (project_id, original_name, stored_name, file_size)
            VALUES (:project_id, :original_name, :stored_name, :file_size)
        ");
        $stmt->execute([
            ':project_id'    => $projectId,
            ':original_name' => $file['name'],
            ':stored_name'   => $stored,
            ':file_size'     => $file['size']
        ]);

        jsonResponse([
            'success' => true,
            'file' => [
                'id' => $db->lastInsertId(),
                'original_name' => $file['name'],
                'size' => $file['size']
            ]
        ]);
    } else {
        jsonResponse(['success' => false, 'error' => 'Failed to move uploaded file'], 500);
    }
}

jsonResponse(['error' => 'Method not allowed'], 405);
