# Download Firebase SDK files for Chrome Extension (Windows PowerShell)
# Right-click this file and select "Run with PowerShell"

$firebaseFiles = @(
    "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js",
    "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js",
    "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js",
    "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions-compat.js"
)

Write-Host "🚀 Downloading Firebase SDK files..." -ForegroundColor Green

foreach ($url in $firebaseFiles) {
    $filename = Split-Path $url -Leaf
    Write-Host "Downloading: $filename" -ForegroundColor Yellow
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $filename
        Write-Host "✅ Downloaded: $filename" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to download: $filename" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "🎉 Download complete!" -ForegroundColor Green
Write-Host "📁 Firebase files are now ready for your Chrome extension" -ForegroundColor Cyan
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
