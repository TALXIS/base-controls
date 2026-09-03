export * from './GanttZooming';
export * from './ZoomingConfig';
//the ladder, the scale maths, the anchor and the library's own internals are this folder's business: the
//rest of the chart reads one predicate off them, and a helper with a single caller is not package surface
export { isDayScaleVisible } from './zoomScales';
export type { IGanttScaleLattice } from './zoomScales';
