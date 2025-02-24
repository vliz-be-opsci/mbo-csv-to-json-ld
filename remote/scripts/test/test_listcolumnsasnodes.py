from pathlib import Path
from tempfile import TemporaryDirectory
import shutil

import rdflib
import pytest

from mbocsvwscripts.listcolumnsasnodes import _convert_literals_to_nodes_in_file
from .utils import TEST_CASES_DIR


def test_list_columns_values_converted_to_node_references():
    with TemporaryDirectory() as tmp_dir:
        tmp_dir = Path(tmp_dir)
        tmp_dataset_ttl = tmp_dir / "dataset.ttl"
        shutil.copy(TEST_CASES_DIR / "dataset.ttl", tmp_dataset_ttl)

        _convert_literals_to_nodes_in_file(tmp_dataset_ttl)

        graph = rdflib.Graph()
        graph = graph.parse(tmp_dataset_ttl, format="ttl")
        results = graph.query(
            """
            SELECT *
            WHERE {
                ?dataset <https://schema.org/variableMeasured> <https://w3id.org/marco-bolo/MBO_variable_measured_1> .
            }
        """
        )

        assert len(list(results)) == 3


if __name__ == "__main__":
    pytest.run()
