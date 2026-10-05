import { test } from 'node:test'
import assert from 'node:assert/strict'
import { measurePose, cameraError } from './visionUtils.js'
function pose() {
  const points = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 1 }))
  points[11] = { x: 0.3, y: 0.2, visibility: 0.9 }
  points[12] = { x: 0.7, y: 0.2, visibility: 0.9 }
  points[23] = { x: 0.35, y: 0.7, visibility: 0.9 }
  points[24] = { x: 0.65, y: 0.7, visibility: 0.9 }
  return points
}
test('symmetric visible torso has zero angles', () => {
  const result = measurePose(pose(), 640, 480)
  assert.equal(result.shoulders, 0)
  assert.equal(result.hips, 0)
  assert.equal(result.trunk, 0)
})
test('angles account for image aspect ratio and remain invariant under mirroring', () => {
  const points = pose()
  points[12].y = 0.4
  const result = measurePose(points, 640, 480)
  assert.ok(Math.abs(result.shoulders - Math.atan2(96, 256) * 180 / Math.PI) < 1e-9)
  const mirrored = measurePose(points.map(p => ({ ...p, x: 1 - p.x })), 640, 480)
  assert.ok(Math.abs(result.shoulders - mirrored.shoulders) < 1e-9)
})
test('missing, occluded and out-of-frame landmarks yield no fabricated reading', () => {
  assert.equal(measurePose(undefined, 640, 480), null)
  const points = pose()
  points[23].visibility = 0.3
  assert.equal(measurePose(points, 640, 480), null)
  points[23].visibility = 1
  points[23].x = -0.1
  assert.equal(measurePose(points, 640, 480), null)
  assert.equal(measurePose(pose(), 0, 480), null)
})
test('sideways or degenerate torso yields no measurement', () => {
  const points = pose()
  points[12].x = points[11].x
  assert.equal(measurePose(points, 640, 480), null)
})
test('permission and device errors provide distinct recovery instructions', () => {
  assert.match(cameraError({ name: 'NotAllowedError' }), /Permiso/)
  assert.match(cameraError({ name: 'NotFoundError' }), /No se encontró/)
  assert.match(cameraError({ name: 'NotReadableError' }), /ocupada/)
})
