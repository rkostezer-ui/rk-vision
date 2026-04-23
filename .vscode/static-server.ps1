param(
    [int]$Port = 8080,
    [string]$Root = (Get-Location).Path
)

$ErrorActionPreference = "Stop"

$rootPath = [System.IO.Path]::GetFullPath($Root)
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$Port/")

try {
    $listener.Start()
    Write-Host "Static Server läuft auf http://localhost:$Port/ (Root: $rootPath)"

    $mime = @{
        ".html" = "text/html; charset=utf-8"
        ".css"  = "text/css; charset=utf-8"
        ".js"   = "application/javascript; charset=utf-8"
        ".json" = "application/json; charset=utf-8"
        ".xml"  = "application/xml; charset=utf-8"
        ".svg"  = "image/svg+xml"
        ".png"  = "image/png"
        ".jpg"  = "image/jpeg"
        ".jpeg" = "image/jpeg"
        ".gif"  = "image/gif"
        ".webp" = "image/webp"
        ".ico"  = "image/x-icon"
        ".woff" = "font/woff"
        ".woff2"= "font/woff2"
        ".ttf"  = "font/ttf"
    }

    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
        }
        catch {
            break
        }

        $relative = [System.Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart('/'))
        if ([string]::IsNullOrWhiteSpace($relative)) { $relative = "index.html" }

        $targetPath = [System.IO.Path]::GetFullPath((Join-Path $rootPath $relative))

        if (-not $targetPath.StartsWith($rootPath, [System.StringComparison]::OrdinalIgnoreCase)) {
            $context.Response.StatusCode = 403
            $bytes = [System.Text.Encoding]::UTF8.GetBytes("403 Forbidden")
            $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
            $context.Response.Close()
            continue
        }

        if (Test-Path $targetPath -PathType Container) {
            $targetPath = Join-Path $targetPath "index.html"
        }

        if (Test-Path $targetPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($targetPath).ToLowerInvariant()
            $contentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
            $data = [System.IO.File]::ReadAllBytes($targetPath)

            $context.Response.StatusCode = 200
            $context.Response.ContentType = $contentType
            $context.Response.ContentLength64 = $data.Length
            $context.Response.OutputStream.Write($data, 0, $data.Length)
            $context.Response.Close()
        }
        else {
            $context.Response.StatusCode = 404
            $bytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
            $context.Response.Close()
        }
    }
}
finally {
    if ($listener.IsListening) { $listener.Stop() }
    $listener.Close()
}
