// Single shared projection for BOTH the land mesh and every city's [lat,lng] -> [x,z].
// One d3.geoMercator fitted to the India GeoJSON bounds, mapped to a centered world
// plane on X/Z (Y is up). Computed once at module load so land + cities stay aligned.
import { geoMercator } from "d3-geo";
import indiaRaw from "../data/india.geojson?raw";

export type Position = [number, number]; // [lng, lat] pairs in GeoJSON
type Ring = Position[];
export interface IndiaFeature {
  type: "Feature";
  properties: { st_nm: string };
  geometry:
    | { type: "Polygon"; coordinates: Ring[] }
    | { type: "MultiPolygon"; coordinates: Ring[][] };
}
export interface IndiaFC {
  type: "FeatureCollection";
  features: IndiaFeature[];
}

export const INDIA: IndiaFC = JSON.parse(indiaRaw);

// World size that India is fitted into (units). India ends up centered on the origin.
export const FIT = 3000;

// We fit the mercator PLANARLY rather than with d3's fitSize. fitSize uses
// spherical bounds (geoPath), which are sensitive to polygon ring winding —
// dissolved/simplified GeoJSON can have rings that make d3 treat a polygon as
// covering the whole globe, squishing India into a corner. Computing the bounds
// from the actually-projected points is winding-independent and reliable.
const projection = geoMercator().scale(1).translate([0, 0]);
(() => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const f of INDIA.features) {
    const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const poly of polys as number[][][][]) {
      for (const ring of poly as number[][][]) {
        for (const c of ring) {
          const p = projection([c[0], c[1]]);
          if (!p) continue;
          if (p[0] < minX) minX = p[0];
          if (p[0] > maxX) maxX = p[0];
          if (p[1] < minY) minY = p[1];
          if (p[1] > maxY) maxY = p[1];
        }
      }
    }
  }
  const scale = FIT / Math.max(maxX - minX, maxY - minY);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  projection.scale(scale).translate([FIT / 2 - scale * cx, FIT / 2 - scale * cy]);
})();

/** Project geographic [lat,lng] to world [x,z] (Y is up, India centered at origin). */
export function project(lat: number, lng: number): [number, number] {
  const p = projection([lng, lat]);
  if (!p) return [0, 0];
  return [p[0] - FIT / 2, p[1] - FIT / 2];
}

/**
 * Land shapes are built in the XY plane (for THREE.ShapeGeometry) then the mesh is
 * rotated -90° about X. Under that rotation a shape point (x, y) lands at world
 * (x, 0, -y). To make world z equal project()'s z, shape points use y = -worldZ.
 */
export function shapePoint(lat: number, lng: number): [number, number] {
  const [x, z] = project(lat, lng);
  return [x, -z];
}
