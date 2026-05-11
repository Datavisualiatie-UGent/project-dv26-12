import pandas as pd
import json
import sys
from collections import Counter
from typing import Iterable

SURVEY_CSV_PATH = (
    "src/data/stack-overflow-developer-survey-2025/survey_results_public.csv"
)


def _iter_multivalue(series: pd.Series, mapping: dict | None = None) -> Iterable[str]:
    values = series.dropna().astype(str)
    for cell in values:
        # Stack Overflow survey multiselect columns are semicolon-separated.
        for item in cell.split(";"):
            item = item.strip()
            if not item:
                continue
            if mapping is not None:
                item = mapping.get(item, item)
            yield item


def _counts_single(series: pd.Series) -> Counter:
    values = series.dropna().astype(str).map(str.strip)
    values = values[values != ""]
    return Counter(values.tolist())


def _to_records_from_series(
    series: pd.Series,
    *,
    mapping: dict | None = None,
    expected_order: list[str] | None = None,
    sort: str = "count_desc",
) -> list[dict]:
    values = series.dropna().astype(str).map(str.strip)
    values = values[values != ""]

    if mapping is not None:
        values = values.map(mapping).dropna()

    if expected_order is not None:
        values = pd.Categorical(values, categories=expected_order, ordered=True)
        counts = pd.Series(values).value_counts(sort=False)
        return [
            {"category": str(category), "count": int(count)}
            for category, count in counts.items()
            if count > 0
        ]

    counts = values.value_counts()
    items = list(counts.items())

    if sort == "count_desc":
        items.sort(key=lambda kv: (-kv[1], kv[0]))
    elif sort == "age_asc":
        items.sort(key=lambda kv: (_age_sort_key(kv[0]), kv[0]))
    else:
        raise ValueError(f"Unknown sort: {sort}")

    return [{"category": k, "count": int(v)} for k, v in items]


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

    age_mapping = {
        "18-24 years old": "18-24",
        "25-34 years old": "25-34",
        "35-44 years old": "35-44",
        "45-54 years old": "45-54",
        "55-64 years old": "55-64",
        "65 years or older": "65+",
    }
    expected_age_order = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"]

    # Include both straight and curly apostrophe variants to match CSV labels
    education_mapping = {
        "Master's degree (M.A., M.S., M.Eng., MBA, etc.)": "Master",
        "Master’s degree (M.A., M.S., M.Eng., MBA, etc.)": "Master",
        "Associate degree (A.A., A.S., etc.)": "Associate",
        "Bachelor's degree (B.A., B.S., B.Eng., etc.)": "Bachelor",
        "Bachelor’s degree (B.A., B.S., B.Eng., etc.)": "Bachelor",
        "Some college/university study without earning a degree": "Some College",
        "Professional degree (JD, MD, Ph.D, Ed.D, etc.)": "Professional",
        "Secondary school (e.g. American high school, German Realschule or Gymnasium, etc.)": "Secondary",
        "Other (please specify):": "Other",
        "Primary/elementary school": "Primary",
    }
    expected_education_order = [
        "Primary",
        "Secondary",
        "Associate",
        "Bachelor",
        "Master",
        "Professional",
        "Other",
    ]

    employment_mapping = {
        "Employed": "Employed",
        "Independent contractor, freelancer, or self-employed": "Self-employed",
        "Student": "Student",
        "Retired": "Retired",
        "Not employed": "Not employed",
        "I prefer not to say": "Prefer not to say",
    }
    expected_employment_order = [
        "Employed",
        "Self-employed",
        "Student",
        "Retired",
        "Not employed",
        "Prefer not to say",
    ]

    profession_mapping = {
        "I am a developer by profession": "Developer",
        "I am not primarily a developer, but I write code sometimes as part of my work/studies": "Non-Developer (Code Writer)",
        "I used to be a developer by profession, but no longer am": "Former Developer",
        "I code primarily as a hobby": "Hobbyist",
        "I work with developers or my work supports developers but am not a developer by profession": "Support Role",
        "I am learning to code": "Learning",
    }
    expected_profession_order = [
        "Developer",
        "Non-Developer (Code Writer)",
        "Former Developer",
        "Hobbyist",
        "Support Role",
        "Learning",
    ]

    language_mapping = {
        "Bash/Shell (all shells)": "Shell",
        "Visual Basic (.Net)": "VB.NET",
    }

    output = {
        "age": {
            "label": "Age",
            "items": _to_records_from_series(
                df["Age"],
                mapping=age_mapping,
                expected_order=expected_age_order,
            ),
        },
        "education": {
            "label": "Education",
            "items": _to_records_from_series(
                df["EdLevel"],
                mapping=education_mapping,
                expected_order=expected_education_order,
            ),
        },
        "employment": {
            "label": "Employment",
            "items": _to_records_from_series(
                df["Employment"],
                mapping=employment_mapping,
                expected_order=expected_employment_order,
            ),
        },
        "language": {
            "label": "Language (worked with)",
            "items": _to_records(
                Counter(
                    _iter_multivalue(
                        df["LanguageHaveWorkedWith"],
                        mapping=language_mapping,
                    )
                ),
                sort="count_desc",
            ),
        },
        "profession": {
            "label": "Profession",
            "items": _to_records_from_series(
                df["MainBranch"],
                mapping=profession_mapping,
                expected_order=expected_profession_order,
            ),
        },
    }

    json.dump(output, sys.stdout)


if __name__ == "__main__":
    main()
