// Measurements in image pixels: normalized coordinates alone distort angles.
export function measurePose(points, width, height) {
  const ids = [11, 12, 23, 24]
  if (!points || width <= 0 || height <= 0 || ids.some(i => {
    const p = points[i]
    return !p || !Number.isFinite(p.x) || !Number.isFinite(p.y) ||
      (p.visibility ?? 0) < 0.65 || p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1
  })) return null
  const [a, b, c, d] = ids.map(i => ({ x: points[i].x * width, y: points[i].y * height }))
  if (Math.abs(a.x - b.x) < width * 0.08 || Math.abs(c.x - d.x) < width * 0.05) return null
  const angle = (p, q) => Math.atan2(Math.abs(p.y - q.y), Math.abs(p.x - q.x)) * 180 / Math.PI
  const dx = (a.x + b.x - c.x - d.x) / 2
  const dy = (c.y + d.y - a.y - b.y) / 2
  if (dy <= height * 0.08) return null
  return {
    shoulders: angle(a, b),
    hips: angle(c, d),
    trunk: Math.atan2(Math.abs(dx), dy) * 180 / Math.PI,
    visibility: Math.min(...ids.map(i => points[i].visibility)),
  }
}

export function cameraError(error) {
  switch (error?.name) {
    case 'NotAllowedError': return 'Permiso de cámara denegado. Habilítalo en los permisos de este sitio y vuelve a intentar. Si usas una vista integrada, abre la página en el navegador.'
    case 'NotFoundError': return 'No se encontró una cámara. Conecta una o abre la app desde tu celular.'
    case 'NotReadableError': return 'La cámara está ocupada o no responde. Cierra otras aplicaciones que la estén usando.'
    case 'OverconstrainedError': return 'Esta cámara no admite la configuración solicitada. Prueba otra cámara.'
    default: return 'No se pudo iniciar la cámara o cargar el detector. Comprueba la conexión, recarga la página y vuelve a intentar.'
  }
}
