# Push .env.local variables to Vercel (production, preview, development)
# Usage: .\scripts\push-env-to-vercel.ps1

Set-Location $PSScriptRoot\..

if (-not (Test-Path ".env.local")) {
  Write-Error ".env.local not found"
  exit 1
}

Get-Content ".env.local" | ForEach-Object {
  $line = $_.Trim()
  if ($line -eq "" -or $line.StartsWith("#")) { return }

  $eq = $line.IndexOf("=")
  if ($eq -lt 1) { return }

  $name = $line.Substring(0, $eq).Trim()
  $value = $line.Substring($eq + 1).Trim()

  if ($value.StartsWith('"') -and $value.EndsWith('"')) {
    $value = $value.Substring(1, $value.Length - 2)
  }

  Write-Host "Adding $name ..."
  $value | vercel env add $name production preview development --force 2>&1 | Out-Null
}

Write-Host "Done. Run: vercel env ls"
