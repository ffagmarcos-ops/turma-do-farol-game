$ErrorActionPreference = "Stop"
$root = Join-Path $PSScriptRoot "jogo"
$port = 8765
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:$port/")
$listener.Start()
Write-Host "Turma do Farol rodando em http://127.0.0.1:$port/  (feche esta janela para sair)"
Start-Process "http://127.0.0.1:$port/"
$types = @{".html"="text/html; charset=utf-8";".js"="text/javascript";".png"="image/png";".jpg"="image/jpeg";".ogg"="audio/ogg";".mp3"="audio/mpeg";".json"="application/json";".css"="text/css";".svg"="image/svg+xml"}
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart("/")
  if ($path -eq "") { $path = "index.html" }
  $file = Join-Path $root $path
  try {
    if (Test-Path $file -PathType Leaf) {
      $ext = [IO.Path]::GetExtension($file).ToLower()
      $ctx.Response.ContentType = $(if ($types[$ext]) { $types[$ext] } else { "application/octet-stream" })
      $bytes = [IO.File]::ReadAllBytes($file)
      $ctx.Response.ContentLength64 = $bytes.Length
      if ($ctx.Request.HttpMethod -ne "HEAD") { $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length) }
    } else { $ctx.Response.StatusCode = 404 }
  } catch {}
  $ctx.Response.Close()
}
