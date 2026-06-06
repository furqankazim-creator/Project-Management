<?php
require_once 'api/config.php';
try {
    $db = getDB();
    echo "Connection successful!\n";
    
    // Check if tables exist
    $tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "Tables: " . implode(', ', $tables) . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
