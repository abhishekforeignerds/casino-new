<?php
require 'db.php';

// Get the field name and value from the request.
$field = $_GET['field'] ?? '';
$value = trim($_GET['value'] ?? '');

$response = ['exists' => false];

// Define allowed fields to prevent SQL injection.
$allowedFields = ['email', 'username', 'phone'];

if (in_array($field, $allowedFields) && !empty($value)) {
    // It's safe to include $field in the query because it's whitelisted.
    $query = "SELECT id FROM user WHERE $field = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $value);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        $response['exists'] = true;
    }
    $stmt->close();
}

header('Content-Type: application/json');
echo json_encode($response);
?>
