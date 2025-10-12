
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


DO $$
BEGIN
  PERFORM create_hypertable('price_chart_data', 'time', chunk_time_interval => interval '1 day', if_not_exists => TRUE);
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Hypertable already exists or could not be created';
END
$$;


DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM timescaledb_information.continuous_aggregates
    WHERE view_name = 'five_min_ohlc'
  ) THEN
    CREATE MATERIALIZED VIEW five_min_ohlc
    WITH (timescaledb.continuous) AS
    SELECT
        time_bucket('5 minutes', time) AS bucket,
        first(open, time) AS open,
        max(high) AS high,
        min(low) AS low,
        last(close, time) AS close,
        sum(volume) AS volume
    FROM price_chart_data
    GROUP BY bucket
    WITH NO DATA;
  END IF;
END
$$;



DO $$
BEGIN
  PERFORM add_continuous_aggregate_policy(
    'five_min_ohlc',
    start_offset => INTERVAL '1 hour',
    end_offset => INTERVAL '1 minute',
    schedule_interval => INTERVAL '1 minute'
  );
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Policy already exists or could not be created';
END
$$;


DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM timescaledb_information.continuous_aggregates
    WHERE view_name = 'fifteen_min_ohlc'
  ) THEN
    CREATE MATERIALIZED VIEW fifteen_min_ohlc
    WITH (timescaledb.continuous) AS
    SELECT
        time_bucket('15 minutes', time) AS bucket,
        first(open, time) AS open,
        max(high) AS high,
        min(low) AS low,
        last(close, time) AS close,
        sum(volume) AS volume
    FROM price_chart_data
    GROUP BY bucket
    WITH NO DATA;
  END IF;
END
$$;



DO $$
BEGIN
  PERFORM add_continuous_aggregate_policy(
    'fifteen_min_ohlc',
    start_offset => INTERVAL '30 minute',
    end_offset => INTERVAL '5 minute',
    schedule_interval => INTERVAL '5 minute'
  );
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Policy already exists or could not be created';
END
$$;
