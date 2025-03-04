# Models

Some models written in the linkml YAML syntax which describe the MBO implementation profile of schema.org (i.e. which bits we use, and how we use them).


## Prerequisites

N.B. This requires that the build system has [make](https://www.gnu.org/software/make/), [docker](https://www.docker.com/) and [mkdocs](https://www.mkdocs.org/) installed.

## Making the docs:

```bash
make docker-pull init
make docs -j 4 # Or other level of parallelisation
```