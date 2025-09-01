<?php
// --- cors.inc.php, immer direkt nach config.inc.php includen und Funktion handle_cors sofort aufrufen! ---
function handle_cors(array $allowed_origins, array $allowed_methods = ['GET', 'POST', 'OPTIONS'], array $allowed_headers = ['Content-Type', 'X-Requested-With']): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    // --- Wenn Origin gesetzt ist, prüfen ob erlaubt ---
    if ($origin !== '' && !in_array($origin, $allowed_origins, true)) {
        http_response_code(403);
        echo json_encode(['error' => 'CORS origin not allowed.']);
        exit;
    }

    // --- Wenn Origin gesetzt, dann Header setzen ---
    if ($origin !== '') {
        header("Access-Control-Allow-Origin: $origin");
        header("Vary: Origin");
        header("Access-Control-Allow-Credentials: true");
    }

    // --- Preflight OPTIONS-Anfrage immer mit 200 beantworten, auch ohne Origin ---
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        header('Access-Control-Allow-Methods: ' . implode(', ', $allowed_methods));
        header('Access-Control-Allow-Headers: ' . implode(', ', $allowed_headers));
        header("Access-Control-Allow-Credentials: true");
        http_response_code(200);
        exit;
    }
}
?>