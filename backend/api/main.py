from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


DB = {
    "host": "127.0.0.1",
    "port": 5432,
    "dbname": "low_emission",   
    "user": "postgres",
    "password": "1234"          
}

def get_conn():
    return psycopg2.connect(**DB)

@app.get("/geojson")
def geojson():
    conn = get_conn()
    cur = conn.cursor()

    sql = """
    SELECT jsonb_build_object(
      'type', 'FeatureCollection',
      'features', jsonb_agg(
        jsonb_build_object(
          'type', 'Feature',
          'geometry', ST_AsGeoJSON(geom)::jsonb,
          'properties', to_jsonb(t) - 'geom'
        )
      )
    )
    FROM (
      SELECT 'school' AS layer_type, okul_adi AS name, geom FROM schools_polygon_only
      UNION ALL
      SELECT 'buffer', okul_adi, geom FROM school_buffer_200m
      UNION ALL
      SELECT 'closed_road', NULL, geom FROM roads_to_close
      UNION ALL
      SELECT 'open_road', NULL, geom FROM roads_open
    ) t;
    """

    cur.execute(sql)
    data = cur.fetchone()[0]

    cur.close()
    conn.close()

    return data
