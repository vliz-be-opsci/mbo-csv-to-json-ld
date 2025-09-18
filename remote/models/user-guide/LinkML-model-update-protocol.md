# MARCO-BOLO Model Update Protocol

## Overview
This protocol covers updating the LinkML model definitions and regenerating CSV-W schemas for the MARCO-BOLO project. Follow these steps to ensure consistent, validated changes.

## Prerequisites
- Git repository access with development branch
- Docker installed and accessible
- Python environment with LinkML dependencies (optional for local testing)
- Text editor with YAML syntax highlighting

## Step-by-Step Process

### 1. Plan and Document Changes
- [ ] Identify what needs to be changed (new slots, classes, constraints, etc.)
- [ ] Check for impacts on existing data (migration needs)
- [ ] Document the rationale for changes

### 2. Create Development Environment
```bash
# Create and switch to development branch
git checkout -b feature/model-update-YYYY-MM-DD
```

### 3. Update Model Files

#### 3.1 Update slots.yaml
- [ ] Add/modify slot definitions in `remote/models/slots.yaml`
- [ ] Ensure consistent formatting (use blank lines between slots for readability)
- [ ] Add `comments` field for user guidance:
  ```yaml
  slot_name:
    # ... other properties
    comments: |
      User-friendly explanation here
      For example: `value1`, `value2`
      Pipe-delimited when there are multiple values (if multivalued)
  ```

#### 3.2 Update classes.yaml (if needed)
- [ ] Modify class definitions in `remote/models/classes.yaml`
- [ ] Update slot assignments to classes
- [ ] Ensure abstract classes are properly marked

#### 3.3 Update literals.yaml (if needed)
- [ ] Add new data types if required
- [ ] Rarely needed unless adding new custom types

### 4. Validate YAML Syntax
```bash
# Quick syntax check
python -c "import yaml; yaml.safe_load(open('remote/models/slots.yaml'))"
python -c "import yaml; yaml.safe_load(open('remote/models/classes.yaml'))"
```

### 5. Test Generation Locally
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

### 6. Apply Changes
```bash
# Generate final schemas
python remote/scripts/mbocsvwscripts/generatecsvwdefinitions.py -o temp-output remote/models/classes.yaml

# Apply the changes (WARNING: This replaces all schema files)
cp -r temp-output/remote/* remote/

# Clean up
rm -rf temp-output
```

### 7. Validate Generated Files
- [ ] Check that all expected schema files were generated
- [ ] Verify `dc:description` fields contain your comments
- [ ] Spot-check a few schema files for correct structure
- [ ] Ensure foreign key relationships are maintained

### 8. Test Data Migration (if applicable)
- [ ] If structure changed, plan migration for existing CSV data
- [ ] Test with sample data files
- [ ] Document migration steps for users

### 9. Commit Changes
```bash
# Stage all changes
git add remote/models/
git add remote/scripts/mbocsvwscripts/generatecsvwdefinitions.py  
git add remote/

# Commit with descriptive message
git commit -m "Update LinkML model: [brief description]

- Added/modified slots: [list key changes]
- Updated user guidance comments
- Regenerated CSV-W schemas with dc:description fields
- [Any other significant changes]"
```

### 10. Create Pull Request
- [ ] Push branch to GitHub
- [ ] Create pull request with detailed description
- [ ] Wait for PR-specific Docker container to build
- [ ] Test with PR container if needed: `docker pull ghcr.io/marco-bolo/csv-to-json-ld-tools:pr-XX`

### 11. Review and Merge
- [ ] Address review feedback
- [ ] Ensure CI/CD validation passes
- [ ] Merge to main branch
- [ ] Update documentation if needed

## Common Pitfalls to Avoid

### YAML Formatting Issues
- **Mixed tabs/spaces**: Use only spaces for indentation
- **Inconsistent comment format**: Always use `comments: |` for multi-line
- **Missing colons**: Each key must have a colon
- **Inconsistent pipe delimiter guidance**: All multivalued fields should mention pipe delimiters

### LinkML Model Issues
- **Missing foreign key relationships**: Ensure ranges point to correct classes
- **Inconsistent mPID references**: Use standard format "mPID(s) from first column of [File].csv"
- **Wrong CSV file references**: Double-check that comments reference correct CSV files

### Generation Script Issues
- **Forgetting to handle list comments**: Comments are always lists in LinkML, even for single values
- **Missing Dublin Core context**: Ensure both csvw and dc namespaces are in @context
- **Not testing locally first**: Always test generation before applying changes

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