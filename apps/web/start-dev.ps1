$log = "C:\Users\Ashif\university\.freebuff\preview-0fdde197-779a-4f88-8ba2-4f6c2dbb5d1e.log"
$logErr = "$log.err"
$p = Start-Process -FilePath "npm.cmd" -ArgumentList "run","dev" -WorkingDirectory "C:\Users\Ashif\university\apps\web" -RedirectStandardOutput $log -RedirectStandardError $logErr -WindowStyle Hidden -PassThru
Write-Output $p.Id
