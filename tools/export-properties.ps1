  # ==================================================
  # DREAMKEY PROPERTIES
  # EXCEL -> WEBSITE JSON EXPORTER
  # NO EXCEL / COM DEPENDENCY REQUIRED
  # ==================================================

  $ErrorActionPreference = "Stop"

  Add-Type -AssemblyName System.IO.Compression.FileSystem

  # ==================================================
  # PROJECT PATHS
  # ==================================================

  $scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
  $projectRoot = Split-Path -Parent $scriptDirectory

  $excelPath = Join-Path `
    $projectRoot `
    "database\DreamKey_Master_Property_Database.xlsx"

  $outputDirectory = Join-Path `
    $projectRoot `
    "assets\data"

  $outputPath = Join-Path `
    $outputDirectory `
    "properties.json"

  $backupDirectory = Join-Path `
    $projectRoot `
    "database\backups"

  $exportDirectory = Join-Path `
    $projectRoot `
    "database\exports"

  $latestExportPath = Join-Path `
    $exportDirectory `
    "properties-latest.json"


  # ==================================================
  # CHECK EXCEL FILE
  # ==================================================

  if (-not (Test-Path $excelPath)) {
    throw "Excel database not found: $excelPath"
  }


  # ==================================================
  # CREATE REQUIRED DIRECTORIES
  # ==================================================

  @(
    $outputDirectory,
    $backupDirectory,
    $exportDirectory
  ) | ForEach-Object {

    if (-not (Test-Path $_)) {
      New-Item `
        -ItemType Directory `
        -Path $_ `
        -Force | Out-Null
    }
  }


  # ==================================================
  # XML HELPER
  # ==================================================

  function Get-ZipEntryText {
    param(
      [Parameter(Mandatory = $true)]
      $Zip,

      [Parameter(Mandatory = $true)]
      [string]$EntryName
    )

    $entry = $Zip.GetEntry($EntryName)

    if (-not $entry) {
      return $null
    }

    $stream = $entry.Open()

    try {
      $reader = New-Object System.IO.StreamReader($stream)

      try {
        return $reader.ReadToEnd()
      }
      finally {
        $reader.Dispose()
      }
    }
    finally {
      $stream.Dispose()
    }
  }


  # ==================================================
  # EXCEL COLUMN LETTER -> NUMBER
  # ==================================================

  function Convert-ColumnLettersToNumber {
    param(
      [string]$Letters
    )

    $number = 0

    foreach ($character in $Letters.ToCharArray()) {
      $number =
        ($number * 26) +
        ([int][char]$character - [int][char]"A" + 1)
    }

    return $number
  }


  # ==================================================
  # CELL VALUE HELPER
  # ==================================================

  function Get-ExcelCellValue {
    param(
      $Cell,
      $SharedStrings,
      $NamespaceManager
    )

    $cellType = $Cell.GetAttribute("t")

    if ($cellType -eq "inlineStr") {

      $inlineNodes = $Cell.SelectNodes(
        ".//x:t",
        $NamespaceManager
      )

      if ($inlineNodes) {
        return (
          $inlineNodes |
          ForEach-Object { $_.InnerText }
        ) -join ""
      }

      return ""
    }

    $valueNode = $Cell.SelectSingleNode(
      "x:v",
      $NamespaceManager
    )

    if (-not $valueNode) {
      return ""
    }

    $rawValue = $valueNode.InnerText

    if ($cellType -eq "s") {

      $index = 0

      if (
        [int]::TryParse(
          $rawValue,
          [ref]$index
        )
      ) {
        if (
          $index -ge 0 -and
          $index -lt $SharedStrings.Count
        ) {
          return $SharedStrings[$index]
        }
      }
    }

    if ($cellType -eq "b") {
      return $(if ($rawValue -eq "1") { "TRUE" } else { "FALSE" })
    }

    return $rawValue
  }

  # ==================================================
  # READ EXCEL WORKSHEET AS OBJECTS
  # ==================================================

  function Get-ExcelWorksheetRecords {
    param(
      [Parameter(Mandatory = $true)]
      $Zip,

      [Parameter(Mandatory = $true)]
      [xml]$WorkbookXml,

      [Parameter(Mandatory = $true)]
      $WorkbookNamespaceManager,

      [Parameter(Mandatory = $true)]
      [xml]$RelationshipsXml,

      [Parameter(Mandatory = $true)]
      [array]$SharedStrings,

      [Parameter(Mandatory = $true)]
      [string]$SheetName,

      [Parameter(Mandatory = $true)]
      [string]$HeaderIdentifier
    )

    $sheet =
      $WorkbookXml.SelectSingleNode(
        "//x:sheet[@name='$SheetName']",
        $WorkbookNamespaceManager
      )

    if (-not $sheet) {
      throw "Sheet '$SheetName' was not found."
    }

    $relationshipId =
      $sheet.GetAttribute(
        "id",
        "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
      )

    $relationshipNode =
      $RelationshipsXml.Relationships.Relationship |
      Where-Object {
        $_.Id -eq $relationshipId
      } |
      Select-Object -First 1

    if (-not $relationshipNode) {
      throw "Unable to resolve worksheet '$SheetName'."
    }

    $worksheetTarget =
      ([string]$relationshipNode.Target).Replace("\", "/")

    if ($worksheetTarget.StartsWith("/")) {
      $worksheetEntry =
        $worksheetTarget.TrimStart("/")
    }
    elseif ($worksheetTarget.StartsWith("xl/")) {
      $worksheetEntry =
        $worksheetTarget
    }
    else {
      $worksheetEntry =
        "xl/" + $worksheetTarget
    }

    $worksheetEntry =
      $worksheetEntry.Replace(
        "xl/../",
        ""
      )

    $worksheetText =
      Get-ZipEntryText `
        -Zip $Zip `
        -EntryName $worksheetEntry

    if (-not $worksheetText) {
      throw "Unable to read worksheet '$SheetName'."
    }

    [xml]$worksheetXml =
      $worksheetText

    $worksheetNamespaceManager =
      New-Object System.Xml.XmlNamespaceManager(
        $worksheetXml.NameTable
      )

    $worksheetNamespaceManager.AddNamespace(
      "x",
      "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
    )

    $rows =
      $worksheetXml.SelectNodes(
        "//x:sheetData/x:row",
        $worksheetNamespaceManager
      )

    $headerMap = @{}
    $headerRowNumber = $null

    foreach ($row in $rows) {

      $candidateHeaders = @{}

      foreach (
        $cell in $row.SelectNodes(
          "x:c",
          $worksheetNamespaceManager
        )
      ) {

        $reference =
          $cell.GetAttribute("r")

        if ($reference -match "^([A-Z]+)") {

          $columnNumber =
            Convert-ColumnLettersToNumber `
              $Matches[1]

          $value =
            Get-ExcelCellValue `
              -Cell $cell `
              -SharedStrings $SharedStrings `
              -NamespaceManager $worksheetNamespaceManager

          if (
            -not [string]::IsNullOrWhiteSpace(
              [string]$value
            )
          ) {
            $candidateHeaders[$columnNumber] =
              [string]$value
          }
        }
      }

      if (
        $candidateHeaders.Values -contains
        $HeaderIdentifier
      ) {

        $headerMap =
          $candidateHeaders

        $headerRowNumber =
          [int]$row.GetAttribute("r")

        break
      }
    }

    if (-not $headerRowNumber) {
      throw "Could not find header '$HeaderIdentifier' in sheet '$SheetName'."
    }

    $records = @()

    foreach ($row in $rows) {

      $rowNumber =
        [int]$row.GetAttribute("r")

      if ($rowNumber -le $headerRowNumber) {
        continue
      }

      $valuesByColumn = @{}

      foreach (
        $cell in $row.SelectNodes(
          "x:c",
          $worksheetNamespaceManager
        )
      ) {

        $reference =
          $cell.GetAttribute("r")

        if ($reference -match "^([A-Z]+)") {

          $columnNumber =
            Convert-ColumnLettersToNumber `
              $Matches[1]

          $valuesByColumn[$columnNumber] =
            Get-ExcelCellValue `
              -Cell $cell `
              -SharedStrings $SharedStrings `
              -NamespaceManager $worksheetNamespaceManager
        }
      }

      $record =
        [ordered]@{}

      foreach ($columnNumber in $headerMap.Keys) {

        $header =
          $headerMap[$columnNumber]

        $value = ""

        if (
          $valuesByColumn.ContainsKey(
            $columnNumber
          )
        ) {
          $value =
            $valuesByColumn[$columnNumber]
        }

        $record[$header] =
          $value
      }

      $hasData =
        $record.Values |
        Where-Object {
          -not [string]::IsNullOrWhiteSpace(
            [string]$_
          )
        } |
        Select-Object -First 1

      if ($hasData) {
        $records +=
          [PSCustomObject]$record
      }
    }

    return @($records)
  }


  # ==================================================
  # YES / NO HELPER
  # ==================================================

  function Test-Yes {
    param(
      $Value
    )

    return (
      [string]$Value
    ).Trim().ToLowerInvariant() -eq "yes"
  }


  # ==================================================
  # NUMBER HELPER
  # ==================================================

  function Convert-ToNumber {
    param(
      $Value
    )

    $number = 0.0

    $text = (
      [string]$Value
    ).Trim()

    if (
      [double]::TryParse(
        $text,
        [System.Globalization.NumberStyles]::Any,
        [System.Globalization.CultureInfo]::InvariantCulture,
        [ref]$number
      )
    ) {
      return $number
    }

    return $null
  }


  # ==================================================
  # FORMAT AREA RANGE
  # ==================================================

  function Format-AreaRange {
    param(
      [array]$Values
    )

    $numbers = @(
      $Values |
      ForEach-Object {
        Convert-ToNumber $_
      } |
      Where-Object {
        $null -ne $_
      }
    )

    if ($numbers.Count -eq 0) {
      return ""
    }

    $minimum = (
      $numbers |
      Measure-Object -Minimum
    ).Minimum

    $maximum = (
      $numbers |
      Measure-Object -Maximum
    ).Maximum

    $minimumText = "{0:N0}" -f $minimum
    $maximumText = "{0:N0}" -f $maximum

    if ($minimum -eq $maximum) {
      return "${minimumText} sq. ft."
    }

    return "${minimumText}-${maximumText} sq. ft."
  }


  # ==================================================
  # FORMAT BHK CONFIGURATION
  # ==================================================

  function Format-Configuration {
    param(
      [array]$Rows
    )

    $bhkValues = @(
      $Rows |
      ForEach-Object {

        $bhk = Convert-ToNumber $_."BHK Count"

        if ($null -ne $bhk) {
          [int]$bhk
        }
      } |
      Sort-Object -Unique
    )

    if ($bhkValues.Count -eq 0) {

      $configurations = @(
        $Rows |
        ForEach-Object {
          $_."Configuration"
        } |
        Where-Object {
          -not [string]::IsNullOrWhiteSpace(
            [string]$_
          )
        } |
        Sort-Object -Unique
      )

      return $configurations -join ", "
    }

    if ($bhkValues.Count -eq 1) {
      return "$($bhkValues[0]) BHK"
    }

    return (
      ($bhkValues -join ", ") +
      " BHK"
    )
  }


  # ==================================================
  # FORMAT INR PRICE
  # ==================================================

  function Format-Price {
    param(
      $Price
    )

    if ($null -eq $Price) {
      return ""
    }

    if ($Price -ge 10000000) {

      $crore = $Price / 10000000

      $croreText = "{0:0.##}" -f $crore

      return "₹${croreText} Cr*"
    }

    if ($Price -ge 100000) {

      $lakh = $Price / 100000

      $lakhText = "{0:0.##}" -f $lakh

      return "₹${lakhText} Lakh*"
    }

    return "₹$Price"
  }


  # ==================================================
  # READ XLSX AS ZIP
  # ==================================================

  $zip = [System.IO.Compression.ZipFile]::OpenRead(
    $excelPath
  )

  try {

    # ==================================================
    # SHARED STRINGS
    # ==================================================

    $sharedStrings = @()

    $sharedStringsText = Get-ZipEntryText `
      -Zip $zip `
      -EntryName "xl/sharedStrings.xml"

    if ($sharedStringsText) {

      [xml]$sharedXml = $sharedStringsText

      $sharedNamespaceManager =
        New-Object System.Xml.XmlNamespaceManager(
          $sharedXml.NameTable
        )

      $sharedNamespaceManager.AddNamespace(
        "x",
        "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
      )

      $sharedStringNodes =
        $sharedXml.SelectNodes(
          "//x:si",
          $sharedNamespaceManager
        )

      foreach ($sharedStringNode in $sharedStringNodes) {

        $textNodes =
          $sharedStringNode.SelectNodes(
            ".//x:t",
            $sharedNamespaceManager
          )

        $sharedStrings += (
          $textNodes |
          ForEach-Object {
            $_.InnerText
          }
        ) -join ""
      }
    }


    # ==================================================
    # READ WORKBOOK
    # ==================================================

    $workbookText = Get-ZipEntryText `
      -Zip $zip `
      -EntryName "xl/workbook.xml"

    if (-not $workbookText) {
      throw "Unable to read xl/workbook.xml"
    }

    [xml]$workbookXml = $workbookText

    $workbookNamespaceManager =
      New-Object System.Xml.XmlNamespaceManager(
        $workbookXml.NameTable
      )

    $workbookNamespaceManager.AddNamespace(
      "x",
      "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
    )

    $workbookNamespaceManager.AddNamespace(
      "r",
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
    )

    $masterSheet =
      $workbookXml.SelectSingleNode(
        "//x:sheet[@name='Master Property Database']",
        $workbookNamespaceManager
      )

    if (-not $masterSheet) {
      throw "Sheet 'Master Property Database' was not found."
    }

    $relationshipId =
      $masterSheet.GetAttribute(
        "id",
        "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
      )


    # ==================================================
    # RESOLVE WORKSHEET FILE
    # ==================================================

    $relationshipsText = Get-ZipEntryText `
      -Zip $zip `
      -EntryName "xl/_rels/workbook.xml.rels"

    if (-not $relationshipsText) {
      throw "Unable to read workbook relationships."
    }

    [xml]$relationshipsXml =
      $relationshipsText

    $relationshipNode =
      $relationshipsXml.Relationships.Relationship |
      Where-Object {
        $_.Id -eq $relationshipId
      }

    if (-not $relationshipNode) {
      throw "Unable to resolve Master Property Database worksheet."
    }

    $worksheetTarget =
      [string]$relationshipNode.Target

    $worksheetTarget =
      $worksheetTarget.Replace("\", "/")

    if (
      $worksheetTarget.StartsWith("/")
    ) {
      $worksheetEntry =
        $worksheetTarget.TrimStart("/")
    }
    elseif (
      $worksheetTarget.StartsWith("xl/")
    ) {
      $worksheetEntry =
        $worksheetTarget
    }
    else {
      $worksheetEntry =
        "xl/" + $worksheetTarget
    }

    $worksheetEntry =
      $worksheetEntry.Replace(
        "xl/../",
        ""
      )


    # ==================================================
    # READ MASTER PROPERTY DATABASE
    # ==================================================

    $worksheetText =
      Get-ZipEntryText `
        -Zip $zip `
        -EntryName $worksheetEntry

    if (-not $worksheetText) {
      throw "Unable to read worksheet: $worksheetEntry"
    }

    [xml]$worksheetXml =
      $worksheetText

    $worksheetNamespaceManager =
      New-Object System.Xml.XmlNamespaceManager(
        $worksheetXml.NameTable
      )

    $worksheetNamespaceManager.AddNamespace(
      "x",
      "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
    )

    $rows =
      $worksheetXml.SelectNodes(
        "//x:sheetData/x:row",
        $worksheetNamespaceManager
      )

  # ==================================================
  # READ PROJECTS SHEET
  # ==================================================

  $projectSheetRows =
    Get-ExcelWorksheetRecords `
      -Zip $zip `
      -WorkbookXml $workbookXml `
      -WorkbookNamespaceManager $workbookNamespaceManager `
      -RelationshipsXml $relationshipsXml `
      -SharedStrings $sharedStrings `
      -SheetName "Projects" `
      -HeaderIdentifier "Project Slug"

  if ($projectSheetRows.Count -eq 0) {
    throw "No project records were found in the Projects sheet."
  }

  $blankProjectSlugs =
    @(
      $projectSheetRows |
      Where-Object {
        [string]::IsNullOrWhiteSpace(
          [string]$_."Project Slug"
        )
      }
    )

  if ($blankProjectSlugs.Count -gt 0) {
    throw "Projects sheet contains a project row with a blank Project Slug."
  }

  # ==================================================
  # CHECK PROJECTS SHEET REQUIRED COLUMNS
  # ==================================================

  $requiredProjectHeaders = @(
    "Project Slug",
    "Project Name",
    "Show on Homepage",
    "Featured",
    "Ongoing",
    "Ready to Move",
    "New Launch",
    "Luxury Home",
    "Featured Order",
    "Ongoing Order",
    "Ready Order",
    "New Launch Order",
    "Luxury Order",
    "Project Tag",
    "Card Category Label",
    "Badge Theme",
    "Card Image Path",
    "Project URL",
    "Developer",
    "City",
    "Locality",
    "Full Address",
    "RERA Number",
    "Towers",
    "Floors",
    "Total Units",
    "Land Parcel (Acres)",
    "Short Description",
    "Hero Image Path",
    "Overview Image Path",
    "Highlights Image Path",
    "Gallery Folder",
    "Amenities Folder",
    "Floor Plans Folder",
    "Location Map Image",
    "Project Details Image",
    "Why Investment Folder",
    "Brochure PDF",
    "Meta Title",
    "Meta Description",
    "Latitude",
    "Longitude",
    "Last Updated",
    "Similar Project Slugs"
  )

  $projectHeaders =
    @(
      $projectSheetRows[0].PSObject.Properties.Name |
      ForEach-Object {
        ([string]$_).Trim()
      }
    )

  foreach ($requiredProjectHeader in $requiredProjectHeaders) {

    if (
      $projectHeaders -notcontains
      $requiredProjectHeader
    ) {
      throw "Required Projects sheet column missing: $requiredProjectHeader"
    }
  }

    # ==================================================
    # FIND HEADER ROW
    # ==================================================

    $headerMap = @{}
    $headerRowNumber = $null

    foreach ($row in $rows) {

      $candidateHeaders = @{}

      foreach (
        $cell in $row.SelectNodes(
          "x:c",
          $worksheetNamespaceManager
        )
      ) {

        $reference =
          $cell.GetAttribute("r")

        if (
          $reference -match "^([A-Z]+)"
        ) {

          $columnNumber =
            Convert-ColumnLettersToNumber `
              $Matches[1]

          $value =
            Get-ExcelCellValue `
              -Cell $cell `
              -SharedStrings $sharedStrings `
              -NamespaceManager $worksheetNamespaceManager

          if (
            -not [string]::IsNullOrWhiteSpace(
              [string]$value
            )
          ) {
            $candidateHeaders[$columnNumber] =
              [string]$value
          }
        }
      }

      if (
        $candidateHeaders.Values -contains
        "Property ID"
      ) {

        $headerMap =
          $candidateHeaders

        $headerRowNumber =
          [int]$row.GetAttribute("r")

        break
      }
    }

    if (-not $headerRowNumber) {
      throw "Could not find the Excel header row containing 'Property ID'."
    }


  # ==================================================
  # CHECK REQUIRED COLUMNS
  # ==================================================

$requiredHeaders = @(
    "Property ID",
    "Listing Code",
    "Project Slug",
    "Configuration",
    "BHK Count",
    "Carpet Area (sq.ft.)",
    "Starting Price (INR)",
    "Display Price",
    "Possession Date",
    "Possession Display",
    "Construction Status",
    "Is Ready to Move",
    "Active"
)

    foreach ($requiredHeader in $requiredHeaders) {

      if (
        -not (
          $headerMap.Values -contains
          $requiredHeader
        )
      ) {
        throw "Required Excel column missing: $requiredHeader"
      }
    }


    # ==================================================
    # CONVERT WORKSHEET ROWS TO OBJECTS
    # ==================================================

    $dataRows = @()

    foreach ($row in $rows) {

      $rowNumber =
        [int]$row.GetAttribute("r")

      if ($rowNumber -le $headerRowNumber) {
        continue
      }

      $valuesByColumn = @{}

      foreach (
        $cell in $row.SelectNodes(
          "x:c",
          $worksheetNamespaceManager
        )
      ) {

        $reference =
          $cell.GetAttribute("r")

        if (
          $reference -match "^([A-Z]+)"
        ) {

          $columnNumber =
            Convert-ColumnLettersToNumber `
              $Matches[1]

          $valuesByColumn[$columnNumber] =
            Get-ExcelCellValue `
              -Cell $cell `
              -SharedStrings $sharedStrings `
              -NamespaceManager $worksheetNamespaceManager
        }
      }

      $record =
        [ordered]@{}

      foreach (
        $columnNumber in $headerMap.Keys
      ) {

        $header =
          $headerMap[$columnNumber]

        $value = ""

        if (
          $valuesByColumn.ContainsKey(
            $columnNumber
          )
        ) {
          $value =
            $valuesByColumn[$columnNumber]
        }

        $record[$header] =
          $value
      }

  if (
    -not [string]::IsNullOrWhiteSpace(
      [string]$record["Property ID"]
    )
  ) {
    $dataRows +=
      [PSCustomObject]$record
  }

  }

    # ==================================================
    # ACTIVE LISTINGS ONLY
    # ==================================================

    $activeRows = @(
      $dataRows |
      Where-Object {
        Test-Yes $_."Active"
      }
    )

  if ($activeRows.Count -eq 0) {
    throw "No rows with Active = Yes were found."
  }

  $duplicateListingCodes =
    @(
      $activeRows |
      Where-Object {
        -not [string]::IsNullOrWhiteSpace(
          [string]$_."Listing Code"
        )
      } |
      Group-Object {
        ([string]$_."Listing Code").Trim().ToLowerInvariant()
      } |
      Where-Object {
        $_.Count -gt 1
      }
    )

  if ($duplicateListingCodes.Count -gt 0) {
    $duplicateCodes =
      ($duplicateListingCodes.Name -join ", ")

    throw "Duplicate active Listing Code(s) found: $duplicateCodes"
  }

  $blankListingCodes =
    @(
      $activeRows |
      Where-Object {
        [string]::IsNullOrWhiteSpace(
          [string]$_."Listing Code"
        )
      }
    )

  $blankPropertyIds =
    @(
      $activeRows |
      Where-Object {
        [string]::IsNullOrWhiteSpace(
          [string]$_."Property ID"
        )
      }
    )

$duplicatePropertyIds =
  @(
    $activeRows |
    Where-Object {
      -not [string]::IsNullOrWhiteSpace(
        [string]$_."Property ID"
      )
    } |
    Group-Object {
      ([string]$_."Property ID").Trim().ToLowerInvariant()
    } |
    Where-Object {
      $_.Count -gt 1
    }
  )

  if ($blankListingCodes.Count -gt 0) {
    throw "Active listing found with a blank Listing Code."
  }

  if ($blankPropertyIds.Count -gt 0) {
    throw "Active listing found with a blank Property ID."
  }

  if ($duplicatePropertyIds.Count -gt 0) {
    $duplicateIds =
      ($duplicatePropertyIds.Name -join ", ")

    throw "Duplicate active Property ID(s) found: $duplicateIds"
  }


    # ==================================================
    # GROUP LISTINGS BY PROJECT
    # ==================================================

  $blankListingProjectSlugs =
    @(
      $activeRows |
      Where-Object {
        [string]::IsNullOrWhiteSpace(
          [string]$_."Project Slug"
        )
      }
    )

  if ($blankListingProjectSlugs.Count -gt 0) {
    throw "Active listing found with a blank Project Slug."
  }

$projectGroups =
  @(
    $activeRows |
    Group-Object {
      ([string]$_."Project Slug").Trim().ToLowerInvariant()
    }
  )

    $projects = @()

$duplicateProjectSlugs =
  @(
    $projectSheetRows |
    Where-Object {
      -not [string]::IsNullOrWhiteSpace(
        [string]$_."Project Slug"
      )
    } |
    Group-Object {
      ([string]$_."Project Slug").Trim().ToLowerInvariant()
    } |
    Where-Object {
      $_.Count -gt 1
    }
  )

$blankProjectNames =
  @(
    $projectSheetRows |
    Where-Object {
      [string]::IsNullOrWhiteSpace(
        [string]$_."Project Name"
      )
    }
  )

if ($duplicateProjectSlugs.Count -gt 0) {
  $duplicateSlugs =
    ($duplicateProjectSlugs.Name -join ", ")

  throw "Duplicate Project Slug found in Projects sheet: $duplicateSlugs"
}

if ($blankProjectNames.Count -gt 0) {
  throw "Projects sheet contains a project row with a blank Project Name."
}


    # ==================================================
    # CREATE WEBSITE PROJECT DATA
    # ==================================================

    foreach ($group in $projectGroups) {

      $projectRows =
        @($group.Group)

  $projectSlug =
    ([string]$group.Name).Trim().ToLowerInvariant()

  $projectMasterMatches =
    @(
      $projectSheetRows |
      Where-Object {
        ([string]$_."Project Slug").Trim().ToLowerInvariant() -eq
        $projectSlug
      }
    )

  if ($projectMasterMatches.Count -gt 1) {
    throw "Duplicate Project Slug '$projectSlug' found in Projects sheet."
  }

  $projectMaster =
    $projectMasterMatches |
    Select-Object -First 1

  if (-not $projectMaster) {
    throw "Project '$projectSlug' exists in Master Property Database but not in Projects sheet."
  }

  if (-not (Test-Yes $projectMaster."Show on Homepage")) {
    Write-Host "Project '$projectSlug' is hidden from homepage but will remain in properties.json."
  }

  # ==================================================
  # PROJECT CATEGORIES FROM PROJECTS SHEET
  # ==================================================

  $categories = @()

  if (Test-Yes $projectMaster."Featured") {
    $categories += "featured"
  }

  if (Test-Yes $projectMaster."Ongoing") {
    $categories += "ongoing"
  }

  if (Test-Yes $projectMaster."Ready to Move") {
    $categories += "ready-to-move"
  }

  if (Test-Yes $projectMaster."New Launch") {
    $categories += "new-launches"
  }

  if (Test-Yes $projectMaster."Luxury Home") {
    $categories += "luxury-homes"
  }


      # ==================================================
      # PRICE
      # ==================================================

      $priceRows = @(
        $projectRows |
        ForEach-Object {

          $numericPrice =
            Convert-ToNumber `
              $_."Starting Price (INR)"

          if ($null -ne $numericPrice) {

            [PSCustomObject]@{
              Row = $_
              Price = $numericPrice
            }
          }
        } |
        Sort-Object Price
      )

  $priceValue = 0

  $displayPrice = ""

  if ($priceRows.Count -gt 0) {

    $priceValue =
      [double]$priceRows[0].Price

    $displayPrice =
      Format-Price $priceValue
  }


      # ==================================================
      # POSSESSION
      # ==================================================

      $readyToMove =
        $projectRows |
        Where-Object {
          Test-Yes $_."Is Ready to Move"
        } |
        Select-Object -First 1

      if ($readyToMove) {

        $possession =
          "Ready to Move"
      }
      else {

        $possessionValues = @(
          $projectRows |
          ForEach-Object {
            $_."Possession Display"
          } |
          Where-Object {
            -not [string]::IsNullOrWhiteSpace(
              [string]$_
            )
          }
        )

        $possession =
          if ($possessionValues.Count -gt 0) {
            [string]$possessionValues[0]
          }
          else {
            ""
          }
      }

      # ==================================================
  # HOMEPAGE VISIBILITY
  # ==================================================

  $showOnHomepageValue =
    Test-Yes $projectMaster."Show on Homepage"


  $featuredOrder =
    Convert-ToNumber $projectMaster."Featured Order"

  $ongoingOrder =
    Convert-ToNumber $projectMaster."Ongoing Order"

  $readyOrder =
    Convert-ToNumber $projectMaster."Ready Order"

  $newLaunchOrder =
    Convert-ToNumber $projectMaster."New Launch Order"

  $luxuryOrder =
    Convert-ToNumber $projectMaster."Luxury Order"

  if ($null -eq $featuredOrder) {
    $featuredOrder = 9999
  }

  if ($null -eq $ongoingOrder) {
    $ongoingOrder = 9999
  }

  if ($null -eq $readyOrder) {
    $readyOrder = 9999
  }

  if ($null -eq $newLaunchOrder) {
    $newLaunchOrder = 9999
  }

  if ($null -eq $luxuryOrder) {
    $luxuryOrder = 9999
  }

  $featuredOrder = [int]$featuredOrder
  $ongoingOrder = [int]$ongoingOrder
  $readyOrder = [int]$readyOrder
  $newLaunchOrder = [int]$newLaunchOrder
  $luxuryOrder = [int]$luxuryOrder

      # ==================================================
      # CARD CATEGORY LABEL FROM EXCEL
      # ==================================================

  $cardCategoryLabel =
    [string]$projectMaster."Card Category Label"

      if (
        [string]::IsNullOrWhiteSpace(
          $cardCategoryLabel
        )
      ) {
        $cardCategoryLabel =
          "Residential Project"
      }


  # ==================================================
  # PROJECT OBJECT
  # ==================================================

  $projectObject =
    [ordered]@{

  id =
    ([string]$projectMaster."Project Slug").Trim().ToLowerInvariant()

      name =
        [string]$projectMaster."Project Name"

      categoryLabel =
        $cardCategoryLabel

      badge =
        [string]$projectMaster."Project Tag"

      badgeTheme =
        [string]$projectMaster."Badge Theme"

  location =
    [string]$projectMaster."Full Address"

      configuration =
        Format-Configuration $projectRows

      area =
        Format-AreaRange @(
          $projectRows |
          ForEach-Object {
            $_."Carpet Area (sq.ft.)"
          }
        )

      price =
        $displayPrice

      priceValue =
        $priceValue

      possession =
        $possession

      image =
        [string]$projectMaster."Card Image Path"

      url =
        [string]$projectMaster."Project URL"

      categories =
        $categories

      showOnHomepage =
        $showOnHomepageValue

      categoryOrder =
        [ordered]@{

          featured =
            $featuredOrder

          ongoing =
            $ongoingOrder

          readyToMove =
            $readyOrder

          newLaunches =
            $newLaunchOrder

          luxuryHomes =
            $luxuryOrder
        }

  shortDescription =
    [string]$projectMaster."Short Description"

  reraNumber =
    [string]$projectMaster."RERA Number"

        developer =
        [string]$projectMaster."Developer"

      city =
        [string]$projectMaster."City"

      locality =
        [string]$projectMaster."Locality"

      towers =
        Convert-ToNumber $projectMaster."Towers"

      floors =
        Convert-ToNumber $projectMaster."Floors"

      totalUnits =
        Convert-ToNumber $projectMaster."Total Units"

      landParcelAcres =
        Convert-ToNumber $projectMaster."Land Parcel (Acres)"

      heroImage =
        [string]$projectMaster."Hero Image Path"

      overviewImage =
        [string]$projectMaster."Overview Image Path"

      highlightsImage =
        [string]$projectMaster."Highlights Image Path"

      galleryFolder =
        [string]$projectMaster."Gallery Folder"

      amenitiesFolder =
        [string]$projectMaster."Amenities Folder"

      floorPlansFolder =
        [string]$projectMaster."Floor Plans Folder"

locationImage =
  [string]$projectMaster."Location Map Image"

      projectDetailsImage =
        [string]$projectMaster."Project Details Image"

      whyInvestmentFolder =
        [string]$projectMaster."Why Investment Folder"

      brochurePdf =
        [string]$projectMaster."Brochure PDF"

      metaTitle =
        [string]$projectMaster."Meta Title"

      metaDescription =
        [string]$projectMaster."Meta Description"

      latitude =
        Convert-ToNumber $projectMaster."Latitude"

      longitude =
        Convert-ToNumber $projectMaster."Longitude"

      lastUpdated =
        if (
          [string]::IsNullOrWhiteSpace(
            [string]$projectMaster."Last Updated"
          )
        ) {
          ""
        }
        elseif (
          ([string]$projectMaster."Last Updated") -match '^\d+(\.\d+)?$'
        ) {
          [datetime]::FromOADate(
            [double]$projectMaster."Last Updated"
          ).ToString("yyyy-MM-dd")
        }
        else {
          [string]$projectMaster."Last Updated"
        }

      similarProjectSlugs =
        @(
          ([string]$projectMaster."Similar Project Slugs") -split "," |
          ForEach-Object { $_.Trim() } |
          Where-Object { $_ }
        )

      listingCount =
        $projectRows.Count

      listings =
        @(
          $projectRows |
          ForEach-Object {

            [PSCustomObject][ordered]@{
              propertyId =
                [string]$_."Property ID"

              listingCode =
                [string]$_."Listing Code"

              projectSlug =
                [string]$_."Project Slug"

projectName =
  [string]$projectMaster."Project Name"

configuration =
  [string]$_."Configuration"

              bhkCount =
                Convert-ToNumber $_."BHK Count"

              carpetAreaSqFt =
                Convert-ToNumber $_."Carpet Area (sq.ft.)"

              startingPrice =
                Convert-ToNumber $_."Starting Price (INR)"

              possessionDate =
                [string]$_."Possession Date"

              possessionDisplay =
                [string]$_."Possession Display"

              constructionStatus =
                [string]$_."Construction Status"

              isReadyToMove =
                Test-Yes $_."Is Ready to Move"

displayPrice =
  [string]$_."Display Price"

active =
  Test-Yes $_."Active"
            }
          }
        )
    }

    # ==================================================
    # ADD PROJECT TO PROJECTS ARRAY
    # ==================================================

    $projects +=
      [PSCustomObject]$projectObject
  }

  # ==================================================
  # SORT PROJECTS
  # ==================================================

    $projects =
      @(
        $projects |
        Sort-Object name
      )


    # ==================================================
    # FINAL JSON PAYLOAD
    # ==================================================

    $payload =
      [ordered]@{

        generatedAt =
          (Get-Date).ToString(
            "yyyy-MM-ddTHH:mm:ss"
          )

        projectCount =
          $projects.Count

        listingCount =
          $activeRows.Count

        projects =
          $projects
      }


    # ==================================================
    # BACKUP CURRENT WEBSITE JSON
    # ==================================================

    $timestamp =
      Get-Date -Format "yyyyMMdd-HHmmss"

    if (Test-Path $outputPath) {

      $backupPath =
        Join-Path `
          $backupDirectory `
          "properties-$timestamp.json"

      Copy-Item `
        $outputPath `
        $backupPath `
        -Force
    }


    # ==================================================
    # WRITE WEBSITE JSON
    # ==================================================

    $json =
      $payload |
      ConvertTo-Json `
        -Depth 20

    [System.IO.File]::WriteAllText(
      $outputPath,
      $json,
      (
        New-Object System.Text.UTF8Encoding(
          $false
        )
      )
    )


    # ==================================================
    # WRITE DATABASE EXPORT COPIES
    # ==================================================

    $datedExportPath =
      Join-Path `
        $exportDirectory `
        "properties-$timestamp.json"

    Copy-Item `
      $outputPath `
      $latestExportPath `
      -Force

    Copy-Item `
      $outputPath `
      $datedExportPath `
      -Force


    # ==================================================
    # SUCCESS MESSAGE
    # ==================================================

    Write-Host ""
    Write-Host "============================================="
    Write-Host " DREAMKEY PROPERTY EXPORT SUCCESSFUL"
    Write-Host "============================================="
    Write-Host ""
    Write-Host (
      "Projects exported : {0}" -f
      $projects.Count
    )
    Write-Host (
      "Listings exported : {0}" -f
      $activeRows.Count
    )
    Write-Host (
      "Website JSON      : {0}" -f
      $outputPath
    )
    Write-Host (
      "Latest export     : {0}" -f
      $latestExportPath
    )
    Write-Host (
      "Export snapshot   : {0}" -f
      $datedExportPath
    )
    Write-Host ""
  }
  finally {

    if ($zip) {
      $zip.Dispose()
    }
  }