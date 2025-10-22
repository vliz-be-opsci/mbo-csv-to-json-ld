# Validation Reference

## Universal Required Fields

These fields are required in nearly every data type:

| Field | Purpose | Example |
|-------|---------|---------|
| `id` | Unique identifier | `mbo_dataset_001` |
| `metadataPublisherId` | Who is publishing this metadata | `mbo_person_001` |
| `metadataDescribedForActionId` | Research activity this describes | `mbo_action_001` |

## Additional Required Fields by Data Type

**Dataset**:
- `name` - Dataset title
- `description` - What the dataset contains
- `keywords` - Searchable terms
- `containsVariablesMboIds` - What was measured

**Person**:
- `name` - Full name
- `givenName` - First name  
- `familyName` - Last name

**Organization**:
- `name` - Organization name
- `organizationType` - Type of organization

**Action**:
- `name` - Activity name
- `description` - What was done
- `agentId` - Who performed the action

**Place**:
- `name` - Location name

[Additional types follow similar patterns - see full field documentation]

## Validation Rules

**ID Uniqueness**: Each `id` must be unique across all sheets. You cannot reuse the same ID for different entities.

**Reference Validation**: Fields ending in `Id` or `Ids` must reference existing records in other sheets.

**Format Validation**:
- Dates: ISO 8601 format (YYYY-MM-DD)
- URLs: Must include protocol (https://, http://)
- Emails: Standard email format
- IDs: Must match pattern `mbo_[type]_[number]`

**Multivalued Fields**: Use pipe separator (|) for multiple values: `value1|value2|value3`

## Common Validation Errors

**"Required field empty"**:
- Solution: Fill in all fields with bold headers and yellow backgrounds

**"Invalid reference"**:
- Solution: Ensure referenced IDs exist in the target sheet
- Check dropdown menus for valid options

**"Duplicate ID"**:
- Solution: Use unique IDs across all sheets
- IDs highlighted in red indicate duplicates

**"Invalid format"**:
- Solution: Check format requirements (dates, URLs, emails)
- See field tooltips for format examples

## Troubleshooting Process

1. **Check error messages**: Validation errors provide specific details about what's wrong
2. **Review field tooltips**: Hover over column headers for guidance
3. **Verify references**: Ensure referenced records exist
4. **Check required fields**: Confirm all mandatory fields are completed
5. **Contact support**: If unclear, reach out to the WP1 team

## Reference Relationships

Understanding how records connect:

- **Dataset** references **Person/Organization** (authors, publishers)
- **Dataset** references **Place** (study locations)  
- **Dataset** references **PropertyValue** (measured variables)
- **Action** references **Person/Organization** (who performed it)
- **All records** reference **Action** (research context)

Plan your data entry to create referenced records before records that reference them.
