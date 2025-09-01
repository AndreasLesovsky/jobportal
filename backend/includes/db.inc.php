<?php
// --- Versuch, eine mysqli Verbindung mit der db herzustellen ---
function dbConnect(): mysqli {
    try {
        $conn = new mysqli(DB["host"], DB["user"], DB["pwd"], DB["name"]);

        if ($conn->connect_error) {
            if (TESTMODUS) {
                die("Datenbankverbindungsfehler: " . $conn->connect_error);
            } else {
                header("Location: " . DB["errorpages"]["dbconnect"]);
                exit;
            }
        }

        if (!$conn->set_charset(DB["charset"])) {
            if (TESTMODUS) {
                die("Zeichensatz konnte nicht gesetzt werden: " . $conn->error);
            } else {
                header("Location: " . DB["errorpages"]["dbconnect"]);
                exit;
            }
        }

        return $conn;
    } catch (Throwable $e) {
        if (TESTMODUS) {
            if (function_exists('ta')) {
                ta($e);
            }
            die("Unerwarteter Fehler beim DB-Connect.");
        } else {
            header("Location: " . DB["errorpages"]["dbconnect"]);
            exit;
        }
    }
}

// --- Nur zum raw SQL testen, im Produktivbetrieb werden nur prepared Statements verwendet! ---
function dbQuery(mysqli $conn, string $sql): mysqli_result|bool {
    try {
        $result = $conn->query($sql);
        if ($result === false) {
            if (TESTMODUS) {
                die("SQL-Fehler: " . $conn->error . "<br>" . $sql);
            } else {
                header("Location: errors/dbquery.html");
                exit;
            }
        }

        return $result;
    } catch (Throwable $e) {
        if (TESTMODUS) {
            if (function_exists('ta')) {
                ta($e);
            }
            die("Exception bei SQL: $sql");
        } else {
            header("Location: errors/dbquery.html");
            exit;
        }
    }
}
?>