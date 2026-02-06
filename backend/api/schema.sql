CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS osm_features (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    layer_type VARCHAR(50),
    geom GEOMETRY(Geometry, 4326),
    properties JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_osm_features_geom ON osm_features USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_osm_features_layer_type ON osm_features (layer_type);
