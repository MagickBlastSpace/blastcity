param(
    [string]$ProjectRoot = (Get-Location).Path,
    [string]$OutputRoot = ""
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($OutputRoot)) {
    $OutputRoot = Join-Path $ProjectRoot "art\tiles"
}

$ProjectRoot = (Resolve-Path $ProjectRoot).Path

New-Item `
    -ItemType Directory `
    -Force `
    -Path $OutputRoot |
    Out-Null

$OutputRoot = (Resolve-Path $OutputRoot).Path


# ------------------------------------------------------------
# Проверка ссылки на SpriteFrame
# ------------------------------------------------------------

function Test-IsSpriteFrameRef {
    param($Value)

    if ($null -eq $Value) {
        return $false
    }

    $uuid = $null
    $expectedType = $null

    try {
        $uuid = [string]$Value.__uuid__
    }
    catch {}

    try {
        $expectedType = [string]$Value.__expectedType__
    }
    catch {}

    if ([string]::IsNullOrWhiteSpace($uuid)) {
        return $false
    }

    return (
        $expectedType -eq "cc.SpriteFrame" -or
        $uuid -match "@f9941$"
    )
}


# ------------------------------------------------------------
# Нормализация имени слота
# ------------------------------------------------------------

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


# ------------------------------------------------------------
# Получение пути ноды внутри префаба
# ------------------------------------------------------------

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


# ------------------------------------------------------------
# Добавление подсказки для имени SpriteFrame
# ------------------------------------------------------------

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
        $Groups[$Uuid] =
            New-Object System.Collections.ArrayList

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


# ------------------------------------------------------------
# Получение SpriteFrame-слотов из префаба
# ------------------------------------------------------------

function Get-PrefabSlots {
    param([string]$PrefabPath)

    $data =
        Get-Content $PrefabPath -Raw |
        ConvertFrom-Json

    $rootNodeIndex = 1

    try {
        if ($null -ne $data[0].data.__id__) {
            $rootNodeIndex =
                [int]$data[0].data.__id__
        }
        elseif ($null -ne $data[0]._data.__id__) {
            $rootNodeIndex =
                [int]$data[0]._data.__id__
        }
    }
    catch {}

    $groups = @{}
    $order =
        New-Object System.Collections.ArrayList

    for ($i = 0; $i -lt $data.Count; $i++) {
        $item = $data[$i]

        # Sprite-компоненты
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

        # SpriteFrame-ссылки в свойствах компонентов
        foreach ($property in $item.PSObject.Properties) {
            $name =
                [string]$property.Name

            if ($name.StartsWith("_")) {
                continue
            }

            $value =
                $property.Value

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
                for (
                    $j = 0;
                    $j -lt $value.Count;
                    $j++
                ) {
                    if (
                        Test-IsSpriteFrameRef $value[$j]
                    ) {
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
        $hints =
            @($groups[$uuid])

        $bestHint = $null

        if ($hints.Count -gt 0) {
            $bestHint =
                $hints |
                Sort-Object `
                    @{
                        Expression = {
                            $_.Priority
                        }
                        Descending = $true
                    },
                    @{
                        Expression = {
                            $_.Value.Length
                        }
                        Ascending = $true
                    } |
                Select-Object -First 1
        }

        $baseName = ""

        if ($null -ne $bestHint) {
            $baseName =
                Normalize-SlotName `
                    ([string]$bestHint.Value)
        }

        if (
            [string]::IsNullOrWhiteSpace(
                $baseName
            )
        ) {
            $baseName =
                "slot_$($slots.Count + 1)"
        }

        if (
            -not $usedNames.ContainsKey(
                $baseName
            )
        ) {
            $usedNames[$baseName] = 0
        }

        $usedNames[$baseName]++

        $slotName = $baseName

        if ($usedNames[$baseName] -gt 1) {
            $slotName =
                "{0}_{1}" -f `
                    $baseName,
                    $usedNames[$baseName]
        }

        $slots += $slotName
    }

    return $slots
}


# ------------------------------------------------------------
# Создание папки элемента и README
# ------------------------------------------------------------

function Write-ElementFolder {
    param(
        [string]$Category,
        [string]$Id,
        [string[]]$Slots,
        [string]$SourcePrefab
    )

    $folder =
        Join-Path `
            $OutputRoot `
            (Join-Path $Category $Id)

    New-Item `
        -ItemType Directory `
        -Force `
        -Path $folder |
        Out-Null

    $readme = @(
        "ART PREVIEW",
        "===========",
        "",
        "Категория: $Category",
        "ID:        $Id"
    )

    if (
        -not [string]::IsNullOrWhiteSpace(
            $SourcePrefab
        )
    ) {
        $readme +=
            "Префаб:    $SourcePrefab"
    }

    $readme += ""
    $readme +=
        "PNG-файлы, которые можно положить в эту папку:"

    if ($Slots.Count -eq 0) {
        $readme +=
            "- SpriteFrame-слоты не найдены."
    }
    else {
        foreach ($slot in $Slots) {
            $readme += "- $slot.png"
        }
    }

    $readme += ""
    $readme +=
        "Необязательно добавлять все PNG-файлы."

    $readme +=
        "Если PNG отсутствует, используется встроенный арт из игры."

    $readme +=
        "Spine-анимации этой системой не заменяются."

    $readme +=
        "После замены PNG перезапустите Art Preview, чтобы обновился кэш файлов."

    Set-Content `
        -Path (
            Join-Path $folder "README.txt"
        ) `
        -Value $readme `
        -Encoding UTF8
}


# ------------------------------------------------------------
# Обычные цветные тайлы
# ------------------------------------------------------------

$commonFolder =
    Join-Path $OutputRoot "common"

New-Item `
    -ItemType Directory `
    -Force `
    -Path $commonFolder |
    Out-Null

$commonReadme = @(
    "ART PREVIEW — ОБЫЧНЫЕ ТАЙЛЫ",
    "=============================",
    "",
    "Поддерживаемые имена PNG-файлов:",
    "",
    "- blue.png",
    "- red.png",
    "- green.png",
    "- yellow.png",
    "- purple.png",
    "",
    "Названия файлов менять нельзя.",
    "",
    "Уже существующие файлы и папки для подсказок комбинаций (combo hints) оставляйте без изменений.",
    "",
    "Этот генератор не удаляет и не перезаписывает существующие PNG-файлы.",
    "",
    "После замены PNG перезапустите Art Preview, чтобы обновился кэш файлов."
)

Set-Content `
    -Path (
        Join-Path `
            $commonFolder `
            "README.txt"
    ) `
    -Value $commonReadme `
    -Encoding UTF8


# ------------------------------------------------------------
# Discoball — удобная структура для художника
# ------------------------------------------------------------

$discoballRoot =
    Join-Path `
        $OutputRoot `
        "bonus\discoball"

$discoballMultiFolder =
    Join-Path `
        $discoballRoot `
        "multi"

$discoballSuperFolder =
    Join-Path `
        $discoballRoot `
        "super"

New-Item `
    -ItemType Directory `
    -Force `
    -Path $discoballMultiFolder |
    Out-Null

New-Item `
    -ItemType Directory `
    -Force `
    -Path $discoballSuperFolder |
    Out-Null


$discoballColors = @(
    "yellow",
    "red",
    "blue",
    "green",
    "purple",
    "orange"
)


# ------------------------------------------------------------
# Обычный Discoball
# ------------------------------------------------------------

$multiReadme = @(
    "ART PREVIEW — ОБЫЧНЫЙ ДИСКОШАР",
    "================================",
    "",
    "Путь:",
    "art/tiles/bonus/discoball/multi/",
    "",
    "Положите PNG-файлы цветов в эту папку:",
    ""
)

foreach ($color in $discoballColors) {
    $multiReadme +=
        "- $color.png"
}

$multiReadme += @(
    "",
    "Необязательно добавлять все PNG-файлы.",
    "",
    "Если какого-либо PNG нет, для этого цвета останется встроенный арт из игры.",
    "",
    "Названия файлов менять нельзя.",
    "",
    "После замены PNG перезапустите Art Preview."
)

Set-Content `
    -Path (
        Join-Path `
            $discoballMultiFolder `
            "README.txt"
    ) `
    -Value $multiReadme `
    -Encoding UTF8


# ------------------------------------------------------------
# Super Discoball
# ------------------------------------------------------------

$superReadme = @(
    "ART PREVIEW — СУПЕР-ДИСКОШАР",
    "=============================",
    "",
    "Путь:",
    "art/tiles/bonus/discoball/super/",
    "",
    "Супер-дискошар использует два цвета.",
    "",
    "Допустимые имена PNG-файлов:",
    ""
)

foreach ($primary in $discoballColors) {
    foreach ($secondary in $discoballColors) {

        if ($primary -eq $secondary) {
            continue
        }

        $superReadme +=
            "- ${primary}_${secondary}.png"
    }
}

$superReadme += @(
    "",
    "Всего существует 30 направленных комбинаций цветов.",
    "",
    "Поддерживается использование обратной пары.",
    "",
    "Например:",
    "если есть red_blue.png, а blue_red.png отсутствует,",
    "для комбинации blue_red будет использован red_blue.png.",
    "",
    "Поэтому достаточно 15 PNG-файлов,",
    "если порядок цветов визуально не важен.",
    "",
    "Если существуют оба файла:",
    "red_blue.png",
    "blue_red.png",
    "",
    "для каждой комбинации используется файл с точным именем.",
    "",
    "Необязательно добавлять все PNG-файлы.",
    "Если PNG отсутствует, используется встроенный арт из игры.",
    "",
    "Названия файлов менять нельзя.",
    "",
    "После замены PNG перезапустите Art Preview."
)

Set-Content `
    -Path (
        Join-Path `
            $discoballSuperFolder `
            "README.txt"
    ) `
    -Value $superReadme `
    -Encoding UTF8


# ------------------------------------------------------------
# Источники префабов
# ------------------------------------------------------------

$sources = @(
    @{
        PrefabRoot =
            Join-Path `
                $ProjectRoot `
                "assets\prefabs\spec_tiles"

        Category = "special"
    },

    @{
        PrefabRoot =
            Join-Path `
                $ProjectRoot `
                "assets\prefabs\big_spec_tiles"

        Category = "big_special"
    },

    @{
        PrefabRoot =
            Join-Path `
                $ProjectRoot `
                "assets\prefabs\statuses"

        Category = "statuses"
    }
)


$created = @()


foreach ($source in $sources) {

    if (
        -not (
            Test-Path $source.PrefabRoot
        )
    ) {
        Write-Warning `
            "Папка с префабами не найдена: $($source.PrefabRoot)"

        continue
    }

    Get-ChildItem `
        $source.PrefabRoot `
        -Recurse `
        -File `
        -Filter "*.prefab" |
        Sort-Object FullName |
        ForEach-Object {

            $id =
                $_.BaseName.ToLower()

            $slots =
                @(
                    Get-PrefabSlots `
                        $_.FullName
                )

            Write-ElementFolder `
                -Category $source.Category `
                -Id $id `
                -Slots $slots `
                -SourcePrefab $_.Name

            $created +=
                [PSCustomObject]@{
                    Category =
                        $source.Category

                    Id =
                        $id

                    Slots =
                        ($slots -join ", ")
                }
        }
}


# ------------------------------------------------------------
# Бонусные тайлы
# ------------------------------------------------------------

$baseTilesRoot =
    Join-Path `
        $ProjectRoot `
        "assets\prefabs\base_tiles"


$bonusDefs = @(
    @{
        Prefab = "Bomb.prefab"
        Ids = @(
            "bomb"
        )
    },

    @{
        Prefab = "Rocket.prefab"
        Ids = @(
            "rocket_horizontal",
            "rocket_vertical"
        )
    },

    @{
        Prefab = "Discoball.prefab"
        Ids = @(
            "multi",
            "super"
        )
    }
)


foreach ($bonus in $bonusDefs) {

    $prefabPath =
        Join-Path `
            $baseTilesRoot `
            $bonus.Prefab

    if (
        -not (
            Test-Path $prefabPath
        )
    ) {
        Write-Warning `
            "Префаб бонуса не найден: $prefabPath"

        continue
    }

    $slots =
        @(
            Get-PrefabSlots `
                $prefabPath
        )

    foreach ($id in $bonus.Ids) {

        Write-ElementFolder `
            -Category "bonus" `
            -Id $id `
            -Slots $slots `
            -SourcePrefab $bonus.Prefab

        $created +=
            [PSCustomObject]@{
                Category = "bonus"
                Id = $id
                Slots = ($slots -join ", ")
            }
    }
}


# ------------------------------------------------------------
# Главная инструкция
# ------------------------------------------------------------

$master = @(
    "BLASTCITY — ART PREVIEW — ВНЕШНИЙ АРТ",
    "=======================================",
    "",
    "Корневая папка:",
    "art/tiles/",
    "",
    "Основные папки:",
    "",
    "- common/",
    "  Обычные цветные тайлы.",
    "",
    "- special/",
    "  Обычные специальные тайлы.",
    "",
    "- big_special/",
    "  Большие специальные тайлы.",
    "",
    "- statuses/",
    "  Статусы тайлов: bubble, jail и другие.",
    "",
    "- bonus/",
    "  Бонусные элементы: bomb, rockets, discoball.",
    "",
    "- bonus/discoball/multi/",
    "  Цветные варианты обычного Discoball.",
    "",
    "- bonus/discoball/super/",
    "  Двухцветные варианты Super Discoball.",
    "",
    "ВАЖНО:",
    "",
    "1. Не переименовывайте папки.",
    "",
    "2. Не переименовывайте PNG-файлы.",
    "",
    "3. PNG нужно класть именно в ту папку, которая указана в README.txt нужного элемента.",
    "",
    "4. Имя PNG должно точно совпадать с именем, указанным в README.txt.",
    "",
    "5. Необязательно заменять весь арт.",
    "   Если PNG отсутствует, используется встроенный арт из игры.",
    "",
    "6. Spine-анимации остаются встроенными и этой системой не заменяются.",
    "",
    "7. После изменения или добавления PNG полностью перезапустите Art Preview.",
    "",
    "8. После замены PNG пересобирать EXE не нужно.",
    "",
    "Список автоматически сгенерированных элементов:",
    ""
)


foreach (
    $item in (
        $created |
        Sort-Object Category, Id
    )
) {
    $master += (
        "{0}/{1} -> {2}" -f `
            $item.Category,
            $item.Id,
            $item.Slots
    )
}


Set-Content `
    -Path (
        Join-Path `
            $OutputRoot `
            "ART_PREVIEW_README.txt"
    ) `
    -Value $master `
    -Encoding UTF8


# ------------------------------------------------------------
# Результат
# ------------------------------------------------------------

Write-Host ""
Write-Host "Структура Art Preview создана:"
Write-Host $OutputRoot

Write-Host ""
Write-Host "Создано папок элементов:" $created.Count

Write-Host ""
Write-Host "Главная инструкция:"
Write-Host (
    Join-Path `
        $OutputRoot `
        "ART_PREVIEW_README.txt"
)
