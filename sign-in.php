<?php
session_start();
require 'db.php';

// If already logged in, redirect to dashboard (or any page you choose)
if (isset($_SESSION['user_id'])) {
    header("Location: poker-roulette.php");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Retrieve the input values; the "login" field can be email or username
    $login = trim($_POST['login']);
    $password = trim($_POST['password']);
    
    // Prepare the query to fetch user record matching either username or email
    $stmt = $conn->prepare("SELECT id, username,first_name,last_name, points, email, password FROM user WHERE username = ? OR email = ?");
    $stmt->bind_param("ss", $login, $login);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
      if ($user['status'] == 'inactive') {
         $error = "Acount is not Active";
      }
        if (password_verify($password, $user['password'])) {
            $stmt = $conn->prepare("SELECT SUM(win_value) AS total_win FROM game_results WHERE user_id = ?");
            $stmt->bind_param("i", $user['id']);
            $stmt->execute();
            $stmt->bind_result($winningPoints);
            $stmt->fetch();
            $stmt->close();
        
            // Ensure $winningPoints is at least 0 if null
            $winningPoints = $winningPoints ?? 0;
            // Valid credentials – set session variables and redirect
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['fname'] = $user['first_name'];
            $_SESSION['lname'] = $user['last_name'];
            $_SESSION['points'] = $user['points'];
            $_SESSION['winningPoints'] = $winningPoints;
            header("Location: poker-roulette.php");
            exit();
        } else {
            $error = "Invalid username/email or password.";
        }
    } else {
        $error = "Invalid username/email or password.";
    }
    $stmt->close();
}
?>
   <!-- meta tags and other links -->
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Casino - Online Casino Platform</title>
    <link rel="icon" type="image/png" href="assets/images/favicon.png" sizes="16x16">
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
    <body data-bs-spy="scroll" data-bs-offset="170" data-bs-target=".privacy-policy-sidebar-menu">

        <div class="overlay"></div>
        <div class="preloader">
            <div class="scene" id="scene">
                <input type="checkbox" id="andicator" />
                <div class="cube">
                    <div class="cube__face cube__face--front"><i></i></div>
                    <div class="cube__face cube__face--back"><i></i><i></i></div>
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


    <!-- inner hero section start -->

<!-- inner hero section end -->


    <!-- Account Section Starts Here -->
    <section class="account-section overflow-hidden" style="height:80vh;background: url(assets-normal/img/wmremove-transformed.jpeg) center center no-repeat; background-size: cover;">
        <div class="container">
            <div class="account__main__wrapper">
                <div class="account__form__wrapper">
                    <div class="logo"><a href="poker-roulette.php"><img src="assets/images/logo.png" alt="logo"></a></div>
                    <form class="account__form form row g-4" action="sign-in.php" method="POST">
        <?php if(isset($error)) { echo '<p style="color:red;">' . $error . '</p>'; } ?>
        <div class="col-12">
            <div class="form-group">
                <div class="input-pre-icon"><i class="las la-user"></i></div>
                <input id="username" type="text" name="login" class="form--control form-control style--two" placeholder="Email or Username" required>
            </div>
        </div>
        <div class="col-12">
            <div class="form-group">
                <div class="input-pre-icon"><i class="las la-lock"></i></div>
                <input id="pass" type="password" name="password" class="form--control form-control style--two" placeholder="Password" required>
            </div>
        </div>
        <div class="col-12">
            <div class="form-group">
                <button class="cmn--btn active w-100 btn--round" type="submit">Sign In</button>
            </div>
        </div>
        <div class="d-flex flex-wrap flex-sm-nowrap justify-content-between mt-5">
            <div class="form--check d-flex align-items-center">
                <input id="check1" type="checkbox" name="remember" checked>
                <label for="check1">Remember me</label>
            </div>
            <a href="#0" class="forgot-pass d-block text--base">Forgot Password ?</a>
        </div>
    </form>

    <!-- Optional: Logout button (shown when a user is logged in) -->
    <?php
    if(isset($_SESSION['user_id'])) {
        echo '<a href="logout.php" class="cmn--btn active w-100 btn--round" style="margin-top:20px;">Logout</a>';
    }
    ?>
                </div>
                <div class="account__content__wrapper" >
                    <div class="content text-center text-white">
                      
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- Account Section Ends Here -->


    <!-- Footer Section Starts Here -->

<!-- Footer Section Ends Here -->
    

<!-- jQuery library -->
<script src="assets/js/lib/jquery-3.6.0.min.js"></script>
<!-- bootstrap 5 js -->
<script src="assets/js/lib/bootstrap.min.js"></script>

<!-- Pluglin Link -->
<script src="assets/js/lib/slick.min.js"></script>

<!-- main js -->
<script src="assets/js/main.js"></script>  
</body>
</html>