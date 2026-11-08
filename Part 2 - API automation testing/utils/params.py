import pytest


def as_params(rows):
    """Turns DDT rows into pytest params.

    - Every row gets a readable name in the report: "TC-CREATE-01 circle".
    - A row with a "bug" key is marked as a KNOWN BUG (xfail):
      the run stays green, the report shows the bug ID, and strict=True makes the test
      FAIL the day the bug is fixed, so we remember to remove the mark.
    """
    params = []
    for row in rows:
        marks = [pytest.mark.xfail(reason=row["bug"], strict=True)] if "bug" in row else []
        params.append(pytest.param(row, id=f"{row['id']} {row['title']}", marks=marks))
    return params
