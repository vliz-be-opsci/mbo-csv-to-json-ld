# Data Entry Guide

## Getting Access

Data entry happens through Google Sheets with built-in validation and guidance. Contact the MARCO-BOLO WP1 team for access to the shared spreadsheet.

**Spreadsheet Link**: [MARCO-BOLO Data Collection](https://docs.google.com/spreadsheets/d/1PBFK3LW3DAdvXdbk2v8bSdtTf87mBhabeeegwRjOBRg/edit)

## Understanding the Sheets

Each tab in the spreadsheet represents a different type of information:

- **Dataset**: Information about your research datasets
- **Person**: Researchers, contributors, and other individuals  
- **Organization**: Institutions, research groups, agencies
- **Action**: Research activities, data collection efforts
- **Place**: Geographic locations and study sites
- **Document**: Publications, reports, documentation
- And others for specific metadata types

## Data Entry Process

### 1. Start with Core Information

Before describing datasets, you'll need to establish:

**Person record** (for yourself as metadata publisher):
- Use the Person tab to create your researcher profile
- Note your assigned ID (e.g., `mbo_person_001`) - you'll reference this elsewhere

**Organization record** (for your institution):
- Use the Organization tab for your research institution  
- Note the assigned ID for references

**Action record** (for your research activity):
- Use the Action tab to describe the project or task generating this metadata
- Note the assigned ID - every other record will reference this

### 2. Enter Dataset Information

Once core records exist:
- Go to the Dataset tab
- Fill in required fields (marked with bold headers and yellow background)
- Reference your Person ID in `metadataPublisherId`
- Reference your Action ID in `metadataDescribedForActionId`

### 3. Use Built-in Validation

The sheets provide real-time help:
- **Dropdown menus** for fields that reference other records
- **Header tooltips** (hover over headers) with detailed guidance
- **Format validation** for dates, emails, URLs
- **Duplicate detection** highlights repeated IDs in red

### 4. Required vs Optional Fields

**Required fields** have:
- Bold column headers
- Yellow background color
- Will cause validation errors if left empty

**Optional fields** provide additional context and improve discoverability but aren't mandatory.

## Field Relationships

Many fields reference other records using IDs:

- `authorId` → Person or Organization record
- `spatialCoveragePlaceMboId` → Place record  
- `metadataDescribedForActionId` → Action record

Use the dropdown menus to select valid references, or type the ID directly if you know it.

## Data Quality Tips

**Use consistent naming**: Keep terminology consistent across related records.

**Provide examples in multivalued fields**: Use pipe separators (|) for multiple values: `Marine Biology|Climate Change|Biodiversity`

**Include comprehensive descriptions**: Rich metadata helps others discover and understand your data.

**Reference existing records**: Before creating new Person or Organization records, check if they already exist.

## Getting Help

**Column tooltips**: Hover over any column header for detailed guidance about that field.

**Validation feedback**: If cells highlight in red or validation fails, read error messages carefully.

**Contact support**: For questions about data entry, contact the MARCO-BOLO WP1 team.

## After Data Entry

Your data is automatically synchronized with the processing system nightly. The WP1 team monitors data validation and will contact you if any issues need resolution.

Validated data becomes part of the MARCO-BOLO metadata catalog and is made discoverable through international research platforms.
