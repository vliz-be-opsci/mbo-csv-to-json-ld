# Experimental CSV-W representation of data for MBO

## Necessary tools

If you want to play around with this, then install the following:

* [csvw-check](https://github.com/ONSdigital/csvw-check)
* [csv2rdf](https://github.com/Swirrl/csv2rdf/)

## Data CSVs

For editing by users (except for maybe the eov.csv table):

* [dataset.csv](./dataset.csv)
* [eov.csv](./eov.csv) - this would ideally be centrally maintained and references for Foreign Key checks by URL.

End-users would ignore (or perhaps not see) all of the other files. But they're necessary for validating the data and converting it to an RDF representation.

## Validating the data

```bash
$ csvw-check -s dataset-metadata.json 
Valid CSV-W
```

It will (hopefully) tell you if you get something wrong, for instance referencing an EOV which isn't defined.

## Converting to RDF

```bash
$ csv2rdf -u dataset-metadata.json -m minimal 

<https://w3id.org/marco-bolo/mbo_TODO_DATASET_1> a <http://schema.org/Dataset>;
  <http://schema.org/sdPublisher> <https://example.com/someone>;
  <http://schema.org/name> "Some title"^^<https://schema.org/Text>;
  <http://schema.org/description> "Some description"^^<https://schema.org/Text>;
  <http://schema.org/url> "https://example.com/some-landing-page"^^<https://schema.org/URL>,
    "https://example.com/some-other-landing-page"^^<https://schema.org/URL>;
  <https://w3id.org/marco-bolo/inProgressDataDate#TODO> "2026-01-01"^^<https://schema.org/Date>;
  <http://schema.org/variableMeasured> <https://w3id.org/marco-bolo/mbo_TODO_EOV_2>,
    <https://w3id.org/marco-bolo/mbo_TODO_EOV_bio_8>, <https://w3id.org/marco-bolo/mbo_TODO_EOV_phys_3> .
```

This could then be fairly trivially converted into a JSON-LD representation.