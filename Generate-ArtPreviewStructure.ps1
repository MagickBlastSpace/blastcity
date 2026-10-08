param(
    [string]$ProjectRoot = (Get-Location).Path,
    [string]$OutputRoot = ""
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($OutputRoot)) {
    $OutputRoot = Join-Path $ProjectRoot "art\tiles"
}

$ProjectRoot = (Resolve-Path $ProjectRoot).Path
New-Item -ItemType Directory -Force -Path $OutputRoot | Out-Null
$OutputRoot = (Resolve-Path $OutputRoot).Path

function Test-IsSpriteFrameRef {
    param($Value)

    if ($null -eq $Value) {
        return $false
    }

    $uuid = $null
    $expectedType = $null

    try { $uuid = [string]$Value.__uuid__ } catch {}
    try { $expectedType = [string]$Value.__expectedType__ } catch {}

    if ([string]::IsNullOrWhiteSpace($uuid)) {
        return $false
    }

    return (
        $expectedType -eq "cc.SpriteFrame" -or
        $uuid -match "@f9941$"
    )
}

function Normalize-SlotName {
    param([string]$Value)

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return ""
    }

    $result = [regex]::Replace(
        $Value,
        '([a-z0-9])([A-Z])',
        '$1_$2'
    )

    $result = [regex]::Replace(
        $result,
        '[^A-Za-z0-9]+',
        '_'
    )

    return $result.Trim('_').ToLower()
}

function Get-NodePath {
    param(
        [object[]]$Data,
        [int]$NodeIndex,
        [int]$RootNodeIndex
    )

    if ($NodeIndex -eq $RootNodeIndex) {
        return [string]$Data[$RootNodeIndex]._name
    }

    $parts = @()
    $current = $NodeIndex
    $visited = @{}

    while (
        $current -ge 0 -and
        $current -lt $Data.Count -and
        $current -ne $RootNodeIndex -and
        -not $visited.ContainsKey($current)
    ) {
        $visited[$current] = $true
        $node = $Data[$current]

        if ($node.__type__ -ne "cc.Node") {
            break
        }

        $parts = @([string]$node._name) + $parts

        if (
            $null -eq $node._parent -or
            $null -eq $node._parent.__id__
        ) {
            break
        }

        $current = [int]$node._parent.__id__
    }

    return ($parts -join "_")
}

function Add-FrameHint {
    param(
        [hashtable]$Groups,
        [System.Collections.ArrayList]$Order,
        [string]$Uuid,
        [string]$Hint,
        [int]$Priority
    )

    if ([string]::IsNullOrWhiteSpace($Uuid)) {
        return
    }

    if (-not $Groups.ContainsKey($Uuid)) {
        $Groups[$Uuid] = New-Object System.Collections.ArrayList
        [void]$Order.Add($Uuid)
    }

    if (-not [string]::IsNullOrWhiteSpace($Hint)) {
        [void]$Groups[$Uuid].Add(
            [PSCustomObject]@{
                Value = $Hint
                Priority = $Priority
            }
        )
    }
}

function Get-PrefabSlots {
    param([string]$PrefabPath)

    $data = Get-Content $PrefabPath -Raw | ConvertFrom-Json

    $rootNodeIndex = 1

    try {
        if ($null -ne $data[0].data.__id__) {
            $rootNodeIndex = [int]$data[0].data.__id__
        }
        elseif ($null -ne $data[0]._data.__id__) {
            $rootNodeIndex = [int]$data[0]._data.__id__
        }
    }
    catch {}

    $groups = @{}
    $order = New-Object System.Collections.ArrayList

    for ($i = 0; $i -lt $data.Count; $i++) {
        $item = $data[$i]

        if ($item.__type__ -eq "cc.Sprite") {
            $frame = $item._spriteFrame

            if (Test-IsSpriteFrameRef $frame) {
                $nodePath = ""

                if (
                    $null -ne $item.node -and
                    $null -ne $item.node.__id__
                ) {
                    $nodePath = Get-NodePath `
                        $data `
                        ([int]$item.node.__id__) `
                        $rootNodeIndex
                }

                Add-FrameHint `
                    -Groups $groups `
                    -Order $order `
                    -Uuid ([string]$frame.__uuid__) `
                    -Hint $nodePath `
                    -Priority 10
            }
        }

        foreach ($property in $item.PSObject.Properties) {
            $name = [string]$property.Name

            if ($name.StartsWith("_")) {
                continue
            }

            $value = $property.Value

            if (Test-IsSpriteFrameRef $value) {
                Add-FrameHint `
                    -Groups $groups `
                    -Order $order `
                    -Uuid ([string]$value.__uuid__) `
                    -Hint $name `
                    -Priority 100

                continue
            }

            if (
                $value -is [System.Array] -or
                $value -is [System.Collections.IList]
            ) {
                for ($j = 0; $j -lt $value.Count; $j++) {
                    if (Test-IsSpriteFrameRef $value[$j]) {
                        Add-FrameHint `
                            -Groups $groups `
                            -Order $order `
                            -Uuid ([string]$value[$j].__uuid__) `
                            -Hint ("{0}_{1}" -f $name, ($j + 1)) `
                            -Priority 100
                    }
                }
            }
        }
    }

    if ($order.Count -eq 0) {
        return @()
    }

    if ($order.Count -eq 1) {
        return @("main")
    }

    $usedNames = @{}
    $slots = @()

    foreach ($uuid in $order) {
        $hints = @($groups[$uuid])
        $bestHint = $null

        if ($hints.Count -gt 0) {
            $bestHint = $hints |
                Sort-Object `
                    @{ Expression = { $_.Priority }; Descending = $true }, `
                    @{ Expression = { $_.Value.Length }; Ascending = $true } |
                Select-Object -First 1
        }

        $baseName = ""

        if ($null -ne $bestHint) {
            $baseName = Normalize-SlotName ([string]$bestHint.Value)
        }

        if ([string]::IsNullOrWhiteSpace($baseName)) {
            $baseName = "slot_$($slots.Count + 1)"
        }

        if (-not $usedNames.ContainsKey($baseName)) {
            $usedNames[$baseName] = 0
        }

        $usedNames[$baseName]++

        $slotName = $baseName

        if ($usedNames[$baseName] -gt 1) {
            $slotName = "{0}_{1}" -f $baseName, $usedNames[$baseName]
        }

        $slots += $slotName
    }

    return $slots
}

function Write-ElementFolder {
    param(
        [string]$Category,
        [string]$Id,
        [string[]]$Slots,
        [string]$SourcePrefab
    )

    $folder = Join-Path $OutputRoot (Join-Path $Category $Id)
    New-Item -ItemType Directory -Force -Path $folder | Out-Null

    $readme = @(
        "ART PREVIEW",
        "============",
        "",
        "Category: $Category",
        "ID:       $Id"
    )

    if (-not [string]::IsNullOrWhiteSpace($SourcePrefab)) {
        $readme += "Prefab:   $SourcePrefab"
    }

    $readme += ""
    $readme += "PNG files accepted in this folder:"

    if ($Slots.Count -eq 0) {
        $readme += "- No SpriteFrame slots were detected."
    }
    else {
        foreach ($slot in $Slots) {
            $readme += "- $slot.png"
        }
    }

    $readme += ""
    $readme += "You do NOT have to provide every PNG."
    $readme += "If a PNG is missing, the built-in game art stays unchanged."
    $readme += "Spine animation files are not replaced by this PNG system."
    $readme += "After replacing a PNG, restart Art Preview so the file cache reloads."

    Set-Content `
        -Path (Join-Path $folder "README.txt") `
        -Value $readme `
        -Encoding UTF8
}

$commonFolder = Join-Path $OutputRoot "common"
New-Item -ItemType Directory -Force -Path $commonFolder | Out-Null

$commonReadme = @(
    "ART PREVIEW - COMMON TILES",
    "==========================",
    "",
    "Supported common tile PNG names:",
    "- blue.png",
    "- red.png",
    "- green.png",
    "- yellow.png",
    "- purple.png",
    "",
    "Keep any already existing combo-hint files/folders as they are.",
    "This generator does not delete or overwrite PNG files.",
    "After replacing a PNG, restart Art Preview so the file cache reloads."
)

Set-Content `
    -Path (Join-Path $commonFolder "README.txt") `
    -Value $commonReadme `
    -Encoding UTF8

$sources = @(
    @{
        PrefabRoot = Join-Path $ProjectRoot "assets\prefabs\spec_tiles"
        Category = "special"
    },
    @{
        PrefabRoot = Join-Path $ProjectRoot "assets\prefabs\big_spec_tiles"
        Category = "big_special"
    },
    @{
        PrefabRoot = Join-Path $ProjectRoot "assets\prefabs\statuses"
        Category = "statuses"
    }
)

$created = @()

foreach ($source in $sources) {
    if (-not (Test-Path $source.PrefabRoot)) {
        Write-Warning "Prefab folder not found: $($source.PrefabRoot)"
        continue
    }

    Get-ChildItem $source.PrefabRoot -Recurse -File -Filter "*.prefab" |
        Sort-Object FullName |
        ForEach-Object {
            $id = $_.BaseName.ToLower()
            $slots = @(Get-PrefabSlots $_.FullName)

            Write-ElementFolder `
                -Category $source.Category `
                -Id $id `
                -Slots $slots `
                -SourcePrefab $_.Name

            $created += [PSCustomObject]@{
                Category = $source.Category
                Id = $id
                Slots = ($slots -join ", ")
            }
        }
}

$baseTilesRoot = Join-Path $ProjectRoot "assets\prefabs\base_tiles"

$bonusDefs = @(
    @{
        Prefab = "Bomb.prefab"
        Ids = @("bomb")
    },
    @{
        Prefab = "Rocket.prefab"
        Ids = @("rocket_horizontal", "rocket_vertical")
    },
    @{
        Prefab = "Discoball.prefab"
        Ids = @("multi", "super")
    }
)

foreach ($bonus in $bonusDefs) {
    $prefabPath = Join-Path $baseTilesRoot $bonus.Prefab

    if (-not (Test-Path $prefabPath)) {
        Write-Warning "Bonus prefab not found: $prefabPath"
        continue
    }

    $slots = @(Get-PrefabSlots $prefabPath)

    foreach ($id in $bonus.Ids) {
        Write-ElementFolder `
            -Category "bonus" `
            -Id $id `
            -Slots $slots `
            -SourcePrefab $bonus.Prefab

        $created += [PSCustomObject]@{
            Category = "bonus"
            Id = $id
            Slots = ($slots -join ", ")
        }
    }
}

$master = @(
    "BLASTCITY - ART PREVIEW EXTERNAL ART",
    "=====================================",
    "",
    "Root: art/tiles/",
    "",
    "Folders:",
    "- common/       ordinary colored tiles (existing system)",
    "- special/      normal special tiles",
    "- big_special/  large special tiles",
    "- statuses/     statuses such as bubble/jail/etc.",
    "- bonus/        bomb / rockets / discoball modes",
    "",
    "Rules:",
    "1. Do not rename folders.",
    "2. Put PNG files only under the element folder shown by README.txt.",
    "3. PNG filenames must exactly match README.txt.",
    "4. Missing PNG files are allowed: built-in art stays unchanged.",
    "5. Spine animations remain built-in.",
    "6. Restart Art Preview after changing PNG files; no EXE rebuild is required.",
    "",
    "Generated element list:",
    ""
)

foreach ($item in ($created | Sort-Object Category, Id)) {
    $master += ("{0}/{1} -> {2}" -f $item.Category, $item.Id, $item.Slots)
}

Set-Content `
    -Path (Join-Path $OutputRoot "ART_PREVIEW_README.txt") `
    -Value $master `
    -Encoding UTF8

Write-Host ""
Write-Host "Art Preview structure created:"
Write-Host $OutputRoot
Write-Host ""
Write-Host "Element folders:" $created.Count
Write-Host "Master guide:" (Join-Path $OutputRoot "ART_PREVIEW_README.txt")
