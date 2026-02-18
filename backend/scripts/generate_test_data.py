#!/usr/bin/env python3
"""Generate minimal test data for WI API testing."""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import geopandas as gpd
import pandas as pd
from shapely.geometry import box
import numpy as np

# Create test grid (5x5 = 25 cells around Tokyo Station)
print("Generating test WI data...")

# Tokyo Station area: ~139.765, 35.681
center_lon, center_lat = 139.765, 35.681
cell_size = 0.001  # ~100m

grid_data = []
for i in range(5):
    for j in range(5):
        min_lon = center_lon + i * cell_size
        min_lat = center_lat + j * cell_size
        max_lon = min_lon + cell_size
        max_lat = min_lat + cell_size

        # Create polygon
        geom = box(min_lon, min_lat, max_lon, max_lat)

        # Generate random WI score
        wi_score = np.random.uniform(50, 90)

        # Generate amenity scores
        amenity_scores = {
            'supermarket': np.random.uniform(0.5, 1.0),
            'kindergarten': np.random.uniform(0.3, 0.9),
            'school': np.random.uniform(0.4, 0.8),
            'park': np.random.uniform(0.6, 1.0),
            'clinic': np.random.uniform(0.5, 0.9),
        }

        grid_data.append({
            'grid_id': f'test_{i:05d}_{j:05d}',
            'geometry': geom,
            'wi_score': wi_score,
            'centroid_lat': (min_lat + max_lat) / 2,
            'centroid_lon': (min_lon + max_lon) / 2,
            **{f'score_{k}': v for k, v in amenity_scores.items()}
        })

# Create GeoDataFrame
gdf = gpd.GeoDataFrame(grid_data, crs="EPSG:4326")

# Save to parquet
output_dir = Path(__file__).parent.parent.parent / "data" / "processed"
output_dir.mkdir(parents=True, exist_ok=True)

output_file = output_dir / "wi_test_residential_family.parquet"
gdf.to_parquet(output_file)

print(f"✓ Created test data: {output_file}")
print(f"  - {len(gdf)} grid cells")
print(f"  - WI range: {gdf['wi_score'].min():.1f} - {gdf['wi_score'].max():.1f}")
print(f"  - Mean WI: {gdf['wi_score'].mean():.1f}")
