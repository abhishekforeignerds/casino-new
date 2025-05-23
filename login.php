<?php
session_start();
include 'db.php';

$response = [];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize and trim inputs
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);
    $errors = [];

    // Validate inputs
    if (empty($email)) {
        $errors[] = "Email is required.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Invalid email format.";
    }
    if (empty($password)) {
        $errors[] = "Password is required.";
    }

    if (empty($errors)) {
        // Check if the user exists
        $stmt = $conn->prepare("SELECT id, username, email, password FROM user WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows == 1) {
            $user = $result->fetch_assoc();
            if ($user['status'] == 'inactive') {
   
            $response = [
                    'status' => 'error',
                    'message' => 'Acount is not Active'
                ];
      }
            // Verify password
            if (password_verify($password, $user['password'])) {
                $user_id = $user['id'];

                // Fetch all columns from bets table for the user
                $stmt_fetch_bets = $conn->prepare("SELECT * FROM bets WHERE user_id = ?");
                $stmt_fetch_bets->bind_param("i", $user_id);
                $stmt_fetch_bets->execute();
                $result_bets = $stmt_fetch_bets->get_result();
                $bets_data = $result_bets->fetch_assoc();
                $stmt_fetch_bets->close();

                // Store user data and bets data in session
                $_SESSION['user'] = [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                ];

                // If user has data in bets table, add it to session
                if ($bets_data) {
                    $_SESSION['bets'] = $bets_data; // Stores all bets table columns in session
                }

                $response = [
                    'status' => 'success',
                    'message' => 'Login successful!',
                    'redirect' => '/dashboard.php'
                ];
            } else {
                $response = [
                    'status' => 'error',
                    'message' => 'Incorrect password. fgdfh'
                ];
            }
        } else {
            $response = [
                'status' => 'error',
                'message' => 'No account found with this email.'
            ];
        }

        $stmt->close();
    } else {
        $response = [
            'status' => 'error',
            'message' => $errors
        ];
    }
}

header('Content-Type: application/json');
echo json_encode($response);
?>
