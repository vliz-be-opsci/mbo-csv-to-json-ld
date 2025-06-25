# CSV-to-JSON-LD User Guide

*This is a place to organize information to teach and guide the casual user.*

## What is the tool?

This is a metadata publishing tool developed for **[Work Package 1 (WP1)](https://marcobolo-project.eu/work-packages/work-package-1)** of the [**MARCO-BOLO** project](https://marcobolo-project.eu/) (MARine COastal BiOdiversity Long-term Observations). WP1 focuses on data literacy and metadata flow across the project. This tool helps researchers and data managers transform metadata from CSV files into **JSON-LD** conforming to **Schema.org** and ready for harvesting by the [ODIS Catalog](https://catalog.odis.org/).

Why was this tool created? [Answer]

## Conceptually how does it work?

## 🛠 How the Tool Works (Plain Language)

This tool helps you turn metadata stored in **CSV files** into a format that can be read by machines and shared widely across the web — specifically, in a format called **JSON-LD**, which follows the **Schema.org** standard.

To make all this possible, the tool brings together four key technologies:

---

### 📘 1. LinkML: The Blueprint

**LinkML** (Linked Modeling Language) is used to define a _schema_ — basically, a blueprint that tells us:
- what kinds of metadata we expect (e.g., dataset title, creator, location)
- what format each field should have (e.g., a date, a URL, a number)
- which fields are required

We use LinkML to write these rules in a way that can be both human- and machine-readable. This schema ensures that everyone entering metadata is using the same structure.

---

### 📄 2. CSV-W: Structured Spreadsheets

Most people are comfortable using spreadsheets, so we use **CSV files** to collect metadata. But plain CSV files don’t include descriptions of what each column means. That’s where **CSV-W** (CSV on the Web) comes in.

CSV-W adds a **metadata file** alongside each CSV, which explains:
- what each column represents
- how to interpret the data (e.g., what kind of value it is, which field in the schema it maps to)

This lets us treat CSV files like structured, interoperable datasets — not just a bunch of text.

---

### 🌐 3. W3IDs: Persistent Links

Each field or class in the schema — like `creator`, `identifier`, or `dataset` — is assigned a **W3ID** (Web Identifier).

W3IDs are **permanent URLs** that act as stable identifiers for these concepts. For example:

`https://w3id.org/marco-bolo/Dataset`


Even if we update the website or move things around, this W3ID will always point to the current definition of “Dataset” in our schema. It’s like giving every concept a permanent name tag.

---

### 🧩 4. Schema.org: Speaking a Common Language

When we convert metadata into **JSON-LD**, we map it to **Schema.org** — a vocabulary used by Google, Bing, and many others to understand web content.

This means the metadata you publish:
- can be discovered by search engines
- fits into global data-sharing platforms like the [ODIS Catalog](https://catalog.odis.org)
- supports automated reuse and integration across domains

Schema.org helps your dataset "speak the same language" as other data on the internet.

---

## 🧬 Bringing It All Together

1. **You fill in CSV templates** based on the LinkML schema.
2. **CSV-W files describe** what each column in those spreadsheets means.
3. **GitHub Actions validate** your data against the schema to catch any problems.
4. **The tool converts** your metadata into Schema.org-compliant JSON-LD.
5. **W3IDs make sure** all terms have stable, referenceable definitions.
6. **You publish** the JSON-LD on the web, and it can be harvested into global catalogs.


## Suggested approach

There are multiple ways you could use this tool on GitHub and on your local machine, but we are going to focus on the workflow that we think works best across MARCO-BOLO WPs. Here are the general steps, we'll walk through each of them in detail, below.

1. Fork the GitHub Repository.
1. Add your task information (e.g. dataset) to the CSV files.
1. Submit a Pull Request to the original MARCO-BOLO repository.
1. Your work will be reviewed and merged with this central repository, which will be registered with ODIS.


### 1. Fork the GitHub Repository.


1. If you don't have one, Create a GitHub Account: https://github.com/signup
1. Create a copy of the repository, or 'fork', in which to do your work. 
	1. Click the 'fork' button, or go to https://github.com/marco-bolo/csv-to-json-ld/fork
	1. Select yourself as the owner.
	1. Click 'Create fork'.
	1. You should now have a copy of the repository at `https://github.com/your-github-username/csv-to-json-ld/`

### 2. Add your task information (e.g. dataset) to the CSV files.

*This section are merely suggestions that should be under constant revision based on what seems to be easiest for MBO users.*

1. There are a variety of ways you can do this. Here are our recommendations:
	1. If you are savvy with GitHub, clone your copy locally, use your editor of choice to update the CSV files and push the updates to your fork.
	1. If you are unfamiliar with GitHub, download a local zip file of the repo, by clicking the green `Code` button and selecting `Download ZIP`. Alternatively you can go to: `https://github.com/your-github-username/csv-to-json-ld/archive/refs/heads/main.zip`
	1. Unzip the downloaded file, and use your editor of choice to make updates to the CSV files.
	1. Upload the CSV files that have changed to your GitHub fork by clicking the `Add file` button and selecting `Upload files`. Include a meaningful 'commit' message describing the changes you have made. As long as the file name is the same, it will overwrite the copy that is hosted on GitHub.

### 3 Submit a Pull Request to the original MARCO-BOLO repository.

1. To merge your changes with the original MARCO-BOLO repository and the WP1 team, you need to make a Pull Request (PR)
1. On your GitHub fork, click the `Contribute` button and select 'Open pull request'.
1. Add a meaningful title and description of the changes you have made.
1. Click `Reviewers` to select a WP1 Team member to review and approve your changes.
1. Click `Create puill request`

### 4. Your work will be reviewed and merged with this central repository, which will be registered with ODIS.

*Very much in development*

1. A WP1 Team member will review your changes and communicate with you via GitHub about any changes that need to be made. 
1. From here, we need to figure out if the JSON-LD files should have been generated on their fork, or if we do them after merging.
1. If the latter, this would be part of the review process since it will have to clear validation to create the JSON-LD.