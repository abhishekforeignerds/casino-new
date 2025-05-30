 <!-- meta tags and other links -->
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
                        <h2 class="title text-white">Game Details</h2>
                        <ul
                            class="breadcrumbs d-flex flex-wrap align-items-center justify-content-center">
                            <li><a href="poker-roulette.php">Home</a></li>
                            <li>Game Details</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
        <!-- inner hero section end -->

        <section class="padding-top padding-bottom">
            <div class="container">
                <div class="row gy-5">
                    <div class="col-lg-6">
                        <div class="game-details-left">
                            <div id="coin-flip-cont">
                                <div class="coins-wrapper">
                                    <div class="front"><img
                                            src="assets/images/game/head.png"
                                            alt="game"></div>
                                    <div class="back"><img
                                            src="assets/images/game/tail.png"
                                            alt="game"></div>
                                </div>
                            </div>
                            <div class="cd-ft"></div>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="game-details-right">
                            <form id="game" novalidate="novalidate">
                                <h3 class="mb-4 text-center">Current Balance :
                                    <span class="base--color"><span
                                            class="bal">100</span>
                                        USD</span></h3>
                                <div class="form-group">
                                    <div class="input-group mb-3">
                                        <input type="text" name="invest"
                                            class="form-control form--control amount-field"
                                            placeholder="Enter amount">
                                        <span
                                            class="input-group-text text-white bg--base"
                                            id="basic-addon2">USD</span>
                                    </div>
                                    <small class="form-text text-muted"><i
                                            class="fas fa-info-circle mr-2"></i>Minimum:
                                        1 USD | Maximum: 500.00 USD | <span
                                            class="text-warning">Win Amount 1
                                            %</span></small>
                                </div>
                                <div
                                    class="form-group mt-4 mt-sm-5 justify-content-center d-flex flex-wrap justify-content-between">
                                    <div
                                        class="single-select head gmimg active">
                                        <img src="assets/images/game/head.png"
                                            alt="game-image">
                                    </div>
                                    <div class="single-select tail gmimg">
                                        <img src="assets/images/game/tail.png"
                                            alt="game-image">
                                    </div>
                                </div>
                                <div class="mt-5 text-center">
                                    <button type="submit"
                                        class="cmn--btn active w-100 text-center">Play
                                        Now</button>
                                    <a data-bs-toggle="modal"
                                        data-bs-target="#exampleModalCenter"
                                        class="mt-3 btn btn-link btn--sm radius-5">Game
                                        Instruction <i
                                            class="las la-info-circle"></i></a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Game Section Starts Here -->
        <section class="game-section padding-top padding-bottom bg_img"
            style="background: url(assets/images/game/bg3.jpg);">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-md-10 col-lg-8 col-xl-6">
                        <div class="section-header text-center">
                            <h2 class="section-header__title">You may Also
                                Like</h2>
                            <p>Id temporibus blanditiis culpa laborum debitis ex
                                et libero corrupti, recusandae ab voluptate?
                                Magni, impedit.</p>
                        </div>
                    </div>
                </div>
                <div class="row gy-4 justify-content-center">
                    <div class="col-lg-4 col-xl-3 col-md-6 col-sm-6">
                        <div class="game-item">
                            <div class="game-inner">
                                <div class="game-item__thumb">
                                    <img src="assets/images/game/item2.png"
                                        alt="game">
                                </div>
                                <div class="game-item__content">
                                    <h4 class="title">Roulette</h4>
                                    <p class="invest-info">Invest Limit</p>
                                    <p class="invest-amount">₹10.49 - ₹1,000</p>
                                    <a href="#0"
                                        class="cmn--btn active btn--md radius-0">Play
                                        Now</a>
                                </div>
                            </div>
                            <div class="ball"></div>
                        </div>
                    </div>
                    <div class="col-lg-4 col-xl-3 col-md-6 col-sm-6">
                        <div class="game-item">
                            <div class="game-inner">
                                <div class="game-item__thumb">
                                    <img src="assets/images/game/item1.png"
                                        alt="game">
                                </div>
                                <div class="game-item__content">
                                    <h4 class="title">Zero To Ninty</h4>
                                    <p class="invest-info">Invest Limit</p>
                                    <p class="invest-amount">₹10.49 - ₹1,000</p>
                                    <a href="#0"
                                        class="cmn--btn active btn--md radius-0">Play
                                        Now</a>
                                </div>
                            </div>
                            <div class="ball"></div>
                        </div>
                    </div>
                    <div class="col-lg-4 col-xl-3 col-md-6 col-sm-6">
                        <div class="game-item">
                            <div class="game-inner">
                                <div class="game-item__thumb">
                                    <img src="assets/images/game/item3.png"
                                        alt="game">
                                </div>
                                <div class="game-item__content">
                                    <h4 class="title">Number Buy</h4>
                                    <p class="invest-info">Invest Limit</p>
                                    <p class="invest-amount">₹10.49 - ₹1,000</p>
                                    <a href="#0"
                                        class="cmn--btn active btn--md radius-0">Play
                                        Now</a>
                                </div>
                            </div>
                            <div class="ball"></div>
                        </div>
                    </div>
                    <div class="col-lg-4 col-xl-3 col-md-6 col-sm-6">
                        <div class="game-item">
                            <div class="game-inner">
                                <div class="game-item__thumb">
                                    <img src="assets/images/game/item4.png"
                                        alt="game">
                                </div>
                                <div class="game-item__content">
                                    <h4 class="title">Roulette</h4>
                                    <p class="invest-info">Invest Limit</p>
                                    <p class="invest-amount">₹10.49 - ₹1,000</p>
                                    <a href="#0"
                                        class="cmn--btn active btn--md radius-0">Play
                                        Now</a>
                                </div>
                            </div>
                            <div class="ball"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- Game Section Ends Here -->

        <div class=" modal custom--modal fade show" id="exampleModalCenter"
            tabindex="-1" role="dialog"
            aria-labelledby="exampleModalCenterTitle" aria-modal="true">
            <div class="modal-dialog modal-dialog-centered modal-lg"
                role="document">
                <div class="modal-content section-bg border-0">
                    <div class="modal-header modal--header bg--base">
                        <h4 class="modal-title text-dark"
                            id="exampleModalLongTitle">Game Rules</h4>
                    </div>
                    <div class="modal-body modal--body">
                        <h3 class="title mb-2">Before Game Start: </h3>
                        <p>Officia quod velit eaque tempore assumenda,
                            blanditiis corporis praesentium voluptate provident.
                            Sunt enim obcaecati odio doloremque molestiae
                            aspernatur fuga eveniet molestias autem. Lorem ipsum
                            dolor sit amet consectetur adipisicing elit.
                            Provident ipsam sapiente aut est nostrum, labore
                            quibusdam aliquid repellendus dignissimos
                            consequuntur aspernatur voluptates consectetur
                            aliquam quam nesciunt impedit? Vitae blanditiis vero
                            officiis quidem ipsum esse! Praesentium, laudantium
                            numquam! Corporis sed adipisci, incidunt aut,
                            accusamus sit, nihil tenetur ipsam quaerat optio
                            nisi?</p>
                    </div>
                    <div class="modal-footer modal--footer">
                        <button type="button" class="btn btn--danger btn--md"
                            data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>

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
    </body>
</html>