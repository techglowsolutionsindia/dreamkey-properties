DREAMKEY PROPERTIES - EXCEL DATA INTEGRATION

Copy these files into your DreamKey project root while keeping the same folder structure:

1. export-properties.bat
2. tools/export-properties.ps1
3. assets/data/properties.json
4. assets/js/projects.js

Your existing Excel database must remain here:

database/DreamKey_Master_Property_Database.xlsx

NORMAL UPDATE WORKFLOW

1. Edit database/DreamKey_Master_Property_Database.xlsx
2. Save and close Excel.
3. Double-click export-properties.bat
4. Wait for "DreamKey property export completed successfully."
5. Refresh the website.

The exporter:
- reads only rows where Active = Yes
- groups listing rows by Project Slug
- calculates project-level BHK range, carpet-area range and starting price
- builds Featured/Ongoing/Ready-to-Move/New-Launch/Luxury categories from Excel flags
- writes assets/data/properties.json
- saves snapshots in database/exports
- backs up the previous website JSON in database/backups

IMPORTANT
Microsoft Excel must be installed because the one-click PowerShell exporter reads the workbook through Excel.
