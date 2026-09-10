# PowerShell Script to package the NexusHive project for deployment
$ErrorActionPreference = "Stop"

$workspaceRoot = $PSScriptRoot
if (-not $workspaceRoot) {
    $workspaceRoot = "c:\Users\Abhishekh\nexushivesolutionss"
}

$zipPath = Join-Path $workspaceRoot "deployment.zip"
$tempDirName = "deploy_temp"
$tempDirPath = Join-Path $workspaceRoot $tempDirName

# Clean up any existing temp folder or zip file from previous runs
if (Test-Path $tempDirPath) {
    Write-Host "Cleaning up existing temp directory..."
    Remove-Item -Recurse -Force $tempDirPath
}
if (Test-Path $zipPath) {
    Write-Host "Removing existing deployment.zip..."
    Remove-Item -Force $zipPath
}

Write-Host "Creating temporary directory: $tempDirName..."
New-Item -ItemType Directory -Path $tempDirPath | Out-Null

# List of items to copy to the deployment folder
$itemsToCopy = @(
    "index.html",
    "about.html",
    "services.html",
    "resources.html",
    "admin.html",
    "card.html",
    "NEXUS.pdf",
    "server.js",
    "package.json",
    "package-lock.json",
    "vercel.json",
    ".htaccess",
    "README.md",
    "India_Compliance_Calendar_NexusHive.pptx",
    "NexusHive_Startup_Guide.pptx",
    "css",
    "js",
    "data",
    "img",
    "api",
    "php",
    "whatwedocards"
)

Write-Host "Copying files to temporary directory..."
foreach ($item in $itemsToCopy) {
    $srcPath = Join-Path $workspaceRoot $item
    if (Test-Path $srcPath) {
        $destPath = Join-Path $tempDirPath $item
        Write-Host "Copying $item..."
        Copy-Item -Path $srcPath -Destination $destPath -Recurse -Force
    } else {
        Write-Warning "Item not found: $item"
    }
}

Write-Host "Compressing archive to deployment.zip..."
# Zip everything inside the temp directory
Compress-Archive -Path "$tempDirPath\*" -DestinationPath $zipPath -Force

Write-Host "Cleaning up temporary directory..."
Remove-Item -Recurse -Force $tempDirPath

Write-Host "Successfully created deployment.zip at: $zipPath"
