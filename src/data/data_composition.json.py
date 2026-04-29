import json
import sys
from collections import Counter
from typing import Iterable

import pandas as pd


SURVEY_CSV_PATH = (
    "src/data/stack-overflow-developer-survey-2025/survey_results_public.csv"
)


def _iter_multivalue(series: pd.Series) -> Iterable[str]:
    values = series.dropna().astype(str)
    for cell in values:
        # Stack Overflow survey multiselect columns are semicolon-separated.
        for item in cell.split(";"):
            item = item.strip()
            if item:
                yield item


def _counts_single(series: pd.Series) -> Counter:
    values = series.dropna().astype(str).map(str.strip)
    values = values[values != ""]
    return Counter(values.tolist())


def _age_sort_key(age_label: str) -> tuple[int, str]:
    s = (age_label or "").strip()

    if s.lower().startswith("under "):
        return (0, s)

    # Typical forms: "18-24 years old", "65 years or older"
    first = "".join(ch for ch in s.split(" ", 1)[0] if ch.isdigit() or ch == "-")
    if first:
        try:
            if "-" in first:
                return (int(first.split("-", 1)[0]), s)
            return (int(first), s)
        except ValueError:
            pass

    return (10_000, s)


def _to_records(counter: Counter, *, sort: str) -> list[dict]:
    items = list(counter.items())

    if sort == "count_desc":
        items.sort(key=lambda kv: (-kv[1], kv[0]))
    elif sort == "age_asc":
        items.sort(key=lambda kv: (_age_sort_key(kv[0]), kv[0]))
    else:
        raise ValueError(f"Unknown sort: {sort}")

    return [{"category": k, "count": int(v)} for k, v in items]


def main() -> None:
    df = pd.read_csv(SURVEY_CSV_PATH, low_memory=False)

    output = {
        "age": {
            "label": "Age",
            "items": _to_records(_counts_single(df["Age"]), sort="age_asc"),
        },
        "education": {
            "label": "Education",
            "items": _to_records(_counts_single(df["EdLevel"]), sort="count_desc"),
        },
        "employment": {
            "label": "Employment",
            "items": _to_records(_counts_single(df["Employment"]), sort="count_desc"),
        },
        "language": {
            "label": "Language (worked with)",
            "items": _to_records(
                Counter(_iter_multivalue(df["LanguageHaveWorkedWith"])),
                sort="count_desc",
            ),
        },
        "profession": {
            "label": "Profession (DevType)",
            "items": _to_records(
                Counter(_iter_multivalue(df["DevType"])),
                sort="count_desc",
            ),
        },
    }

    json.dump(output, sys.stdout)


if __name__ == "__main__":
    main()
