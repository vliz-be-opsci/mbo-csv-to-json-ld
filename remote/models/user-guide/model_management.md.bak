# MARCO-BOLO Model and Tool Management Documentation

## System Overview

The MARCO-BOLO project demonstrates how small research teams can produce publication-ready, semantically rich metadata using minimal infrastructure. The system leverages familiar tools like Google Sheets for data entry, automated validation through LinkML schemas, and generates machine-readable JSON-LD that exceeds typical metadata standards for marine biodiversity projects.

But, someone has to take develop and manager this system. This protocol outlines the model, software stack, and basic management tasks.

```mermaid
flowchart TD
  subgraph LM [LinkML Schema Management]
    A[LinkML Schema Files] --> B[Generate CSV-W Schemas]
    B --> C[Update Google Apps Script]
  end
  
  subgraph GS [Google Sheets Data Entry]
    C --> D[Read remote/*.schema.json files]
    D --> E[Create/Update Google Sheets]
    E --> F[Data Entry with Validation]
    G[Lightweight Validation<br/>- Regex patterns<br/>- Dropdowns<br/>- Duplicate highlights] -.-> F
  end
  
  subgraph GHA1 [Data Import GitHub Action]
    F --> H[Export Sheets as CSV]
    H --> I[Import to Repository]
  end
  
  subgraph GHA2 [Data Processing GitHub Actions]
    I --> J[CSV-W Validation<br/>- Column structure<br/>- Data types<br/>- Foreign keys]
    J --> K[Generate JSON-LD]
    K --> L[SHACL Validation<br/>- Graph constraints<br/>- Semantic rules]
  end
  
  L --> M[Published Data]
  M --> N[ODIS Catalog Harvest]
```
**Figure 1:** CSV-to-JSON-LD Workflow: The process begins when a data model, captured as a LinkML schema, is converted to CSV-W format. A Google Apps Script is triggered by a WP1 member, as needed, to create or update Google Sheets formatting and validation rules, without overwriting the data. Researchers then enter data into these structured sheets. The sheets provide some validation through dropdowns and pattern matching. A GitHub Action automatically syncs the data on each tab to a CSV file in the project repository. This happens every night at UTC 01:00. Once synced, the processing pipeline automatically applies three layers of validation: CSV-W validation ensures data structure and types match the schema, JSON-LD generation transforms the data into semantic web format, and SHACL validation checks complex relationships and business rules. The final structured data is published as a GitHub Action artifact. However, it will soon be updated to be output into a GitHub directory that will be registered with ODIS.

## Core Components

### 1. LinkML Schema Management
**Location**: `remote/models/`
**Key Files**:
- `slots.yaml` - Field definitions and constraints
- `classes.yaml` - Entity definitions and relationships  
- `literals.yaml` - Custom data types
- `mkdocs.yml` - Documentation configuration

**Purpose**: Defines the semantic model for marine biodiversity data using LinkML, which generates CSV-W schemas for validation and JSON-LD mapping.

### 2. Google Apps Script Integration
**Location:** Google Apps Script project bound to [Google spreadsheet](https://docs.google.com/spreadsheets/d/1PBFK3LW3DAdvXdbk2v8bSdtTf87mBhabeeegwRjOBRg/edit?gid=2060946820#gid=2060946820)
**Key Script**: 

Script ID: 1bbb5P0gCpMq7FAhnMG5ec4ukF_C8F5H-EPKvfmK2bSbEUXwrOL8-PH8d
GCP Project: mbo-wp1-csv-to-json-ld (managed through Google Cloud Platform IAM)
Key Function: generateSheetsFromCSVW()
Repository Location: google-apps-script/ directory

**Purpose**: Reads CSV-W schema files from the repository and creates or updates Google Sheets with appropriate column structures, validation rules, and user guidance. Provides user-friendly data entry interface without overwriting existing data.
**Access Model:**

Script editing: Controlled through GCP IAM permissions (requires Google account)
Sheet editing: Many users can enter data without script access
Automation: Service account (github-sheets-reader) provides read access for GitHub Actions

**Deployment:** Changes made in repository are deployed to Google Apps Script using clasp push command.

### 3. CSV-W Schema Generation
**Location**: `remote/scripts/mbocsvwscripts/generatecsvwdefinitions.py`
**Purpose**: Converts LinkML schemas to CSV-W format with validation rules and semantic mappings.

### 4. Data Validation Pipeline
**Multiple Layers**:
- **Google Sheets**: Real-time validation (regex, dropdowns, duplicates)
- **CSV-W**: Structure validation (columns, types, foreign keys)
- **SHACL**: Semantic validation (graph-level constraints)

### 5. GitHub Actions Automation
**Data Import Action**: Pulls CSV data from Google Sheets into repository
**Processing Actions**: Validates data and generates JSON-LD output

## Complete Workflow Documentation

### Phase 1: Schema Updates (When Adding New Data Types)

#### Prerequisites
- Git repository access with write permissions
- Understanding of LinkML syntax
- Docker (for testing with PR containers)

#### Process

## LinkML Schema Update Process

### Prerequisites
- Git repository access with development branch permissions
- Python environment with LinkML dependencies (for local testing)
- Text editor with YAML syntax highlighting
- Google account with appropriate GCP project permissions (for Google Sheets integration)

### Phase 1: Schema Updates (Adding New Data Types)

#### 1. Plan and Document Changes
- [ ] Identify what needs to be changed (new slots, classes, constraints, etc.)
- [ ] Check for impacts on existing data (migration needs)
- [ ] Document the rationale for changes

#### 2. Create Development Branch
```bash
git checkout -b feature/model-update-$(date +%Y-%m-%d)
```

#### 3. Update LinkML Schema Files

**Add new slots** to `remote/models/slots.yaml`:
```yaml
new_slot_name:
  title: "User-Facing Column Name"
  description: "Technical definition for developers"
  required: true
  multivalued: false
  range: string
  slot_uri: schema:propertyName
  comments: |
    User-friendly explanation that becomes tooltip in Google Sheets.
    Include examples: `example1`, `example2`
    For multivalued fields: Pipe-delimited when multiple values
```

**Add/modify classes** in `remote/models/classes.yaml`:
Classes represent the CSV files that will be produced from these specifications.
```yaml
NewEntityType:
  description: "What this entity represents"
  class_uri: schema:Thing
  slots:
    - id
    - metadataPublisherId
    - metadataDescribedForActionId
    - new_slot_name
    # ... other slots in logical order
```

**Update PID mapping** in `generatecsvwdefinitions.py`:
```python
_MAP_CSV_NAME_TO_PID_URI = {
    # ... existing mappings ...
    'NewEntityType.csv': f"{_MBO_PREFIX}mbo_0000XXX",  # Use next sequential number
}
```

**Update data types** in `remote/models/literals.yaml` (rarely needed):
- [ ] Add new custom data types if required
- [ ] Only needed for specialized validation patterns

#### 4. Validate YAML Syntax
```bash
# Quick syntax check
python -c "import yaml; yaml.safe_load(open('remote/models/slots.yaml'))"
python -c "import yaml; yaml.safe_load(open('remote/models/classes.yaml'))"
```

#### 5. Test Generation Locally
```bash
# Test with your local changes
python remote/scripts/mbocsvwscripts/generatecsvwdefinitions.py -o test-output remote/models/classes.yaml

# Verify dc:description fields are present
grep -n "dc:description" test-output/remote/*.json | head -5

# Check Dublin Core context
grep -A 3 "@context" test-output/remote/Dataset.schema.json

# Clean up test
rm -rf test-output
```

#### 6. Generate CSV-W Schemas
```bash
# Generate final schemas
python remote/scripts/mbocsvwscripts/generatecsvwdefinitions.py -o temp-output remote/models/classes.yaml

# Apply the changes (WARNING: This replaces all schema files)
cp -r temp-output/remote/* remote/

# Clean up
rm -rf temp-output
```

#### 7. Validate Generated Files
- [ ] Check that all expected schema files were generated
- [ ] Verify `dc:description` fields contain your comments
- [ ] Spot-check a few schema files for correct structure
- [ ] Ensure foreign key relationships are maintained

#### 8. Update Documentation
Add new entity to `remote/models/mkdocs.yml`:
```yaml
nav:
  - CSV files:
    # ... existing entries ...
    - NewEntityType: NewEntityType.md
```

#### 9. Test Data Migration (if applicable)
- [ ] If structure changed, plan migration for existing CSV data
- [ ] Test with sample data files
- [ ] Document migration steps for users

#### 10. Commit Changes
```bash
# Stage all changes
git add remote/models/ remote/scripts/ remote/*.json remote/*.md

# Commit with descriptive message
git commit -m "Add NewEntityType to LinkML model

- Added slots: new_slot_name
- Updated CSV-W schemas with validation rules
- Added documentation structure
- [Any other significant changes]"
```

#### 11. Create Pull Request
- [ ] Push branch to GitHub: `git push origin feature/model-update-$(date +%Y-%m-%d)`
- [ ] Create pull request with detailed description
- [ ] Wait for PR-specific Docker container to build
- [ ] Test with PR container if needed: `docker pull ghcr.io/marco-bolo/csv-to-json-ld-tools:pr-XX`

#### 12. Review and Merge
- [ ] Address review feedback
- [ ] Ensure CI/CD validation passes
- [ ] Merge to main branch
- [ ] Update documentation if needed

### Phase 2: Google Sheets Integration (After Schema Merge)

#### Prerequisites
- Schema changes merged to main branch
- Access to Google Apps Script project through GCP IAM
- Google Sheets with appropriate sharing permissions

#### Process

1. **Verify Google Apps Script URLs** (if needed)
   Ensure these point to main branch in the script constants:
   ```javascript
   const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/marco-bolo/csv-to-json-ld/main/remote/";
   const SLOT_YAML_URL = "https://raw.githubusercontent.com/marco-bolo/csv-to-json-ld/main/remote/models/slots.yaml";
   ```

2. **Run Sheet Generation Script**
   - Open [MARCO-BOLO spreadsheet](https://docs.google.com/spreadsheets/d/1PBFK3LW3DAdvXdbk2v8bSdtTf87mBhabeeegwRjOBRg/edit)
   - Go to `Extensions` → `Apps Script`
   - Select `generateSheetsFromCSVW` function
   - Click `Run`
   - Monitor execution logs for errors

3. **Verify Sheet Structure**
   - Check that all columns are present for new entity type
   - Verify required fields are highlighted (bold headers, yellow background)
   - Test dropdown validations for foreign keys
   - Confirm header tooltips show user guidance from `comments` field

### Validation Checklist

Before committing, verify:
- [ ] YAML files parse without errors
- [ ] Local generation completes successfully  
- [ ] Generated schemas contain dc:description fields
- [ ] Dublin Core namespace is present in @context
- [ ] Foreign key relationships are intact
- [ ] Comments provide clear user guidance with examples
- [ ] Multivalued fields mention pipe delimiters
- [ ] New sheets are created successfully in Google Sheets
- [ ] Validation rules work correctly in sheets

### Common Troubleshooting

**"AttributeError: 'list' object has no attribute 'strip'"**
- Comments in LinkML are always lists, even single comments
- Use: `comment_text = "\n".join(comment.strip() for comment in slot.comments)`

**"yaml.parser.ParserError: did not find expected key"**
- Check indentation around the reported line (spaces only, no tabs)
- Ensure all keys have colons
- Verify quotes are properly closed

**Missing dc:description in CSV-W output**
- Check that generation script handles comments correctly
- Verify Dublin Core namespace is in @context
- Ensure comments exist in the LinkML slot definition

**Google Apps Script 404 errors**
- Verify schema files exist in main branch
- Check that file URLs are accessible
- Confirm GitHub repository is public or script has access

**Foreign key validation errors**
- Update CSV file references in comments after structural changes
- Check that referenced classes still exist
- Verify range definitions point to correct classes
- Ensure target sheets exist before creating source sheets

### Emergency Rollback

If changes break production:
```bash
# Revert to previous working commit
git log --oneline  # Find last working commit hash
git revert [commit-hash]
git push origin main

# Re-run Google Apps Script to update sheets
```
### Phase 3: Data Entry and Processing

#### Data Entry Process
1. **Users enter data** in Google Sheets with real-time validation
2. **GitHub Action imports** sheet data as CSV files to repository
3. **Processing pipeline** validates and transforms data:
   - CSV-W validation (structure, types, foreign keys)
   - JSON-LD generation (semantic mapping)
   - SHACL validation (graph-level constraints)
4. **Published data** becomes available for catalog harvesting

## Key Files and Locations

### LinkML Schema Files
```
remote/models/
├── slots.yaml              # Field definitions and validation rules
├── classes.yaml            # Entity types and their slot assignments  
├── literals.yaml           # Custom data types (rarely modified)
└── mkdocs.yml              # Documentation structure
```

### Generated CSV-W Schemas
```
remote/
├── Action.schema.json      # CSV-W schema for Action data
├── Dataset.schema.json     # CSV-W schema for Dataset data
├── Document.schema.json    # CSV-W schema for Document data
└── [Entity].schema.json    # One schema file per entity type
```

### Processing Scripts
```
remote/scripts/mbocsvwscripts/
└── generatecsvwdefinitions.py  # LinkML to CSV-W converter
```

### Google Apps Script
- **Project**: Linked to main Google Spreadsheet
- **Key Function**: `generateSheetsFromCSVW()`
- **Purpose**: Reads CSV-W schemas and creates/updates sheet structure

## Validation Layers Explained

### Layer 1: Google Sheets (Real-time)
**When**: During data entry
**What**:
- Regex pattern validation (email formats, ID patterns)
- Dropdown lists for foreign key references
- Duplicate ID highlighting
- Required field enforcement

**Limitations**: Basic validation only, can't enforce complex relationships

### Layer 2: CSV-W (Structural)  
**When**: After data import to repository
**What**:
- Column presence and naming
- Data type validation (dates, numbers, URLs)
- Foreign key reference checking
- Cardinality constraints (single vs. multiple values)

**Purpose**: Ensures data structure matches schema before semantic processing

### Layer 3: SHACL (Semantic)
**When**: After JSON-LD generation
**What**:
- Graph-level constraint validation
- Complex relationship rules
- Semantic consistency checking
- Domain-specific business rules

**Purpose**: Validates the meaning and relationships in the final semantic data

## Troubleshooting Guide

### Common LinkML Issues

**YAML Syntax Errors**
```
Error: yaml.parser.ParserError: did not find expected key
```
- Check indentation (spaces only, no tabs)
- Ensure all keys end with colons
- Verify quotes are properly closed

**Missing Slot References**
```
Error: Slot 'unknown_slot' referenced but not defined
```
- Add slot definition to `slots.yaml`
- Check spelling in class slot lists
- Verify slot is properly indented

**PID Mapping Issues**
```
Error: No PID found for Entity.csv
```
- Add mapping to `_MAP_CSV_NAME_TO_PID_URI` in `generatecsvwdefinitions.py`
- Use sequential numbering (`mbo_0000XXX`)
- Match CSV filename exactly

### Google Apps Script Issues

**404 Errors When Fetching Schemas**
```
Exception: Request failed for https://raw.githubusercontent.com returned code 404
```
- Verify schema files exist in repository
- Check branch name in URLs (should be `main`)
- Confirm files were committed and pushed

**Sheet Creation Failures**
```
Error: Cannot create sheet with name 'Entity'
```
- Check for duplicate sheet names
- Verify Google Apps Script has edit permissions
- Ensure spreadsheet isn't at sheet limit

**Foreign Key Dropdown Issues**
- Target sheet must exist before source sheet
- Column names must match exactly
- Foreign key definitions must be in CSV-W schema

### Data Processing Issues

**CSV-W Validation Failures**
- Check column names match schema exactly
- Verify data types (dates as YYYY-MM-DD, numbers without commas)
- Ensure foreign key values exist in target sheets

**JSON-LD Generation Errors**
- Usually indicates CSV-W validation issues
- Check for required fields with empty values
- Verify multivalued fields use pipe delimiters

## Backup and Recovery

### Schema Backup
- All schema files are version-controlled in Git
- Each change creates new commit with full history
- Generated schemas can be recreated from LinkML source

### Data Backup
- Google Sheets data is automatically synced
- Repository contains CSV snapshots after each import
- JSON-LD outputs are preserved in processing pipeline

### Recovery Process
1. **Schema corruption**: Revert to last known good commit
2. **Sheet structure issues**: Re-run Google Apps Script generation
3. **Data loss**: Restore from repository CSV files or Google Sheets revision history

## Handover Checklist

For someone taking over this system:

### Immediate Access Needed
- [ ] GitHub repository write access
- [ ] Google Apps Script project access  
- [ ] Google Spreadsheet edit permissions
- [ ] Understanding of LinkML syntax basics

### Key Concepts to Understand
- [ ] LinkML schema structure and validation
- [ ] CSV-W format and its relationship to JSON-LD
- [ ] Google Apps Script execution and debugging
- [ ] Multi-layer validation approach
- [ ] GitHub Actions workflow for data processing

### Essential Skills
- [ ] YAML syntax and debugging
- [ ] Basic Python for script modifications
- [ ] Google Apps Script JavaScript
- [ ] Git workflow for collaborative development
- [ ] Understanding of semantic web concepts (RDF, JSON-LD)

### Emergency Contacts
- Previous system maintainer
- LinkML community (GitHub issues, Slack)
- MARCO-BOLO project stakeholders

### First Steps When Taking Over
1. Clone repository and explore file structure
2. Run schema generation locally to understand process
3. Test Google Apps Script execution in read-only mode
4. Review recent commit history to understand change patterns
5. Identify and contact key users/stakeholders
6. Set up monitoring for GitHub Actions failures

## Monitoring and Maintenance

### Regular Tasks
- Monitor GitHub Actions for processing failures
- Review Google Apps Script execution logs
- Update schema documentation when changes are made
- Respond to user questions about data entry

### Signs of Problems
- Users reporting validation errors in sheets
- GitHub Actions consistently failing
- 404 errors from Google Apps Script
- Inconsistent data between sheets and repository

### Update Frequency
- Schema updates: As needed when new data types required
- Google Apps Script: Only when schema structure changes significantly  
- Documentation: With each schema update
- User training: When interface changes affect data entry process



## LinkML Slot Definition Reference

Understanding the components of a slot definition:

```yaml
slotName:                           # The internal identifier for this slot
  identifier: true                  # OPTIONAL: Makes this the primary key (only one per class)
  title: "Human Readable Title"     # REQUIRED: Column header in CSV files
  description: |                    # OPTIONAL: Technical definition of the field
    Formal definition of what this slot represents.
    Used for technical documentation.
  required: true                    # REQUIRED: true/false - whether field is mandatory
  multivalued: false               # REQUIRED: true/false - whether multiple values allowed
  range: string                    # REQUIRED: Data type (string/decimal/date/uri/ClassName)
  slot_uri: schema:name            # OPTIONAL: Maps to schema.org or other vocabulary property
  pattern: "^[A-Z]+$"              # OPTIONAL: Regex validation pattern for string values
  minimum_value: 0                 # OPTIONAL: For numeric ranges
  maximum_value: 100               # OPTIONAL: For numeric ranges
  subproperty_of: parentSlot       # OPTIONAL: Inherits from another slot
  designates_type: true            # OPTIONAL: Used for rdf:type assignments
  implicit_prefix: schema          # OPTIONAL: Prepends namespace to values
  comments: |                      # OPTIONAL: User-friendly guidance (becomes dc:description)
    Clear explanation for data entry users.
    Include examples and formatting guidance.
    For multivalued fields, mention pipe delimiter.
  extensions:                      # OPTIONAL: Custom CSV-W extensions
    csvw_about_url: "#Fragment"    # Changes the subject URI for this property
    csvw_virtual_triples: |        # Adds extra RDF triples
      <> schema:additionalType <#CustomType>.
```
## Validation Checklist

Before committing, verify:
- [ ] YAML files parse without errors
- [ ] Local generation completes successfully  
- [ ] Generated schemas contain dc:description fields
- [ ] Dublin Core namespace is present in @context
- [ ] Foreign key relationships are intact
- [ ] Comments provide clear user guidance
- [ ] Examples are consistent and helpful
- [ ] Multivalued fields mention pipe delimiters

## Troubleshooting

### "AttributeError: 'list' object has no attribute 'strip'"
- Comments in LinkML are always lists, even single comments
- Use: `comment_text = "\n".join(comment.strip() for comment in slot.comments)`

### "yaml.parser.ParserError: did not find expected key"
- Check indentation around the reported line
- Ensure all keys have colons
- Verify no mixed tabs/spaces

### Missing dc:description in output
- Check that generation script was modified to handle comments
- Verify Dublin Core namespace is in @context
- Ensure comments exist in the LinkML slot definition

### Foreign key validation errors
- Update CSV file references in comments after structural changes
- Check that referenced classes still exist
- Verify range definitions point to correct classes


### Field Explanations

**Basic Identity:**
- `slotName`: Internal name used in code and references
- `title`: What users see as column header (add `*` for required fields)
- `description`: Technical definition for developers/documentation

**Constraints:**
- `required`: Enforces mandatory fields in validation
- `multivalued`: Allows pipe-delimited multiple values (`value1|value2|value3`)
- `range`: Defines data type or references another class for relationships
- `pattern`: Regex validation for string formats
- `minimum_value`/`maximum_value`: Numeric bounds

**Semantic Mapping:**
- `slot_uri`: Maps to standard vocabularies (schema.org, Dublin Core, etc.)
- `subproperty_of`: Inherits behavior from parent slot
- `designates_type`: For rdf:type assignments (organization types, audience types)
- `implicit_prefix`: Automatically prepends namespace to values

**User Experience:**
- `comments`: Becomes `dc:description` in CSV-W, provides user guidance
- `extensions.csvw_about_url`: Changes RDF subject for this property
- `extensions.csvw_virtual_triples`: Adds custom RDF relationships

### Common Patterns

**Simple text field:**
```yaml
name:
  title: "Name"
  required: true
  multivalued: false
  range: string
  slot_uri: schema:name
```

**Reference to another entity:**
```yaml
authorId:
  title: "Author (mPID)"
  required: false
  multivalued: false
  range: PersonOrOrganization
  slot_uri: schema:author
```

**Multivalued with validation:**
```yaml
keywords:
  title: "Keywords"
  required: false
  multivalued: true
  range: string
  slot_uri: schema:keywords
  comments: |
    Separate multiple keywords with '|'
    For example: Marine Biology|Climate Change
```

## Documentation Updates

After major model changes:
- [ ] Update user documentation
- [ ] Update example CSV files if structure changed
- [ ] Notify users of breaking changes
- [ ] Update any training materials