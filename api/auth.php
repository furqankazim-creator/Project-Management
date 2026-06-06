<?php
session_start();
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

if ($method === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'login') {
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';

        if (!$email || !$password) {
            jsonResponse(['success' => false, 'error' => 'Email and password required'], 400);
        }

        $stmt = $db->prepare("SELECT id, password, email FROM admins WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['admin_id'] = $user['id'];
            $_SESSION['email'] = $user['email'];
            jsonResponse(['success' => true, 'email' => $user['email']]);
        } else {
            jsonResponse(['success' => false, 'error' => 'Invalid credentials'], 401);
        }
    }

    if ($action === 'logout') {
        session_destroy();
        jsonResponse(['success' => true]);
    }
}

if ($method === 'GET') {
    if (isset($_SESSION['admin_id'])) {
        jsonResponse(['authenticated' => true, 'email' => $_SESSION['email']]);
    } else {
        jsonResponse(['authenticated' => false]);
    }
}

jsonResponse(['error' => 'Invalid request'], 400);
