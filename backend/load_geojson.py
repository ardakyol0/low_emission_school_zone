#!/usr/bin/env python3

import psycopg2
import json
import os
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", "5432"),
    "database": os.getenv("DB_NAME", "belek_gis"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "postgres")
}


def load_geojson_to_postgis(geojson_file):
    with open(geojson_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    
    cur.execute("TRUNCATE TABLE osm_features RESTART IDENTITY;")
    
    for feature in data['features']:
        name = feature['properties'].get('name', '')
        layer_type = feature['properties'].get('layer_type', 'unknown')
        
        geom_json = json.dumps(feature['geometry'])
        
        properties = {k: v for k, v in feature['properties'].items() 
                     if k not in ['name', 'layer_type']}
        
        cur.execute("""
            INSERT INTO osm_features (name, layer_type, geom, properties)
            VALUES (%s, %s, ST_GeomFromGeoJSON(%s), %s)
        """, (name, layer_type, geom_json, json.dumps(properties) if properties else None))
    
    conn.commit()
    
    cur.execute("SELECT layer_type, COUNT(*) FROM osm_features GROUP BY layer_type;")
    stats = cur.fetchall()
    
    print("\n✓ Veri yükleme tamamlandı!")
    print("\nİstatistikler:")
    for layer_type, count in stats:
        print(f"  - {layer_type}: {count} kayıt")
    
    cur.close()
    conn.close()


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Kullanım: python load_geojson.py <geojson_dosyasi>")
        print("\nÖrnek:")
        print("  python load_geojson.py ../data/processed/low_emission_simulation.geojson")
        sys.exit(1)
    
    geojson_file = sys.argv[1]
    
    if not os.path.exists(geojson_file):
        print(f"Hata: {geojson_file} dosyası bulunamadı!")
        sys.exit(1)
    
    load_geojson_to_postgis(geojson_file)
