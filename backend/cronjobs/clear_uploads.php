<?php
$dir = __DIR__ . '/../uploads/';
$maxAge = 0;

if (is_dir($dir)) {
    // --- Alle Dateien und Unterverzeichnisse im Verzeichnis durchlaufen ---
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );

    foreach ($files as $file) {
        // --- Ausschlussdatei ---
        if ($file->isFile() && $file->getFilename() === 'muster.pdf') {
            continue; // überspringt diese Datei
        }

        // --- Datei oder Verzeichnis löschen, wenn es älter als $maxAge ist ---
        if ($file->isFile() && time() - $file->getMTime() > $maxAge) {
            unlink($file->getRealPath());
        }
        // --- Leere Unterverzeichnisse löschen ---
        elseif ($file->isDir() && count(scandir($file->getRealPath())) == 2) {
            rmdir($file->getRealPath());
        }
    }

    echo "Bereinigung abgeschlossen.";
} else {
    echo "Das Verzeichnis $dir existiert nicht.";
}
?>