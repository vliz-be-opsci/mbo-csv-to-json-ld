"""
listcolumnsasnodes
------------------

Converts literals of type <https://w3id.org/marco-bolo/ConvertMboIdToNode> into references to nodes in the graph.

This makes up for a limitation in the CSV on the web standard, see <https://lists.w3.org/Archives/Public/public-csvw/2016Aug/0001.html>.
"""

import click
from pathlib import Path
import rdflib


@click.command()
@click.argument("ttl_file", type=click.Path(exists=True))
def main(ttl_file: click.Path):
    """
    Loads the TTL_FILE and transforms all literals of type <https://w3id.org/marco-bolo/ConvertMboIdToNode> into references to nodes in the graph.
    """
    _convert_literals_to_nodes_in_file(Path(ttl_file))


def _convert_literals_to_nodes_in_file(ttl_file: Path) -> None:
    ttl_file = ttl_file.resolve()

    graph = rdflib.Graph()
    graph = graph.parse(ttl_file, format="ttl")

    num_to_be_converted = _get_number_to_be_converted_in_graph(graph)

    if num_to_be_converted > 0:
        graph = _update_literals_to_nodes_in_graph_assert_success(graph)
        graph.serialize(ttl_file, format="ttl")


def _update_literals_to_nodes_in_graph_assert_success(
    graph: rdflib.Graph,
) -> rdflib.Graph:
    graph.update(
        """
        DELETE {
            ?s ?p ?mboNodePID.
        }
        INSERT {
            ?s ?p ?uriNode.
        }
        WHERE {
            ?s ?p ?mboNodePID.
            FILTER(datatype(?mboNodePID) = <https://w3id.org/marco-bolo/ConvertMboIdToNode>).
            BIND (URI( CONCAT("https://w3id.org/marco-bolo/", STR(?mboNodePID))) as ?uriNode).
        }
    """
    )

    num_remaining = _get_number_to_be_converted_in_graph(graph)
    if num_remaining != 0:
        raise Exception(
            f"Failed to convert {len(results)} <https://w3id.org/marco-bolo/ConvertMboIdToNode> literals in {ttl_file}."
        )

    return graph


def _get_number_to_be_converted_in_graph(graph: rdflib.Graph) -> int:
    results = list(
        graph.query(
            """
        SELECT *
        WHERE {
            ?s ?p ?mboNodePID.
            FILTER(datatype(?mboNodePID) = <https://w3id.org/marco-bolo/ConvertMboIdToNode>).
        }
        """
        )
    )

    return len(results)


if __name__ == "__main__":
    main()
