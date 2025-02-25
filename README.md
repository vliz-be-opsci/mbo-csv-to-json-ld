# Experimental CSV-W representation of data for MBO

## Necessary tools

You need to have docker installed and running for this to work.

## Data CSVs

For editing by users (except for maybe the eov.csv table):

* [dataset.csv](./dataset.csv)
* [dataset-comment.csv](./dataset-comment.csv)
* [variable-measured.csv](./variable-measured.csv)

End-users would ignore (or perhaps not see) all of the other files which arecurrently stored in [remote](./remote/). But they're necessary for validating the data and converting it to an RDF representation.

## Validating the data

```bash
$ make validate
=============================== Pulling latest required docker images. ===============================
...

=============================== Validating remote/dataset-metadata.json ===============================
Valid CSV-W

=============================== Validating remote/eov-metadata.json ===============================
Valid CSV-W
```

It will (hopefully) tell you if you get something wrong, for instance referencing an EOV which isn't defined.

## Generating schema.org JSON-LD representation

```bash
$ make
....
```

### Speed build

If you want speedy outputs, have multiple cores at your disposal, and don't mind incoherently timed log outputs then consider running make with a degree of parallelism (`p`): 

```bash
$ p=4 && make -j "$p" init && make -j "$p" validate jsonld
```

Files are output in the `out` directory.

Example dataset output: 

```json
{
  "@context": {
    "@import": "https://schema.org/",
    "schema": "https://schema.org/"
  },
  "@id": "https://w3id.org/marco-bolo/mbo_TODO_DATASET_2",
  "@type": "Dataset",
  "description": "Some second description",
  "distribution": {
    "@id": "https://w3id.org/marco-bolo/MBO_TODO_data_download_1"
  },
  "isBasedOn": [
    "https://example.com/some-existing-dataset",
    "https://w3id.org/marco-bolo/mbo_TODO_DATASET_1"
  ],
  "license": "https://spdx.org/licenses/CC0-1.0",
  "name": "Some second title",
  "sdPublisher": {
    "@id": "https://oceanexpert.org/expert/32820"
  },
  "url": "https://example.com/some-further-landing-page",
  "variableMeasured": {
    "@id": "https://w3id.org/marco-bolo/MBO_variable_measured_1"
  },
  "https://w3id.org/marco-bolo/inProgressDataDate#TODO": {
    "@type": "Date",
    "@value": "2025-10-13"
  }
}
```

## <https://w3id.org/marco-bolo/ConvertMboIdToNode>

This is an identifier which is used in CSV-W metadata documents and is necessary due to limitations in the CSV on the web standard. The CSV-W standard supports delimited list columns, however only supports the serialisation of these to RDF literals and does not allow them to point to RDF Nodes. As a result, we use <https://w3id.org/marco-bolo/ConvertMboIdToNode> as the datatype in the CSV-W and later convert all of these literals into resource/node references in the build process. This process also sticks `https://w3id.org/marco-bolo/` on front of the value in the column.

N.B. <https://w3id.org/marco-bolo/ConvertIriToNode> provides a similar function but more generally for IRIs.

