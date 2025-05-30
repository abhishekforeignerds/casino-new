<?php
session_start();
require 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve and trim form inputs
    $first_name = trim($_POST['fname']);
    $last_name = trim($_POST['lname']);
    $country = trim($_POST['country']);
    $phone = trim($_POST['phone']);
    $email = trim($_POST['email']);
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);
    $confirm_password = trim($_POST['confirm_password']);

    // Validate required fields
    if (empty($first_name) || empty($last_name) || empty($country) || empty($phone) || empty($email) || empty($username) || empty($password) || empty($confirm_password)) {
        echo "All fields are required!";
        exit;
    }

    // Check if passwords match
    if ($password !== $confirm_password) {
        echo "Passwords do not match!";
        exit;
    }

    // Prepare an array to collect errors
    $errors = [];

    // Check if email exists
    $stmt = $conn->prepare("SELECT id FROM user WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        $errors['email'] = "Email is already taken.";
    }
    $stmt->close();

    // Check if username exists
    $stmt = $conn->prepare("SELECT id FROM user WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        $errors['username'] = "Username is already taken.";
    }
    $stmt->close();

    // Check if phone number exists
    $stmt = $conn->prepare("SELECT id FROM user WHERE phone = ?");
    $stmt->bind_param("s", $phone);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        $errors['phone'] = "Phone number is already taken.";
    }
    $stmt->close();

    // If there are any errors, you can send them back to the form
    if (!empty($errors)) {
        // For simplicity, we're just echoing the errors.
        // In a production scenario, you might store these in a session or return them as JSON.
        foreach ($errors as $key => $error) {
            echo "<div class='error' id='{$key}Error'>{$error}</div>";
        }
        exit;
    }

    // If no errors, hash the password and insert the new user
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $conn->prepare("INSERT INTO user (first_name, last_name, country, phone, email, username, password) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssss", $first_name, $last_name, $country, $phone, $email, $username, $hashed_password);

    if ($stmt->execute()) {
        // Auto-login: Set session variables and redirect
        $_SESSION['user_id'] = $stmt->insert_id;
       

        $_SESSION['fname'] = $user['first_name'];
        header("Location: poker-roulette.php");
        exit();
    } else {
        echo "Error: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
}
?>



 <!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Casino - Online Casino Platform</title>
        <link rel="icon" type="image/png" href="assets/images/favicon.png"
            sizes="16x16">
        <!-- bootstrap 5  -->
        <link rel="stylesheet" href="assets/css/lib/bootstrap.min.css">
        <!-- Icon Link  -->
        <link rel="stylesheet" href="assets/css/all.min.css">
        <link rel="stylesheet" href="assets/css/line-awesome.min.css">
        <link rel="stylesheet" href="assets/css/lib/animate.css">

        <!-- Plugin Link -->
        <link rel="stylesheet" href="assets/css/lib/slick.css">

        <!-- Main css -->
        <link rel="stylesheet" href="assets/css/main.css">
    </head>
    <body data-bs-spy="scroll" data-bs-offset="170"
        data-bs-target=".privacy-policy-sidebar-menu">

        <div class="overlay"></div>
        <div class="preloader">
            <div class="scene" id="scene">
                <input type="checkbox" id="andicator" />
                <div class="cube">
                    <div class="cube__face cube__face--front"><i></i></div>
                    <div
                        class="cube__face cube__face--back"><i></i><i></i></div>
                    <div class="cube__face cube__face--right">
                        <i></i> <i></i> <i></i> <i></i> <i></i>
                    </div>
                    <div class="cube__face cube__face--left">
                        <i></i> <i></i> <i></i> <i></i> <i></i> <i></i>
                    </div>
                    <div class="cube__face cube__face--top">
                        <i></i> <i></i> <i></i>
                    </div>
                    <div class="cube__face cube__face--bottom">
                        <i></i> <i></i> <i></i> <i></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="header">
            <div class="container">
                <div class="header-bottom">
                    <div class="header-bottom-area align-items-center">
                        <div class="logo"><a href="poker-roulette.php"><img
                                    src="assets/images/logo.png"
                                    alt="logo"></a></div>
                        <ul class="menu">
                            <li>
                                <a href="poker-roulette.php">Home</a>
                            </li>
                            <li>
                                <a href="about.php">About</a>
                            </li>
                            <li>
                                <a href="games.php">Games <span
                                        class="badge badge--sm badge--base text-dark">NEW</span></a>
                            </li>
                            <li>
                                <a href="faq.php">Faq</a>
                            </li>
                            <li>
                                <a href="#0">Pages</a>
                                <ul class="sub-menu">
                                    <li>
                                        <a href="dashboard.php">User
                                            Dashboard</a>
                                    </li>
                                    <li>
                                        <a href="game-details.php">Game
                                            Details</a>
                                    </li>
                                    <li>
                                        <a href="policy.php">Privacy Policy</a>
                                    </li>
                                    <li>
                                        <a href="terms-conditions.php">Terms &
                                            Conditions</a>
                                    </li>
                                    <li>
                                        <a href="sign-in.php">Sign In</a>
                                    </li>
                                    <li>
                                        <a href="sign-up.php">Sign Up</a>
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <a href="#0">Blog</a>
                                <ul class="sub-menu">
                                    <li><a href="blog.php">Blog</a></li>
                                    <li><a href="blog-details.php">Blog
                                            Details</a></li>
                                </ul>
                            </li>
                            <li>
                                <a href="contact.php">Contact</a>
                            </li>
                            <button
                                class="btn-close btn-close-white d-lg-none"></button>
                        </ul>
                        <div
                            class="header-trigger-wrapper d-flex d-lg-none align-items-center">
                            <div class="header-trigger me-4">
                                <span></span>
                            </div>
                            <a href="sign-in.php"
                                class="cmn--btn active btn--md d-none d-sm-block">Sign
                                In</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- inner hero section start -->
        <section class="inner-banner bg_img"
            style="background: url('assets/images/inner-banner/bg2.jpg') top;">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-lg-7 col-xl-6 text-center">
                        <h2 class="title text-white">Sign Up</h2>
                        <ul
                            class="breadcrumbs d-flex flex-wrap align-items-center justify-content-center">
                            <li><a href="poker-roulette.php">Home</a></li>
                            <li>Sign Up</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
        <!-- inner hero section end -->

        <!-- Account Section Starts Here -->
        <section class="account-section overflow-hidden bg_img"
            style="background:url(assets/images/account/bg.jpg)">
            <div class="container">
                <div class="account__main__wrapper">
                    <div class="account__form__wrapper sign-up">
                        <div class="logo"><a href="poker-roulette.php"><img
                                    src="assets/images/logo.png"
                                    alt="logo"></a></div>
                                    <form class="account__form form row g-4" id="registerForm" action="sign-up.php" method="POST">
    <div class="col-xl-6 col-md-6">
        <div class="form-group">
            <div class="input-pre-icon"><i class="las la-user"></i></div>
            <input id="fname" type="text" name="fname" class="form--control form-control style--two" placeholder="First Name" required>
        </div>
    </div>
    <div class="col-xl-6 col-md-6">
        <div class="form-group">
            <div class="input-pre-icon"><i class="las la-user"></i></div>
            <input id="lname" type="text" name="lname" class="form--control form-control style--two" placeholder="Last Name" required>
        </div>
    </div>
    <div class="col-xl-6 col-md-6">
        <div class="form-group">
            <div class="input-pre-icon"><i class="las la-globe"></i></div>
            <select name="country" class="form-select form--control style--two" required>
                <option value="">Select Country</option>
                <option value="India">India</option>
                <option value="Pakistan">Pakistan</option>
            </select>
        </div>
    </div>
    <div class="col-xl-6 col-md-6">
        <div class="input-group">
            <span class="input-group-text text--base style--two">+91</span>
            <input id="phone" type="text" name="phone" class="form--control form-control style--two" placeholder="Phone Number" required>
           
        </div>
        <div id="phoneError" class="error-message" style="color: red;"></div>
    </div>
    <div class="col-xl-6 col-md-6">
        <div class="form-group">
            <div class="input-pre-icon"><i class="las la-envelope"></i></div>
            <input id="email" type="email" name="email" class="form--control form-control style--two" placeholder="Email" required>
            <div id="emailError" class="error-message" style="color: red;"></div>
        </div>
    </div>
    <div class="col-xl-6 col-md-6">
        <div class="form-group">
            <div class="input-pre-icon"><i class="las la-user"></i></div>
            <input id="username" type="text" name="username" class="form--control form-control style--two" placeholder="Username" required>
            <div id="usernameError" class="error-message" style="color: red;"></div>
        </div>
    </div>
    <div class="col-xl-6 col-md-6">
        <div class="form-group">
            <div class="input-pre-icon"><i class="las la-lock"></i></div>
            <input id="pass" type="password" name="password" class="form--control form-control style--two" placeholder="Password" required>
        </div>
    </div>
    <div class="col-xl-6 col-md-6">
        <div class="form-group">
            <div class="input-pre-icon"><i class="las la-lock"></i></div>
            <input id="confirm_pass" type="password" name="confirm_password" class="form--control form-control style--two" placeholder="Confirm Password" required>
        </div>
    </div>
    <div class="col-lg-12">
        <div class="form-group">
        <button id="submitBtn" class="cmn--btn active w-100 btn--round" type="submit">Sign Up</button>
        </div>
    </div>
</form>


                    </div>
                    <div class="account__content__wrapper">
                        <div class="content text-center text-white">
                            <h3 class="title text--base mb-4">Welcome to
                                Casinio</h3>
                            <p class>Sign in your Account. Atque, fuga sapiente,
                                doloribus qui enim tempora?</p>
                            <p class="account-switch mt-4">Already have an
                                Account ? <a class="text--base ms-2"
                                    href="sign-in.php">Sign In</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- Account Section Ends Here -->

        <!-- Footer Section Starts Here -->
        <footer class="footer-section bg_img"
            style="background: url(assets/images/footer/bg.jpg) center;">
            <div class="footer-top">
                <div class="container">
                    <div
                        class="footer-wrapper d-flex flex-wrap align-items-center justify-content-md-between justify-content-center">
                        <div class="logo mb-3 mb-md-0"><a href="poker-roulette.php"><img
                                    src="assets/images/logo.png"
                                    alt="logo"></a></div>
                        <ul
                            class="footer-links d-flex flex-wrap justify-content-center">
                            <li><a href="games.php">Games</a></li>
                            <li><a href="terms-conditions.php">Terms &
                                    Conditions</a></li>
                            <li><a href="policy.php">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <div class="container">
                    <div
                        class="footer-wrapper d-flex flex-wrap justify-content-center align-items-center text-center">
                        <p class="copyright text-white">Copyrights &copy; 2021
                            All Rights Reserved by <a href="#0"
                                class=" text--base ms-2">Viserlab</a></p>
                    </div>
                </div>
            </div>
            <div class="shapes">
                <img src="assets/images/footer/shape.png" alt="footer"
                    class="shape1">
            </div>
        </footer>
        <!-- Footer Section Ends Here -->

        <!-- jQuery library -->
       
        <!-- bootstrap 5 js -->
        <script src="assets/js/lib/bootstrap.min.js"></script>

        <!-- Pluglin Link -->
        <script src="assets/js/lib/slick.min.js"></script>

        <!-- main js -->
        <script src="assets/js/main.js"></script>
        <script>
function checkDuplicate(field, value) {
    fetch('check_duplicate.php?field=' + field + '&value=' + encodeURIComponent(value))
        .then(response => response.json())
        .then(data => {
            const errorDiv = document.getElementById(field + 'Error');
            if (data.exists) {
                errorDiv.textContent = field.charAt(0).toUpperCase() + field.slice(1) + " is already taken.";
            } else {
                errorDiv.textContent = "";
            }
            checkSubmitButton();
        })
        .catch(error => {
            console.error('Error:', error);
            checkSubmitButton();
        });
}

function checkSubmitButton() {
    // Retrieve the text content from all error containers
    const emailError = document.getElementById("emailError").textContent;
    const usernameError = document.getElementById("usernameError").textContent;
    const phoneError = document.getElementById("phoneError").textContent;
    const submitButton = document.getElementById("submitBtn");

    // Disable the button if any error exists
    if (emailError || usernameError || phoneError) {
        submitButton.disabled = true;
    } else {
        submitButton.disabled = false;
    }
}

// Attach event listeners to call checkDuplicate() on blur for each field
document.getElementById("email").addEventListener("blur", function(){
    checkDuplicate("email", this.value);
});

document.getElementById("username").addEventListener("blur", function(){
    checkDuplicate("username", this.value);
});

document.getElementById("phone").addEventListener("blur", function(){
    checkDuplicate("phone", this.value);
});
</script>


    </body>
</html>