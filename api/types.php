<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

/* ── GET — list all types ── */
if ($method === 'GET') {
    $stmt = $db->query("SELECT id, name FROM project_types ORDER BY name ASC");
    jsonResponse(['types' => $stmt->fetchAll()]);
}

/* ── POST — add a new type ── */
if ($method === 'POST') {
    $name = trim($_POST['name'] ?? '');
    if (!$name) jsonResponse(['success' => false, 'error' => 'Type name is required'], 422);

    /* Duplicate check */
    $check = $db->prepare("SELECT id FROM project_types WHERE LOWER(name) = LOWER(:name)");
    $check->execute([':name' => $name]);
    if ($check->fetch()) jsonResponse(['success' => false, 'error' => 'Already exists'], 409);

    $db->prepare("INSERT INTO project_types (name) VALUES (:name)")->execute([':name' => $name]);
    jsonResponse(['success' => true]);
}

/* ── DELETE — remove a type ── */
if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) jsonResponse(['success' => false, 'error' => 'Invalid ID'], 400);
    $db->prepare("DELETE FROM project_types WHERE id = :id")->execute([':id' => $id]);
    jsonResponse(['success' => true]);
}

jsonResponse(['error' => 'Method not allowed'], 405);
