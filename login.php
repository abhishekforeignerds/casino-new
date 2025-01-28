<?php
session_start();
include 'db.php';

header('Content-Type: application/json'); // Ensure the response is JSON

$response = []; // Initialize the response array

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);

    // Prepare a statement to prevent SQL injection
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows == 1) {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user['password'])) {
            // Create a session for the logged-in user
            $_SESSION['user'] = [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email']
            ];

            // Return a success response
            $response = [
                'status' => 'success',
                'message' => 'Login successful!',
                'redirect' => 'dashboard.php' // Path to redirect the user
            ];
        } else {
            // Invalid password
            $response = [
                'status' => 'error',
                'message' => 'Invalid password.'
            ];
        }
    } else {
        // User not found
        $response = [
            'status' => 'error',
            'message' => 'User not found.'
        ];
    }

    $stmt->close();
} else {
    // Invalid request method
    $response = [
        'status' => 'error',
        'message' => 'Invalid request method.'
    ];
}

// Send JSON response
echo json_encode($response);
exit();
?>
