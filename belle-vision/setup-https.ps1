param([string[]]$AdditionalHosts = @())
$ErrorActionPreference = 'Stop'
$certDir = Join-Path $PSScriptRoot '.certs'
New-Item -ItemType Directory -Force -Path $certDir | Out-Null
$mkcert = Join-Path $certDir 'mkcert.exe'
if (!(Test-Path -LiteralPath $mkcert)) {
    Invoke-WebRequest -UseBasicParsing -Uri 'https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-windows-amd64.exe' -OutFile $mkcert
}
$previousCAROOT = $env:CAROOT
try {
    $env:CAROOT = Join-Path $certDir 'ca'
    & $mkcert -install
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo instalar el certificado local de confianza.' }
    $addresses = @(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '169.254.*' -and $_.IPAddress -ne '127.0.0.1' } | Select-Object -ExpandProperty IPAddress)
    $hostsForCertificate = @('localhost', '127.0.0.1', '::1') + $addresses + $AdditionalHosts | Select-Object -Unique
    & $mkcert -cert-file (Join-Path $certDir 'localhost.pem') -key-file (Join-Path $certDir 'localhost-key.pem') @hostsForCertificate
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo generar el certificado HTTPS.' }
    Copy-Item -LiteralPath (Join-Path $env:CAROOT 'rootCA.pem') -Destination (Join-Path $certDir 'belle-local-ca.crt')
    Write-Host 'HTTPS listo. En Frontend/belle-app ejecuta: npm run dev:https'
    Write-Host 'Computadora: https://localhost:5174/vision'
    foreach ($address in $addresses) { Write-Host "Red local: https://${address}:5174/vision" }
    Write-Host 'Para el celular instala y confia en .certs/belle-local-ca.crt. Nunca compartas archivos *key.pem.'
} finally {
    $env:CAROOT = $previousCAROOT
}
