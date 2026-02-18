"""
Generate test amenity data for visualization

Creates sample amenities around Tokyo Station for testing
"""

import geopandas as gpd
from shapely.geometry import Point
import pandas as pd
import numpy as np
from pathlib import Path

# Set random seed for reproducibility
np.random.seed(42)

# Tokyo Station center
CENTER_LAT = 35.681
CENTER_LON = 139.767

# Amenity types and their typical names
AMENITY_TEMPLATES = {
    'supermarket': ['マルエツ', 'ローソンストア100', 'まいばすけっと', 'ミニストップ', 'セブンイレブン'],
    'kindergarten': ['○○保育園', '△△幼稚園', '□□こども園', 'キッズランド', 'すくすく保育園'],
    'school': ['○○小学校', '△△中学校', '□□高等学校', '私立学園', '公立学校'],
    'park': ['○○公園', '△△広場', '□□緑地', '遊戯公園', '児童公園'],
    'hospital': ['○○クリニック', '△△医院', '□□病院', '総合病院', '内科医院'],
}

def generate_amenities(center_lat=CENTER_LAT, center_lon=CENTER_LON, num_per_type=10, radius_km=2.0):
    """
    Generate random amenities around a center point

    Args:
        center_lat: Center latitude
        center_lon: Center longitude
        num_per_type: Number of amenities to generate per type
        radius_km: Radius in kilometers to spread amenities

    Returns:
        GeoDataFrame with amenity points
    """
    amenities_data = []
    osm_id_counter = 100000

    # Approximate degrees per km (at Tokyo latitude)
    deg_per_km_lat = 1 / 111.0
    deg_per_km_lon = 1 / (111.0 * np.cos(np.radians(center_lat)))

    for amenity_type, name_templates in AMENITY_TEMPLATES.items():
        for i in range(num_per_type):
            # Generate random position within radius
            angle = np.random.uniform(0, 2 * np.pi)
            distance = np.random.uniform(0, radius_km)

            lat_offset = distance * deg_per_km_lat * np.cos(angle)
            lon_offset = distance * deg_per_km_lon * np.sin(angle)

            lat = center_lat + lat_offset
            lon = center_lon + lon_offset

            # Pick random name template
            name_template = np.random.choice(name_templates)

            # Replace placeholders with numbers
            if '○○' in name_template:
                name = name_template.replace('○○', f'第{i+1}')
            elif '△△' in name_template:
                name = name_template.replace('△△', f'{chr(65+i%26)}')  # A, B, C, ...
            elif '□□' in name_template:
                name = name_template.replace('□□', f'{i+1}丁目')
            else:
                name = f"{name_template}{i+1}"

            amenities_data.append({
                'amenity_type': amenity_type,
                'name': name,
                'osm_id': f'node/{osm_id_counter + i}',
                'geometry': Point(lon, lat)
            })

        osm_id_counter += num_per_type

    # Create GeoDataFrame
    gdf = gpd.GeoDataFrame(amenities_data, crs="EPSG:4326")

    return gdf


def main():
    """Generate and save test amenity data"""
    # Generate amenities
    print("Generating test amenity data...")
    amenities = generate_amenities(num_per_type=10, radius_km=2.0)

    print(f"Generated {len(amenities)} amenities:")
    print(amenities['amenity_type'].value_counts())

    # Save to Parquet
    output_dir = Path(__file__).parents[2] / 'data' / 'raw'
    output_dir.mkdir(parents=True, exist_ok=True)

    output_path = output_dir / 'amenities_test.parquet'
    amenities.to_parquet(output_path)
    print(f"\nSaved to: {output_path}")

    # Also save as GeoJSON for inspection
    geojson_path = output_dir / 'amenities_test.geojson'
    amenities.to_file(geojson_path, driver='GeoJSON')
    print(f"GeoJSON saved to: {geojson_path}")

    # Print sample
    print("\nSample amenities:")
    print(amenities.head(10))


if __name__ == '__main__':
    main()
