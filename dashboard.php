<?php
session_start();

// Restrict access if the user is not logged in
if (!isset($_SESSION['user'])) {
    header("Location: index.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .dashboard-container {
            display: flex;
            margin-top: 2rem;
        }

        /* Vertical Tabs Styling */
        .vertical-tabs {
            display: flex;
            flex-direction: column;
            width: 200px;
            border-right: 2px solid #ddd;
        }

        .tab {
            padding: 15px 20px;
            position: relative;
            cursor: pointer;
            font-weight: bold;
            color: #333;
            transition: all 0.3s ease;
        }

        .tab:hover {
            background-color: #f8f9fa;
        }

        .tab.active {
            background-color: #007bff;
            color: #fff;
        }

        .tab.active::before {
            content: '';
            position: absolute;
            top: 50%;
            right: -10px;
            transform: translateY(-50%);
            border: 10px solid transparent;
            border-left-color: #007bff;
        }

        /* Tab Content Styling */
        .tab-content {
            flex-grow: 1;
            padding: 20px;
            display: none;
        }

        .tab-content.active {
            display: block;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2 class="text-center mt-3">Welcome, <?php echo htmlspecialchars($_SESSION['user']['username']); ?>!</h2>
        <a href="logout.php" class="btn btn-danger mt-3">Logout</a>

        <div class="dashboard-container">
            <!-- Vertical Tabs -->
            <div class="vertical-tabs">
                <div class="tab active" data-target="#tab1">Dashboard</div>
                <div class="tab" data-target="#tab2">Profile</div>
                <div class="tab" data-target="#tab3">Settings</div>
            </div>

            <!-- Tab Content -->
            <div class="tab-content active" id="tab1">
                <h3>Dashboard Content</h3>
                <p>This is the content for the Dashboard tab. Customize this section with your desired information.</p>
        
                <div class="row">
                    
                        <div class="col-4 mb-3">
                            <div class="card shadow border-0">
                                <div class="card-body">
                                <a href="/roulette.php" taget="_blank">
                                    <h5 class="card-title">Box 1</h5>
                                    <p class="card-text">This is the first box content.</p>
                                </a>
                                </div>
                            </div>
                        </div>
                   

                    <div class="col-4 mb-3">
                        <div class="card shadow border-0">
                            <div class="card-body">
                                <h5 class="card-title">Box 2</h5>
                                <p class="card-text">This is the second box content.</p>
                            </div>
                        </div>
                    </div>

                    <div class="col-4">
                        <div class="card shadow border-0">
                            <div class="card-body">
                                <h5 class="card-title">Box 3</h5>
                                <p class="card-text">This is the third box content.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-4 mb-3">
                        <div class="card shadow border-0">
                            <div class="card-body">
                                <h5 class="card-title">Box 1</h5>
                                <p class="card-text">This is the first box content.</p>
                            </div>
                        </div>
                    </div>

                    <div class="col-4 mb-3">
                        <div class="card shadow border-0">
                            <div class="card-body">
                                <h5 class="card-title">Box 2</h5>
                                <p class="card-text">This is the second box content.</p>
                            </div>
                        </div>
                    </div>

                    <div class="col-4">
                        <div class="card shadow border-0">
                            <div class="card-body">
                                <h5 class="card-title">Box 3</h5>
                                <p class="card-text">This is the third box content.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-4 mb-3">
                        <div class="card shadow border-0">
                            <div class="card-body">
                                <h5 class="card-title">Box 1</h5>
                                <p class="card-text">This is the first box content.</p>
                            </div>
                        </div>
                    </div>

                    <div class="col-4 mb-3">
                        <div class="card shadow border-0">
                            <div class="card-body">
                                <h5 class="card-title">Box 2</h5>
                                <p class="card-text">This is the second box content.</p>
                            </div>
                        </div>
                    </div>

                    <div class="col-4">
                        <div class="card shadow border-0">
                            <div class="card-body">
                                <h5 class="card-title">Box 3</h5>
                                <p class="card-text">This is the third box content.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tab-content" id="tab2">
            <div class="row">
                    <div class="col-4 mb-3">
                        <div class="card shadow border-0">
                            <div class="card-body">
                                <h5 class="card-title">Box 1</h5>
                                <p class="card-text">This is the first box content.</p>
                            </div>
                        </div>
                    </div>

                    <div class="col-4 mb-3">
                        <div class="card shadow border-0">
                            <div class="card-body">
                                <h5 class="card-title">Box 2</h5>
                                <p class="card-text">This is the second box content.</p>
                            </div>
                        </div>
                    </div>

                    <div class="col-4">
                        <div class="card shadow border-0">
                            <div class="card-body">
                                <h5 class="card-title">Box 3</h5>
                                <p class="card-text">This is the third box content.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-4 mb-3">
                        <div class="card shadow border-0">
                            <div class="card-body">
                                <h5 class="card-title">Box 1</h5>
                                <p class="card-text">This is the first box content.</p>
                            </div>
                        </div>
                    </div>

                    <div class="col-4 mb-3">
                        <div class="card shadow border-0">
                            <div class="card-body">
                                <h5 class="card-title">Box 2</h5>
                                <p class="card-text">This is the second box content.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div class="tab-content" id="tab3">
            <div class="row">as
                    <div class="col-4 mb-3">
                        <div class="card shadow border-0">
                            <div class="card-body">
                                <h5 class="card-title">Box 1</h5>
                                <p class="card-text">This is the first box content.</p>
                            </div>
                        </div>
                    </div>

                    <div class="col-4 mb-3">
                        <div class="card shadow border-0">
                            <div class="card-body">
                                <h5 class="card-title">Box 2</h5>
                                <p class="card-text">This is the second box content.</p>
                            </div>
                        </div>
                    </div>

                    
                </div>
            </div>
        </div>
        </div>
    </div>

    <script>
        // Tab switching logic
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs and contents
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(tc => tc.classList.remove('active'));

                // Add active class to the clicked tab and its content
                tab.classList.add('active');
                const target = document.querySelector(tab.dataset.target);
                target.classList.add('active');
            });
        });
    </script>
</body>
</html>
