<?php
require_once __DIR__ . '/config.php';

$pdo = getDB();

// Initialize table
$pdo->exec("CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assignee VARCHAR(255),
    status ENUM('pending', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tasks_project
      FOREIGN KEY (project_id) REFERENCES projects(id)
      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $project_id = $_GET['project_id'] ?? 0;
    
    if (!$project_id) {
        jsonResponse(['success' => false, 'error' => 'Project ID required'], 400);
    }

    $stmt = $pdo->prepare("SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC");
    $stmt->execute([$project_id]);
    $tasks = $stmt->fetchAll();
    
    jsonResponse(['success' => true, 'tasks' => $tasks]);
}

if ($method === 'POST') {
    $action = $_POST['action'] ?? 'create';

    if ($action === 'create') {
        $project_id = $_POST['project_id'] ?? 0;
        $title = $_POST['title'] ?? '';
        $description = $_POST['description'] ?? '';
        $assignee = $_POST['assignee'] ?? '';

        if (!$project_id || !$title) {
            jsonResponse(['success' => false, 'error' => 'Project ID and Title are required'], 400);
        }

        $stmt = $pdo->prepare("INSERT INTO tasks (project_id, title, description, assignee) VALUES (?, ?, ?, ?)");
        $stmt->execute([$project_id, $title, $description, $assignee]);
        $id = $pdo->lastInsertId();

        jsonResponse(['success' => true, 'id' => $id]);
    } 
    elseif ($action === 'complete') {
        $id = $_POST['id'] ?? 0;

        if (!$id) {
            jsonResponse(['success' => false, 'error' => 'Task ID required'], 400);
        }

        $stmt = $pdo->prepare("UPDATE tasks SET status = 'completed' WHERE id = ?");
        $stmt->execute([$id]);

        jsonResponse(['success' => true]);
    }
    elseif ($action === 'update') {
        $id = intval($_POST['id'] ?? 0);
        $title = trim($_POST['title'] ?? '');
        $description = trim($_POST['description'] ?? '');
        if (!$id || !$title) {
            jsonResponse(['success' => false, 'error' => 'ID and title required'], 400);
        }
        $stmt = $pdo->prepare("UPDATE tasks SET title = ?, description = ? WHERE id = ?");
        $stmt->execute([$title, $description, $id]);
        jsonResponse(['success' => true]);
    }
}

jsonResponse(['success' => false, 'error' => 'Invalid request'], 400);
