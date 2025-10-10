-- enable timescale extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE IF NOT EXISTS price_chart_data (
    time TIMESTAMPTZ NOT NULL,
    symbol TEXT NOT NULL,
  interval TEXT NOT NULL,
  open NUMERIC(18,8) NOT NULL,
  high NUMERIC(18,8) NOT NULL,
  low NUMERIC(18,8) NOT NULL,
  close NUMERIC(18,8) NOT NULL,
  volume NUMERIC(18,8) NOT NULL,
  PRIMARY KEY (time, symbol, interval)
);

-- convert it to hypertable
SELECT create_hypertable('price_chart_data', 'time', if_not_exists => TRUE);