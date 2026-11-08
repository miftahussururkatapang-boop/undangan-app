import sys
import json
import sqlite3

db_path = sys.argv[1] if len(sys.argv) > 1 else "wedding.db"
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row

# Read commands from stdin line by line
for line in sys.stdin:
    if not line.strip():
        continue
    try:
        req = json.loads(line)
        sql = req.get("sql", "")
        params = req.get("params", [])
        mode = req.get("mode", "all") # "first", "all", "run"
        
        cur = conn.cursor()
        cur.execute(sql, params)
        
        if mode == "run":
            conn.commit()
            res = {
                "ok": True,
                "meta": {
                    "last_row_id": cur.lastrowid,
                    "changes": cur.rowcount
                }
            }
        elif mode == "first":
            row = cur.fetchone()
            res = {
                "ok": True,
                "result": dict(row) if row else None
            }
        else: # all
            rows = cur.fetchall()
            res = {
                "ok": True,
                "results": [dict(r) for r in rows]
            }
        print(json.dumps(res), flush=True)
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}), flush=True)
