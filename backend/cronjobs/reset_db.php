<?php
require_once __DIR__ . '/../includes/common.inc.php';
require_once __DIR__ . '/../includes/config.inc.php';
require_once __DIR__ . '/../includes/db.inc.php';

$conn = dbConnect();
if ($conn->connect_error) {
    error_log("DB-Verbindung fehlgeschlagen: " . $conn->connect_error);
    exit(1);
}

// --- Tabellen leeren ---
$deleteTables = ['tbl_applicants', 'tbl_jobs']; // Reihenfolge beachten: zuerst die abhängigen Tabellen
foreach ($deleteTables as $table) {
    if (!$conn->query("DELETE FROM `$table`")) {
        echo "Fehler beim Löschen von $table: " . $conn->error . "\n";
    } else {
        echo "Tabelle $table geleert.\n";
    }

    // Optional: Auto-Increment zurücksetzen
    if (!$conn->query("ALTER TABLE `$table` AUTO_INCREMENT = 1")) {
        echo "Fehler beim Zurücksetzen von AUTO_INCREMENT für $table: " . $conn->error . "\n";
    }
}

// --- Users leeren (außer Superadmin) ---
$superAdminId = SUPER_ADMIN_ID;
$stmt = $conn->prepare("DELETE FROM tbl_users WHERE role_id != ?");
if ($stmt) {
    $stmt->bind_param("i", $superAdminId);
    if (!$stmt->execute()) {
        error_log("Fehler beim Löschen der User: " . $stmt->error);
    } else {
        echo "Tabelle tbl_users geleert.\n";
    }
    $stmt->close();
} else {
    error_log("Fehler beim Vorbereiten von DELETE tbl_users: " . $conn->error);
}

// --- Beispiel-Daten wieder einfügen ---
$exampleInserts = [
    // Jobs einfügen
    "INSERT INTO tbl_jobs (id, is_active, created_at) VALUES 
    (1, 1, '2025-08-28 09:15:22'), 
    (2, 1, '2025-08-28 09:15:22'), 
    (3, 1, '2025-08-28 09:15:22'), 
    (4, 1, '2025-08-28 09:15:22'), 
    (5, 0, '2025-08-29 10:20:33'), 
    (6, 1, '2025-08-29 10:20:33');",

    // Job-Übersetzungen einfügen
    "INSERT INTO tbl_job_translations (id, job_id, lang, title, location, description, details, salary) VALUES 
    (1, 1, 'de', 'Frontend Web Developer (m/w/d)', 'Wien, Österreich', 'Entwicklung moderner Webanwendungen.', 'Sie sind verantwortlich für die Umsetzung von UI-Komponenten, die Optimierung der Performance, die enge Zusammenarbeit mit Design- und Backend-Teams sowie die Sicherstellung von responsiven und barrierefreien Interfaces.', 'ab 3.800 € brutto/Monat'), 
    (2, 2, 'de', 'Maschinenbautechniker (m/w/d)', 'Linz, Österreich', 'Technische Betreuung von Produktionsmaschinen.', 'Sie führen Wartungen und Reparaturen an Maschinen durch, unterstützen die Produktionsoptimierung und dokumentieren technische Prozesse nach ISO-Standards.', 'ab 3.400 € brutto/Monat'), 
    (3, 3, 'de', 'Konstrukteur (m/w/d)', 'Graz, Österreich', '3D-Konstruktion von Bauteilen und Baugruppen.', 'Sie erstellen CAD-Modelle, technische Zeichnungen und Stücklisten, arbeiten eng mit der Fertigung zusammen und entwickeln innovative Lösungen für komplexe Maschinenbauprojekte.', 'ab 3.500 € brutto/Monat'), 
    (4, 4, 'de', 'Marketing Manager (m/w/d)', 'Salzburg, Österreich', 'Planung und Umsetzung von Marketingkampagnen.', 'Sie entwickeln Marketingstrategien, koordinieren Social Media und Content-Kampagnen, analysieren Kampagnenergebnisse und optimieren Marketingmaßnahmen zur Steigerung der Markenbekanntheit.', 'ab 3.700 € brutto/Monat'), 
    (5, 5, 'de', 'Lagermitarbeiter (m/w/d)', 'Wels, Österreich', 'Kommissionierung und Warenverwaltung.', 'Sie sorgen für die korrekte Lagerung, Überprüfung und den Versand von Waren, führen Bestandskontrollen durch und arbeiten eng mit der Logistikabteilung zusammen, um einen reibungslosen Ablauf sicherzustellen.', 'ab 2.400 € brutto/Monat'), 
    (6, 6, 'de', 'UX Designer (m/w/d)', 'Remote', 'Gestaltung nutzerfreundlicher Oberflächen für Industrie-Software.', 'Sie erstellen Wireframes, Prototypen und führen Usability-Tests durch, arbeiten eng mit Product Ownern zusammen und optimieren kontinuierlich die User Experience.', 'ab 3.600 € brutto/Monat'), 
    (7, 1, 'en', 'Frontend Web Developer (m/f/d)', 'Vienna, Austria', 'Development of modern web applications.', 'You are responsible for implementing UI components, optimizing performance, collaborating closely with design and backend teams, and ensuring responsive and accessible interfaces.', 'from €3,800 gross/month'), 
    (8, 2, 'en', 'Mechanical Technician (m/f/d)', 'Linz, Austria', 'Technical support of production machines.', 'You perform maintenance and repairs on machines, support production optimization, and document technical processes according to ISO standards.', 'from €3,400 gross/month'), 
    (9, 3, 'en', 'Design Engineer (m/f/d)', 'Graz, Austria', '3D design of components and assemblies.', 'You create CAD models, technical drawings, and bills of materials, collaborate closely with manufacturing, and develop innovative solutions for complex mechanical engineering projects.', 'from €3,500 gross/month'), 
    (10, 4, 'en', 'Marketing Manager (m/f/d)', 'Salzburg, Austria', 'Planning and execution of marketing campaigns.', 'You develop marketing strategies, coordinate social media and content campaigns, analyze campaign results, and optimize marketing measures to increase brand awareness.', 'from €3,700 gross/month'), 
    (11, 5, 'en', 'Warehouse Associate (m/f/d)', 'Wels, Austria', 'Picking and inventory management.', 'You ensure correct storage, verification, and shipment of goods, conduct inventory checks, and work closely with the logistics department to guarantee smooth operations.', 'from €2,400 gross/month'), 
    (12, 6, 'en', 'UX Designer (m/f/d)', 'Remote', 'Designing user-friendly interfaces for industrial software.', 'You create wireframes, prototypes and conduct usability tests, work closely with product owners, and continuously optimize the user experience.', 'from €3,600 gross/month');",

    // Benutzer einfügen
    "INSERT INTO tbl_users (id, username, email, password_hash, created_at, role_id) VALUES 
    (2, 'HrDemo', 'hrdemo@jobportal.com', '$2y$12$0yFED03MrsBIua2mm277/.iOts5ulO5Id0uU1D8v.27J7VfuvQs96', '2025-09-02 12:28:39', 2),
    (3, 'AdminDemo', 'admindemo@jobportal.com', '$2y$12$0yFED03MrsBIua2mm277/.iOts5ulO5Id0uU1D8v.27J7VfuvQs96', '2025-09-02 12:14:34', 1),
    (4, 'Robert', 'robert@jobportal.com', '$2y$12$0yFED03MrsBIua2mm277/.iOts5ulO5Id0uU1D8v.27J7VfuvQs96', '2025-08-28 17:10:54', 2), 
    (5, 'Sabine', 'sabine@jobportal.com', '$2y$12$0yFED03MrsBIua2mm277/.iOts5ulO5Id0uU1D8v.27J7VfuvQs96', '2025-08-29 06:45:44', 1), 
    (6, 'Judith', 'judith@jobportal.com', '$2y$12$0yFED03MrsBIua2mm277/.iOts5ulO5Id0uU1D8v.27J7VfuvQs96', '2025-08-27 06:46:12', 2);",

    // Bewerber einfügen - Teil 1
    "INSERT INTO tbl_applicants (id, job_id, first_name, last_name, email, phone, message, cv_path, created_at, is_favorite) VALUES 
    (50, 1, 'Michael', 'Schuster', 'michael.schuster@example.com', '+436601234589', 'Ich beherrsche moderne Frontend-Technologien wie React und Vue.js und freue mich auf die Herausforderung, innovative Webanwendungen in Ihrem Team zu entwickeln.', 'uploads/muster.pdf', '2025-08-25 10:15:00', 1), 
    (51, 4, 'Sarah', 'Aigner', 'sarah.aigner@example.at', '+436601234590', 'Mit meiner 5-jährigen Erfahrung im Marketingmanagement habe ich erfolgreich Kampagnen mit über 30% ROI umgesetzt und würde gerne meine Expertise in Ihr Team einbringen.', 'uploads/muster.pdf', '2025-08-25 11:20:00', 0), 
    (52, 1, 'Daniel', 'Brunner', 'daniel.brunner@example.com', '+436601234591', 'Als passionierter Webentwickler mit Schwerpunkt auf barrierefreien und performanten Lösungen möchte ich zur Weiterentwicklung Ihrer digitalen Produkte beitragen.', 'uploads/muster.pdf', '2025-08-25 14:30:00', 0), 
    (53, 5, 'Verena', 'Stadler', 'verena.stadler@example.at', '+436601234592', 'Meine langjährige Erfahrung in der Lagerlogistik und mein ausgeprägtes Organisationsgeschick qualifizieren mich ideal für diese Position in Ihrem Unternehmen.', 'uploads/muster.pdf', '2025-08-26 09:00:00', 0), 
    (54, 6, 'Florian', 'Haas', 'florian.haas@example.com', '+436601234593', 'Die Gestaltung intuitiver Benutzeroberflächen für komplexe Industrieanwendungen stellt für mich als erfahrener UX-Designer eine spannende Herausforderung dar.', 'uploads/muster.pdf', '2025-08-26 10:45:00', 0), 
    (55, 1, 'Melanie', 'Schwarz', 'melanie.schwarz@example.at', '+436601234594', 'Mit meinem fundierten Wissen in modernen JavaScript-Frameworks und meiner Erfahrung in agilen Entwicklungsteams passe ich perfekt zu Ihren Anforderungen.', 'uploads/muster.pdf', '2025-08-26 13:15:00', 0), 
    (56, 5, 'Alexander', 'Mayr', 'alexander.mayr@example.com', '+436601234595', 'Meine präzise Arbeitsweise und Erfahrung mit Warenwirtschaftssystemen machen mich zum idealen Kandidaten für die Optimierung Ihrer Lagerprozesse.', 'uploads/muster.pdf', '2025-08-26 15:30:00', 1), 
    (57, 2, 'Barbara', 'Eder', 'barbara.eder@example.at', '+436601234596', 'Als gelernte Maschinenbautechnikerin mit Zusatzqualifikation in Industrie 4.0 bringe ich sowohl praktisches als auch technisches Verständnis für Ihre Produktionsanlagen mit.', 'uploads/muster.pdf', '2025-08-26 16:20:00', 0);",

    // Bewerber einfügen - Teil 2
    "INSERT INTO tbl_applicants (id, job_id, first_name, last_name, email, phone, message, cv_path, created_at, is_favorite) VALUES 
    (59, 2, 'Robert', 'Steiner', 'robert.steiner@example.com', '+436601234598', 'Meine Stärke ist die vorausschauende Instandhaltung. Ich höre und sehe, wenn sich ein Lager ankündigt oder eine Pumpe nicht mehr rund läuft. So kann ich Maschinenstillstände verhindern, bevor sie teuer werden.', 'uploads/muster.pdf', '2025-08-27 08:30:00', 1), 
    (60, 1, 'Petra', 'Mayer', 'petra.mayer@example.at', '+436601234599', 'Die Entwicklung responsiver Webapplikationen mit Fokus auf Mobile First ist meine Leidenschaft. Ich würde gerne meine Skills in Ihr innovatives Team einbringen.', 'uploads/muster.pdf', '2025-08-27 10:00:00', 0), 
    (61, 2, 'Manuel', 'Schmid', 'manuel.schmid@example.com', '+436601234600', 'Meine Expertise in der Fehlerdiagnose und Instandsetzung komplexer Fertigungsanlagen gepaart mit meiner teamorientierten Arbeitsweise macht mich zum idealen Kandidaten.', 'uploads/muster.pdf', '2025-08-27 11:45:00', 0), 
    (62, 3, 'Anna', 'Wimmer', 'anna.wimmer@example.at', '+436601234601', 'Als Konstrukteurin mit Schwerpunkt auf nachhaltige Materialverwendung und Leichtbau entwickle ich gerne innovative Lösungen für anspruchsvolle technische Herausforderungen.', 'uploads/muster.pdf', '2025-08-27 14:00:00', 0), 
    (63, 4, 'Christoph', 'Maier', 'christoph.maier@example.com', '+436601234602', 'Meine erfolgreich umgesetzten Marketingkampagnen mit Fokus auf Digital Marketing und Social Media würden Ihre Markenpräsenz nachhaltig stärken.', 'uploads/muster.pdf', '2025-08-27 15:30:00', 0), 
    (64, 5, 'Sabine', 'Wolf', 'sabine.wolf@example.at', '+436601234603', 'Durch meine systematische Arbeitsweise und Erfahrung mit modernen Lagerverwaltungssystemen kann ich einen reibungslosen Warenfluss in Ihrem Unternehmen gewährleisten.', 'uploads/muster.pdf', '2025-08-28 09:15:00', 0), 
    (65, 6, 'Dominik', 'Auer', 'dominik.auer@example.com', '+436601234604', 'Ich übersetze komplexe Arbeitsabläufe aus der Produktion in intuitive Oberflächen. Meine Designs reduzieren die Anzahl der Klicks, minimieren Bedienfehler und stellen sicher, dass die wirklich wichtigen Informationen sofort ins Auge springen.', 'uploads/muster.pdf', '2025-08-28 10:45:00', 1), 
    (66, 3, 'Lisa', 'Binder', 'lisa.binder@example.at', '+436601234605', 'Meine Erfahrung mit Konstruktion und Simulation ermöglicht mir, sowohl effiziente als auch robuste technische Lösungen für Ihre Projekte zu entwickeln.', 'uploads/muster.pdf', '2025-08-28 13:00:00', 0);",

    // Bewerber einfügen - Teil 3
    "INSERT INTO tbl_applicants (id, job_id, first_name, last_name, email, phone, message, cv_path, created_at, is_favorite) VALUES 
    (67, 3, 'Stefan', 'Koller', 'stefan.koller@example.com', '+436601234606', 'Die Entwicklung von Baugruppen unter Berücksichtigung von Fertigungsoptimierung und Kostenefﬁzienz stellt für mich als erfahrener Konstrukteur eine interessante Aufgabe dar.', 'uploads/muster.pdf', '2025-08-28 14:30:00', 0), 
    (68, 3, 'Monika', 'Pichler', 'monika.pichler@example.at', '+436601234607', 'Meine Spezialisierung auf CAD/CAM-Systeme und meine Erfahrung in der Zusammenarbeit mit Fertigungsteams qualifizieren mich ideal für Ihre anspruchsvollen Projekte.', 'uploads/muster.pdf', '2025-08-28 16:00:00', 0), 
    (69, 4, 'Andreas', 'Reiter', 'andreas.reiter@example.com', '+436601234608', 'Strategische Markenführung kombiniert mit datengestützten Marketingentscheidungen ist mein Erfolgsrezept. Ich würde gerne Ihr Marketing auf das nächste Level heben.', 'uploads/muster.pdf', '2025-08-29 08:45:00', 1), 
    (70, 6, 'Jasmin', 'Huber', 'jasmin.huber@example.at', '+436601234609', 'Durch meine methodische Herangehensweise an UX-Research und meine Erfahrung mit User-Testing kann ich die Usability Ihrer Softwarelösungen signifikant verbessern.', 'uploads/muster.pdf', '2025-08-29 10:15:00', 0), 
    (71, 4, 'Martin', 'Weiss', 'martin.weiss@example.com', '+436601234610', 'Mein ganzheitlicher Ansatz im Marketing von der Strategieentwicklung bis zur Kampagnenanalyse hat in bisherigen Positionen nachweislich zu erhöhter Kundenbindung geführt.', 'uploads/muster.pdf', '2025-08-29 12:00:00', 0), 
    (72, 6, 'Elisabeth', 'Schuster', 'elisabeth.schuster@example.at', '+436601234611', 'Ich habe gelernt, dass die besten Interfaces entstehen, wenn man den Nutzer und seine täglichen Abläufe wirklich versteht. Bei Industrie-Software heißt das für mich: viel vor Ort zuhören, mit den Anwendern sprechen und komplexe Prozesse in einfache, intuitive Bedienung übersetzen.', 'uploads/muster.pdf', '2025-08-29 14:30:00', 0), 
    (73, 1, 'Georg', 'Brandstetter', 'georg.brandstetter@example.com', '+436601234612', 'Modernes Frontend-Development mit Fokus auf Performance-Optimierung und skalierbare Architekturen ist meine Spezialität, daher passe ich perfekt zu Ihren technischen Anforderungen.', 'uploads/muster.pdf', '2025-08-29 16:00:00', 0), 
    (74, 3, 'Kathrin', 'Leitner', 'kathrin.leitner@example.at', '+436601234613', 'Meine Expertise in der 3D-Konstruktion von Sondermaschinen und meine Kenntnisse in FEM-Analyse qualifizieren mich für anspruchsvolle Engineering-Projekte in Ihrem Unternehmen.', 'uploads/muster.pdf', '2025-08-30 09:00:00', 0), 
    (75, 2, 'Wolfgang', 'Baumgartner', 'wolfgang.baumgartner@example.com', '+436601234614', 'Mit meiner langjährigen Erfahrung in der Instandhaltung kann ich Maschinen nicht nur reparieren, sondern durch regelmäßige Wartung und ein wachsames Auge für Verschleiß auch Stillstandszeiten minimieren.', 'uploads/muster.pdf', '2025-08-30 11:00:00', 1);"
];

foreach ($exampleInserts as $sql) {
    if (!$conn->query($sql)) {
        error_log("Fehler beim Insert: " . $conn->error);
    }
}
echo "Tabellen wurden wieder mit Beispieldaten befüllt.";

$conn->close();
?>