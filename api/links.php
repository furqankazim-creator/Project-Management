<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

$db->exec("CREATE TABLE IF NOT EXISTS project_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

if ($method === 'GET') {
    $pid = intval($_GET['project_id'] ?? 0);
    if (!$pid) jsonResponse(['success' => false, 'error' => 'Project ID required'], 400);
    $stmt = $db->prepare("SELECT id, title, url FROM project_links WHERE project_id = ? ORDER BY id DESC");
    $stmt->execute([$pid]);
    jsonResponse(['links' => $stmt->fetchAll()]);
}

if ($method === 'POST') {
    $pid   = intval($_POST['project_id'] ?? 0);
    $title = trim($_POST['title'] ?? '');
    $url   = trim($_POST['url'] ?? '');
    if (!$pid || !$title || !$url) {
        jsonResponse(['success' => false, 'error' => 'All fields required'], 400);
    }
    $stmt = $db->prepare("INSERT INTO project_links (project_id, title, url) VALUES (?, ?, ?)");
    $stmt->execute([$pid, $title, $url]);
    jsonResponse(['success' => true, 'id' => $db->lastInsertId()]);
}

if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) jsonResponse(['success' => false, 'error' => 'Invalid ID'], 400);
    $db->prepare("DELETE FROM project_links WHERE id = ?")->execute([$id]);
    jsonResponse(['success' => true]);
}

jsonResponse(['error' => 'Method not allowed'], 405);
