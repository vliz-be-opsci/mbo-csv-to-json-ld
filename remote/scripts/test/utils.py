from pathlib import Path


def _get_test_cases_dir() -> Path:
    return Path(".").rglob("testcases").__next__()


TEST_CASES_DIR = _get_test_cases_dir()
