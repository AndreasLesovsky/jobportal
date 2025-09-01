<?php
require_once __DIR__ . '/../includes/config.inc.php';
require_once __DIR__ . '/../includes/cors.inc.php';
handle_cors(
    CORS_ORIGINS,
    ['POST', 'OPTIONS'],
    ['Content-Type']
);
require_once __DIR__ . '/../includes/common.inc.php';
require_once __DIR__ . '/../includes/db.inc.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    error_log('Nur POST erlaubt');
    exit;
}

$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
$is_active = isset($_POST['is_active']) ? (int)$_POST['is_active'] : 1;

// --- DE Daten ---
$de_title = trim($_POST['de_title'] ?? '');
$de_location = trim($_POST['de_location'] ?? '');
$de_description = trim($_POST['de_description'] ?? '');
$de_details = trim($_POST['de_details'] ?? '');
$de_salary = trim($_POST['de_salary'] ?? '');

// --- EN Daten ---
$en_title = trim($_POST['en_title'] ?? '');
$en_location = trim($_POST['en_location'] ?? '');
$en_description = trim($_POST['en_description'] ?? '');
$en_details = trim($_POST['en_details'] ?? '');
$en_salary = trim($_POST['en_salary'] ?? '');

if (
    !$de_title || !$de_location || !$de_description || !$de_details || !$de_salary ||
    !$en_title || !$en_location || !$en_description || !$en_details || !$en_salary
) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Bad Request']);
    error_log('Fehlende Formularfelder');
    exit;
}

$conn = dbConnect();

if ($id > 0) {
    // --- UPDATE Job ---
    $sql = "UPDATE tbl_jobs SET is_active=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $is_active, $id);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Internal Server Error']);
        error_log('Update fehlgeschlagen (jobs)');
        exit;
    }

    // --- UPDATE beide Übersetzungen ---
    $translations = [
        ['de', $de_title, $de_location, $de_description, $de_details, $de_salary],
        ['en', $en_title, $en_location, $en_description, $en_details, $en_salary],
    ];

    $sql = "UPDATE tbl_job_translations 
            SET title=?, location=?, description=?, details=?, salary=? 
            WHERE job_id=? AND lang=?";
    $stmt = $conn->prepare($sql);

    foreach ($translations as $t) {
        [$t_lang, $t_title, $t_location, $t_description, $t_details, $t_salary] = $t;
        $stmt->bind_param('sssssis', $t_title, $t_location, $t_description, $t_details, $t_salary, $id, $t_lang);
        if (!$stmt->execute()) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Internal Server Error']);
            error_log("Update fehlgeschlagen (translation $t_lang)");
            exit;
        }
    }

    echo json_encode(['success' => true, 'action' => 'updated']);
} else {
    // --- CREATE ---
    $sql = "INSERT INTO tbl_jobs (is_active) VALUES (?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $is_active);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Internal Server Error']);
        error_log('Insert fehlgeschlagen (jobs)');
        exit;
    }
    $job_id = $stmt->insert_id;

    // --- CREATE beide Übersetzungen ---
    $translations = [
        ['de', $de_title, $de_location, $de_description, $de_details, $de_salary],
        ['en', $en_title, $en_location, $en_description, $en_details, $en_salary],
    ];

    $sql = "INSERT INTO tbl_job_translations (job_id, lang, title, location, description, details, salary)
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);

    foreach ($translations as $t) {
        [$t_lang, $t_title, $t_location, $t_description, $t_details, $t_salary] = $t;
        $stmt->bind_param('issssss', $job_id, $t_lang, $t_title, $t_location, $t_description, $t_details, $t_salary);
        if (!$stmt->execute()) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Internal Server Error']);
            error_log("Insert fehlgeschlagen (translation $t_lang)");
            exit;
        }
    }

    echo json_encode(['success' => true, 'action' => 'created', 'id' => $job_id]);
}

$stmt->close();
$conn->close();
?>