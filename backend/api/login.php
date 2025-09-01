<?php
session_start();
require_once __DIR__ . '/../includes/config.inc.php';
require_once __DIR__ . '/../includes/cors.inc.php';
handle_cors(
    CORS_ORIGINS,
    ['POST', 'OPTIONS'],
    ['Content-Type']
);
require_once __DIR__ . '/../includes/common.inc.php';
require_once __DIR__ . '/../includes/db.inc.php';
$response = ['success' => false];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true) ?? [];

    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        echo json_encode($response);
        exit;
    }

    if (
        !isset($data['email'], $data['password']) ||
        empty($data['email']) ||
        empty($data['password'])
    ) {
        echo json_encode($response);
        exit;
    }

    $conn = dbConnect();

    $stmt = $conn->prepare("
    SELECT u.id, u.password_hash, u.username, r.name AS role
    FROM tbl_users u
    JOIN tbl_roles r ON u.role_id = r.id
    WHERE u.email = ?
    ");
    $stmt->bind_param('s', $data['email']);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_object();
        if (password_verify($data['password'], $user->password_hash)) {
            $_SESSION['id'] = $user->id;
            $_SESSION['username'] = $user->username;
            $_SESSION['role'] = $user->role;
            $_SESSION['logged_in'] = true;
            $_SESSION['email'] = $data['email'];
            $_SESSION['last_activity'] = time();
            $response = [
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'role' => $user->role
                ]
            ];
        }
    }

    http_response_code(200);
    echo json_encode($response);
    $stmt->close();
    $conn->close();
}
?>