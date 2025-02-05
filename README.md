# Experimental CSV-W representation of data for MBO

## Necessary tools

You need to have docker installed and running for this to work.

## Data CSVs

For editing by users (except for maybe the eov.csv table):

* [dataset.csv](./dataset.csv)
* [dataset-comment.csv](./dataset-comment.csv)

End-users would ignore (or perhaps not see) all of the other files which arecurrently stored in [remote](./remote/). But they're necessary for validating the data and converting it to an RDF representation.

## Validating the data

```bash
$ make validate
=============================== Pulling latest required docker images. ===============================
...

=============================== Validating remote/dataset-metadata.json ===============================
Valid CSV-W
[INFO] [02/05/2025 12:51:16.785] [main] [CoordinatedShutdown(akka://actor-system)] Running CoordinatedShutdown with reason [ActorSystemTerminateReason]

=============================== Validating remote/eov-metadata.json ===============================
Valid CSV-W
[INFO] [02/05/2025 12:51:18.369] [main] [CoordinatedShutdown(akka://actor-system)] Running CoordinatedShutdown with reason [ActorSystemTerminateReason]
```

It will (hopefully) tell you if you get something wrong, for instance referencing an EOV which isn't defined.

## Generating ttl representation

```bash
$ make ttl
```

Files are output in the `out` directory.

## Generating a JSON-LD representation

```bash
$ make jsonld
```

Files are output in the `out` directory. 

(The JSON-LD representation is made from the TTL representation.)

N.B. Everything is lumped into one 'dataset.json' file for now.

## Example dataset.json output

```json
{
    "@graph": [
        {
            "@id": "https://w3id.org/marco-bolo/MBO_TODO_COMMENT_1",
            "http://schema.org/text": {
                "@value": "This dataset took a lot of hard work to create.",
                "@type": "https://schema.org/Text"
            },
            "http://schema.org/creator": {
                "@id": "https://example.com/someone"
            },
            "http://schema.org/parentItem": {
                "@id": "https://w3id.org/marco-bolo/mbo_TODO_DATASET_1"
            },
            "@type": "http://schema.org/Comment"
        },
        {
            "@id": "https://w3id.org/marco-bolo/mbo_TODO_DATASET_1",
            "http://schema.org/url": [
                {
                    "@value": "https://example.com/some-other-landing-page",
                    "@type": "https://schema.org/URL"
                },
                {
                    "@value": "https://example.com/some-landing-page",
                    "@type": "https://schema.org/URL"
                }
            ],
            "http://schema.org/name": {
                "@value": "Some title",
                "@type": "https://schema.org/Text"
            },
            "@type": "http://schema.org/Dataset",
            "http://schema.org/description": {
                "@value": "Some description",
                "@type": "https://schema.org/Text"
            },
            "http://schema.org/variableMeasured": [
                {
                    "@id": "https://w3id.org/marco-bolo/mbo_TODO_EOV_bio_8"
                },
                {
                    "@id": "https://w3id.org/marco-bolo/mbo_TODO_EOV_phys_3"
                },
                {
                    "@id": "https://w3id.org/marco-bolo/mbo_TODO_EOV_2"
                }
            ],
            "http://schema.org/sdPublisher": {
                "@id": "https://oceanexpert.org/expert/27172"
            },
            "http://schema.org/isBasedOn": {
                "@value": "https://example.com/some-existing-dataset",
                "@type": "https://schema.org/URL"
            },
            "https://w3id.org/marco-bolo/inProgressDataDate#TODO": {
                "@value": "2026-01-01",
                "@type": "https://schema.org/Date"
            }
        },
        {
            "@id": "https://w3id.org/marco-bolo/mbo_TODO_DATASET_2",
            "https://w3id.org/marco-bolo/inProgressDataDate#TODO": {
                "@value": "2025-10-13",
                "@type": "https://schema.org/Date"
            },
            "http://schema.org/variableMeasured": [
                {
                    "@id": "https://w3id.org/marco-bolo/mbo_TODO_EOV_bio_2"
                },
                {
                    "@id": "https://w3id.org/marco-bolo/mbo_TODO_EOV_3"
                },
                {
                    "@id": "https://w3id.org/marco-bolo/mbo_TODO_EOV_phys_5"
                }
            ],
            "http://schema.org/name": {
                "@value": "Some second title",
                "@type": "https://schema.org/Text"
            },
            "http://schema.org/sdPublisher": {
                "@id": "https://oceanexpert.org/expert/32820"
            },
            "http://schema.org/url": {
                "@value": "https://example.com/some-further-landing-page",
                "@type": "https://schema.org/URL"
            },
            "http://schema.org/description": {
                "@value": "Some second description",
                "@type": "https://schema.org/Text"
            },
            "http://schema.org/isBasedOn": [
                {
                    "@value": "https://example.com/some-existing-dataset",
                    "@type": "https://schema.org/URL"
                },
                {
                    "@value": "https://w3id.org/marco-bolo/mbo_TODO_DATASET_1",
                    "@type": "https://schema.org/URL"
                }
            ],
            "@type": "http://schema.org/Dataset"
        }
    ]
}
```

