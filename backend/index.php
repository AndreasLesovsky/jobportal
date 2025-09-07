<?php
require_once 'includes/config.inc.php';
require_once 'includes/cors.inc.php';
handle_cors(
    CORS_ORIGINS,
    ['GET', 'POST', 'OPTIONS'],
    ['Content-Type']
);
require_once 'includes/common.inc.php';

$apiPath = 'api/';

// --- Prüfen, ob endpoint gesetzt ist ---
$data = json_decode(file_get_contents('php://input'), true) ?? [];
$endpoint = $data['endpoint'] ?? ($_REQUEST['endpoint'] ?? null);

if (!$endpoint) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Bad Request']);
    error_log('Kein Endpoint angegeben');
    exit;
}

// --- Mapping Endpoints auf PHP-Dateien ---
$routes = [
    'get_users'          => 'get_users.php',
    'get_jobs'           => 'get_jobs.php',
    'get_applicants'     => 'get_applicants.php',
    'download_cv'        => 'download_cv.php',
    'delete_entity'      => 'delete_entity.php',
    'save_job'           => 'save_job.php',
    'save_user'          => 'save_user.php',
    'send_contact_mail'  => 'send_contact_mail.php',
    'job_application'    => 'send_job_application.php',
    'login'              => 'login.php',
    'check_session'      => 'check_activity.php',
    'logout'             => 'logout.php',
    'toggle_entity'      => 'toggle_entity.php',
];

// --- Prüfen ob Endpoint existiert ---
if (!isset($routes[$endpoint])) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Not Found']);
    error_log('Unbekannter Endpoint');
    exit;
}

// --- Include der richtigen Datei ---
require $apiPath . $routes[$endpoint];
?>