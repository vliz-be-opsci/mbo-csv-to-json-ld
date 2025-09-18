# Frequently Asked Questions

## Data Entry

**Q: How do I get access to enter data?**
A: Contact the MARCO-BOLO WP1 team for access to the shared Google Spreadsheet.

**Q: Can I work on this offline?**
A: No, the Google Sheets system requires internet access for real-time validation and collaboration.

**Q: What if I make a mistake?**
A: Google Sheets maintains version history. Small errors can be corrected directly. For major issues, contact the WP1 team.

**Q: How do I update an existing record?**
A: Simply edit the relevant cells in the spreadsheet. Changes sync automatically.

## Technical Questions

**Q: What happens to my data after I enter it?**
A: Data is automatically synchronized nightly, validated against schemas, and converted to JSON-LD format for publication in research catalogs.

**Q: Can I download my data in other formats?**
A: The system produces JSON-LD output. For other formats, use Google Sheets' built-in export options or contact the WP1 team.

**Q: How do I cite this tool or the resulting metadata?**
A: Citation guidelines are being developed. Contact the WP1 team for current recommendations.

## Validation and Errors

**Q: Why are some fields highlighted in red?**
A: Red highlighting indicates validation errors - usually duplicate IDs or missing required fields.

**Q: What does "pipe-delimited" mean?**
A: Use the | character to separate multiple values: `Marine Biology|Climate Change|Biodiversity`

**Q: I can't find the ID I'm looking for in a dropdown menu.**
A: The referenced record may not exist yet. Create it first in the appropriate sheet, then return to reference it.

## System Questions

**Q: Who maintains this system?**
A: The MARCO-BOLO Work Package 1 team maintains the system architecture and provides user support.

**Q: Is my data private?**
A: Data entered into the system is intended for publication and discovery through research catalogs. Contact the WP1 team if you have privacy concerns.

**Q: Can I use this system for non-MARCO-BOLO projects?**
A: The system is designed for MARCO-BOLO but uses open standards. Contact the WP1 team to discuss other applications.

**Q: What browsers work best?**
A: Google Sheets works best in Chrome, but other modern browsers should work. Ensure JavaScript is enabled.

## Getting Additional Help

**For data entry questions**: Check field tooltips first, then contact the WP1 team
**For technical issues**: Contact the system administrators
**For project questions**: Reach out to MARCO-BOLO Work Package 1 leadership

## Quick Reference

**Find and replace across files**: Use a local copy with VS Code (Ctrl-Shift-F, target *.csv files)
**ID format**: `mbo_[type]_[number]` (e.g., `mbo_dataset_001`)
**Multivalued separator**: Pipe character (|)
**Date format**: YYYY-MM-DD
**URL format**: Include protocol (https:// or http://)
