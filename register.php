<?php
session_start();
include 'db.php';

$response = [];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize and trim inputs
    $username = trim($_POST['username']);
    $email = trim($_POST['email']);
    $phone = trim($_POST['phone']);
    $password = trim($_POST['password']);
    $errors = [];

    // Validate inputs
    if (empty($username)) {
        $errors[] = "Username is required.";
    }
    if (empty($email)) {
        $errors[] = "Email is required.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Invalid email format.";
    }
    if (empty($phone)) {
        $errors[] = "Phone number is required.";
    } elseif (!preg_match('/^\d{10}$/', $phone)) {
        $errors[] = "Phone number must be 10 digits.";
    }
    if (empty($password)) {
        $errors[] = "Password is required.";
    }

    // Hash the password if no errors so far
    if (empty($errors)) {
        $hashed_password = password_hash($password, PASSWORD_BCRYPT);

        // Check for duplicate email
        $stmt_check_email = $conn->prepare("SELECT * FROM users WHERE email = ?");
        $stmt_check_email->bind_param("s", $email);
        $stmt_check_email->execute();
        $result_email = $stmt_check_email->get_result();
        if ($result_email->num_rows > 0) {
            $errors[] = "Email already exists!";
        }
        $stmt_check_email->close();

        // Check for duplicate phone
        $stmt_check_phone = $conn->prepare("SELECT * FROM users WHERE phone = ?");
        $stmt_check_phone->bind_param("s", $phone);
        $stmt_check_phone->execute();
        $result_phone = $stmt_check_phone->get_result();
        if ($result_phone->num_rows > 0) {
            $errors[] = "Phone number already exists!";
        }
        $stmt_check_phone->close();
    }

    // If no errors, proceed with insertion
    if (empty($errors)) {
        $stmt_insert = $conn->prepare("INSERT INTO users (username, email, phone, password) VALUES (?, ?, ?, ?)");
        $stmt_insert->bind_param("ssss", $username, $email, $phone, $hashed_password);

        if ($stmt_insert->execute()) {
            $user_id = $conn->insert_id; // Get newly inserted user's ID

            // Insert default values into the bets table
            $stmt_bets = $conn->prepare("
                INSERT INTO bets (user_id, bank_value, current_bet, wager, last_wager, bet, numbers_bet, previous_numbers) 
                VALUES (?, 1000, 0, 5, 0, '[]', '[]', '[]')
            ");
            $stmt_bets->bind_param("i", $user_id);
            $stmt_bets->execute();
            $stmt_bets->close();

            // Automatically log in the user after registration
            $_SESSION['user'] = [
                'id' => $user_id,
                'username' => $username,
                'email' => $email,
            ];


            $stmt_fetch_bets = $conn->prepare("SELECT * FROM bets WHERE user_id = ?");
                $stmt_fetch_bets->bind_param("i", $user_id);
                $stmt_fetch_bets->execute();
                $result_bets = $stmt_fetch_bets->get_result();
                $bets_data = $result_bets->fetch_assoc();
                $stmt_fetch_bets->close();

                // Store user data and bets data in session
            
                // If user has data in bets table, add it to session
                if ($bets_data) {
                    $_SESSION['bets'] = $bets_data; // Stores all bets table columns in session
                }

            $response = [
                'status' => 'success',
                'message' => 'Registration successful!',
                'redirect' => '/dashboard.php'
            ];
        } else {
            $response = [
                'status' => 'error',
                'message' => 'Error registering user: ' . htmlspecialchars($stmt_insert->error)
            ];
        }
        $stmt_insert->close();
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
