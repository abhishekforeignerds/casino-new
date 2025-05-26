<?php
// This will work only if PHP has permission to run shell commands
exec("taskkill /F /IM chrome.exe");
echo "Kiosk closed";
?>
