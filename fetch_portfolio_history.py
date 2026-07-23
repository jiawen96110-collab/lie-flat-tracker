"""Build portfolio NAV history from split-adjusted daily closes."""

from __future__ import annotations

import datetime as dt
import json
import pathlib
import time
import urllib.parse
import urllib.request


ROOT = pathlib.Path(__file__).resolve().parent


def load_config() -> dict:
    text = (ROOT / "portfolio_config.js").read_text(encoding="utf-8").strip()
    prefix = "window.PORTFOLIO_CONFIG ="
    if not text.startswith(prefix) or not text.endswith(";"):
        raise ValueError("portfolio_config.js has an unexpected format")
    config = json.loads(text[len(prefix) : -1].strip())
    for key, portfolio in config["portfolios"].items():
        total = sum(float(item["weight"]) for item in portfolio["holdings"])
        if abs(total - 100) > 0.001:
            raise ValueError(f"{key} portfolio weights total {total}, expected 100")
    return config


CONFIG = load_config()
START_DATE = dt.date.fromisoformat(CONFIG["startDate"])


def get_json(url: str) -> dict:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0", "Referer": "https://finance.qq.com"},
    )
    last_error: Exception | None = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=25) as response:
                return json.load(response)
        except Exception as error:  # network retries are intentionally bounded
            last_error = error
            if attempt < 2:
                time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"request failed after retries: {url}") from last_error


def fetch_yahoo_adjusted(symbol: str) -> dict[str, float]:
    period1 = int(dt.datetime.combine(START_DATE, dt.time(), dt.timezone.utc).timestamp())
    period2 = int((dt.datetime.now(dt.timezone.utc) + dt.timedelta(days=2)).timestamp())
    query = urllib.parse.urlencode(
        {
            "period1": period1,
            "period2": period2,
            "interval": "1d",
            "events": "div,splits",
            "includeAdjustedClose": "true",
        }
    )
    result = get_json(f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?{query}")["chart"]["result"][0]
    timestamps = result["timestamp"]
    indicators = result["indicators"]
    closes = indicators.get("adjclose", [{}])[0].get("adjclose") or indicators["quote"][0]["close"]
    timezone = dt.timezone(dt.timedelta(seconds=result["meta"].get("gmtoffset", 0)))
    return {
        dt.datetime.fromtimestamp(timestamp, timezone).date().isoformat(): float(value)
        for timestamp, value in zip(timestamps, closes)
        if value is not None
    }


def fetch_tencent_adjusted(code: str) -> dict[str, float]:
    end_date = (dt.date.today() + dt.timedelta(days=2)).isoformat()
    params = f"{code},day,{START_DATE.isoformat()},{end_date},360,qfq"
    query = urllib.parse.urlencode({"param": params})
    payload = get_json(f"https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?{query}")
    market_data = payload.get("data", {}).get(code, {})
    rows = market_data.get("qfqday") or market_data.get("day") or []
    if not rows:
        raise ValueError(f"Tencent returned no adjusted history for {code}")
    return {str(row[0]): float(row[2]) for row in rows if len(row) >= 3 and row[2] not in (None, "")}


def validate_series(label: str, values: dict[str, float]) -> None:
    if len(values) < 2:
        raise ValueError(f"{label} history is too short")
    previous = None
    for date, value in sorted(values.items()):
        if value <= 0:
            raise ValueError(f"{label} has invalid close {value} on {date}")
        if previous:
            ratio = value / previous
            if ratio < 0.65 or ratio > 1.55:
                raise ValueError(f"{label} has an unadjusted price jump on {date}: {ratio:.3f}")
        previous = value


def fetch_holding_series(holding: dict) -> dict[str, float]:
    code = holding["code"]
    if code.startswith("us"):
        values = fetch_yahoo_adjusted(holding["historySymbol"])
    else:
        values = fetch_tencent_adjusted(code)
    validate_series(code, values)
    return values


def build_portfolio(portfolio: dict, series: dict[str, dict[str, float]]) -> list[dict[str, object]]:
    holdings = portfolio["holdings"]
    dates = sorted({date for holding in holdings for date in series[holding["code"]]})
    latest_prices: dict[str, float] = {}
    points: list[dict[str, object]] = []

    for date in dates:
        for holding in holdings:
            code = holding["code"]
            if date in series[code]:
                latest_prices[code] = series[code][date]
        if len(latest_prices) != len(holdings):
            continue
        nav = sum(
            (float(holding["weight"]) / 100)
            * (latest_prices[holding["code"]] / float(holding["base"]))
            for holding in holdings
        )
        points.append({"date": date, "value": round((nav - 1) * 100, 4)})

    if not points:
        raise ValueError(f"no common history for {portfolio['name']}")
    if points[0]["date"] != START_DATE.isoformat():
        points.insert(0, {"date": START_DATE.isoformat(), "value": 0.0})
    return points


def main() -> None:
    holdings = [
        holding
        for portfolio in CONFIG["portfolios"].values()
        for holding in portfolio["holdings"]
    ]
    series = {holding["code"]: fetch_holding_series(holding) for holding in holdings}
    history = {
        key: build_portfolio(portfolio, series)
        for key, portfolio in CONFIG["portfolios"].items()
    }
    payload = {
        "generatedAt": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "source": "split-adjusted daily close",
        "startDate": START_DATE.isoformat(),
        "asOf": {key: points[-1]["date"] for key, points in history.items()},
        "portfolios": history,
    }
    output = "window.PORTFOLIO_HISTORY=" + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n"
    (ROOT / "portfolio_history.js").write_text(output, encoding="utf-8")
    for key, points in history.items():
        print(f"{key}: {len(points)} points, as of {points[-1]['date']}, latest {points[-1]['value']:.2f}%")


if __name__ == "__main__":
    main()
