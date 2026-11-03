#!/usr/bin/env python3
"""
Supabase Keep-Alive Heartbeat Script
-----------------------------------
Prevents Supabase free-tier project from pausing due to inactivity.
Runs lightweight queries to register active traffic on the PostgreSQL database
and/or Supabase REST API.
"""

import os
import sys
import time
from datetime import datetime, timezone

def clean_db_url(url):
    """Normalizes SQLAlchemy connection strings (e.g., postgresql+psycopg://) to standard postgresql://"""
    if not url:
        return url
    if url.startswith("postgresql+psycopg://"):
        return url.replace("postgresql+psycopg://", "postgresql://", 1)
    if url.startswith("postgresql+psycopg2://"):
        return url.replace("postgresql+psycopg2://", "postgresql://", 1)
    return url

def ping_via_postgres(raw_db_url):
    print("Connecting directly to Supabase PostgreSQL database...")
    db_url = clean_db_url(raw_db_url)
    start_time = time.time()
    
    # Method 1: psycopg v3
    try:
        import psycopg
        with psycopg.connect(db_url, connect_timeout=15) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT NOW() AS server_time, current_database() AS db_name;")
                row = cur.fetchone()
                latency_ms = round((time.time() - start_time) * 1000, 2)
                print(f"[SUCCESS] PostgreSQL heartbeat successful! (Latency: {latency_ms}ms)")
                print(f"          Server Time: {row[0]}")
                print(f"          Database: {row[1]}")
                
                # Check tables if available
                try:
                    cur.execute("SELECT count(*) FROM companies;")
                    count = cur.fetchone()[0]
                    print(f"          Active Companies Count: {count}")
                except Exception:
                    conn.rollback()
        return True
    except ImportError:
        pass
    except Exception as err:
        print(f"[FAILED] psycopg v3 connection error: {err}")

    # Method 2: psycopg2 fallback
    try:
        import psycopg2
        conn = psycopg2.connect(db_url, connect_timeout=15)
        cur = conn.cursor()
        cur.execute("SELECT NOW() AS server_time, current_database() AS db_name;")
        row = cur.fetchone()
        latency_ms = round((time.time() - start_time) * 1000, 2)
        print(f"[SUCCESS] PostgreSQL heartbeat successful! (Latency: {latency_ms}ms)")
        print(f"          Server Time: {row[0]}")
        print(f"          Database: {row[1]}")
        cur.close()
        conn.close()
        return True
    except ImportError:
        pass
    except Exception as err:
        print(f"[FAILED] psycopg2 connection error: {err}")

    # Method 3: SQLAlchemy fallback
    try:
        from sqlalchemy import create_engine, text
        engine = create_engine(raw_db_url, connect_args={"connect_timeout": 15})
        with engine.connect() as conn:
            result = conn.execute(text("SELECT NOW() AS server_time, current_database() AS db_name;")).fetchone()
            latency_ms = round((time.time() - start_time) * 1000, 2)
            print(f"[SUCCESS] SQLAlchemy heartbeat successful! (Latency: {latency_ms}ms)")
            print(f"          Server Time: {result[0]}")
            print(f"          Database: {result[1]}")
            return True
    except Exception as err:
        print(f"[FAILED] SQLAlchemy connection error: {err}")

    return False


def ping_via_rest(supabase_url, anon_key):
    print("Pinging Supabase via REST API...")
    try:
        import urllib.request
        
        url = supabase_url.rstrip("/") + "/rest/v1/"
        req = urllib.request.Request(
            url,
            headers={
                "apikey": anon_key,
                "Authorization": f"Bearer {anon_key}",
            }
        )
        start_time = time.time()
        with urllib.request.urlopen(req, timeout=15) as response:
            latency_ms = round((time.time() - start_time) * 1000, 2)
            print(f"[SUCCESS] REST API heartbeat successful! Status code: {response.status} (Latency: {latency_ms}ms)")
            return True
    except Exception as err:
        print(f"[FAILED] REST API ping error: {err}")
        return False


def main():
    utc_now = datetime.now(timezone.utc).isoformat()
    print("=" * 60)
    print(f"Supabase Keep-Alive Heartbeat Initiated at {utc_now}")
    print("=" * 60)

    db_url = os.environ.get("DATABASE_URL") or os.environ.get("SUPABASE_DB_URL")
    supabase_url = os.environ.get("SUPABASE_URL")
    anon_key = os.environ.get("SUPABASE_ANON_KEY")

    if not db_url and not (supabase_url and anon_key):
        print("[ERROR] No database credentials configured!")
        print("Please configure at least one of:")
        print("  1. DATABASE_URL / SUPABASE_DB_URL (PostgreSQL connection string)")
        print("  2. SUPABASE_URL + SUPABASE_ANON_KEY (Supabase REST API endpoints)")
        sys.exit(1)

    max_retries = 3
    success = False

    for attempt in range(1, max_retries + 1):
        print(f"\n--- Attempt {attempt} of {max_retries} ---")
        
        if db_url:
            if ping_via_postgres(db_url):
                success = True
                break
        
        if supabase_url and anon_key:
            if ping_via_rest(supabase_url, anon_key):
                success = True
                break
        
        if attempt < max_retries:
            wait_seconds = attempt * 5
            print(f"Waiting {wait_seconds}s before retrying...")
            time.sleep(wait_seconds)

    print("\n" + "=" * 60)
    if success:
        print(f"[COMPLETE] Supabase project kept active successfully at {datetime.now(timezone.utc).isoformat()}")
        print("=" * 60)
        sys.exit(0)
    else:
        print("[ERROR] All heartbeat attempts failed to keep Supabase active.")
        print("=" * 60)
        sys.exit(1)


if __name__ == "__main__":
    main()
