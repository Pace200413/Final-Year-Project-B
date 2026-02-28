# Kill process using port 3000
# Usage: Run this script in PowerShell before starting dev server

Write-Host "Checking for processes using port 3000..." -ForegroundColor Yellow

try {
    $connection = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    
    if ($connection) {
        $pid = $connection | Select-Object -First 1 -ExpandProperty OwningProcess
        Write-Host "Found process $pid using port 3000" -ForegroundColor Cyan
        Write-Host "Stopping process..." -ForegroundColor Yellow
        Stop-Process -Id $pid -Force
        Write-Host "✓ Process stopped successfully" -ForegroundColor Green
    } else {
        Write-Host "✓ Port 3000 is free" -ForegroundColor Green
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "`nManual method:" -ForegroundColor Yellow
    Write-Host "1. Run: netstat -ano | findstr :3000" -ForegroundColor Cyan
    Write-Host "2. Note the PID (last column)" -ForegroundColor Cyan
    Write-Host "3. Run: taskkill /PID <PID> /F" -ForegroundColor Cyan
}

Write-Host "`nYou can now run: npm run dev" -ForegroundColor Green

