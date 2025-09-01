<?php
// --- Erlaubte CORS-Origins ---
define("CORS_ORIGINS", [
    "https://example.com",
    "https://www.example.com",
    "http://localhost:4200"
]);

// --- DB Zugang ---
define("DB",[
	"host" => "",
	"user" => "",
	"pwd" => "",
	"name" => "",
	"charset" => "",
	"errorpages" => [
		"dbconnect" => "errors/dbconnect.html"
	]
]);

// --- Super Admin ID, für absoluten User, der nicht gelöscht werden kann ---
define('SUPER_ADMIN_ID', 1);

// --- reCAPTCHA secret key ---
define("RECAPTCHA_SECRET", "");

// --- Mailserver Config ---
define("MAIL", [
    "host" => "",
    "port" => 587,
    "user" => "",
    "pwd" => "",
    "from_email" => "",
    "from_name" => "",
	"to_email" => "",
	"to_name" => ""
]);

// --- gibt an, ob wir uns in einem Development-System (TESTMODUS ist true) oder in einem Produktivsystem (TESTMODUS ist false) befinden ---
define("TESTMODUS", false);

// --- Testmodus: Fehleranzeige im Browser + Logging ---
if (TESTMODUS) {
	error_reporting(E_ALL);
	ini_set('display_errors', 1);
	ini_set('log_errors', 1);
	ini_set('error_log', __DIR__ . '/php_error.log');
} else {
	// --- Produktivmodus: keine Anzeige für Besucher, nur Logging ---
    error_reporting(E_ALL & ~E_DEPRECATED & ~E_NOTICE); // Notices/Deprecated ausschließen
    ini_set("display_errors", 0);
    ini_set('log_errors', 1);
    ini_set('error_log', __DIR__ . '/php_error.log');
}
?>