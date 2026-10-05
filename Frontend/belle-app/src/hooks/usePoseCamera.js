import { useCallback, useEffect, useRef, useState } from 'react'
import { cameraError, measurePose } from '../services/visionUtils'

async function createDetector() {
  const [{ FilesetResolver, PoseLandmarker }, simdJS, simdWasm, plainJS, plainWasm] = await Promise.all([
    import('@mediapipe/tasks-vision'),
    import('@mediapipe/tasks-vision/vision_wasm_internal.js?url'),
    import('@mediapipe/tasks-vision/vision_wasm_internal.wasm?url'),
    import('@mediapipe/tasks-vision/vision_wasm_nosimd_internal.js?url'),
    import('@mediapipe/tasks-vision/vision_wasm_nosimd_internal.wasm?url'),
  ])
  const simd = await FilesetResolver.isSimdSupported()
  return PoseLandmarker.createFromOptions({
    wasmLoaderPath: (simd ? simdJS : plainJS).default,
    wasmBinaryPath: (simd ? simdWasm : plainWasm).default,
  }, {
    baseOptions: { modelAssetPath: `${import.meta.env.BASE_URL}models/pose_landmarker_lite.task`, delegate: 'CPU' },
    runningMode: 'VIDEO', numPoses: 1,
    minPoseDetectionConfidence: 0.6, minPosePresenceConfidence: 0.6, minTrackingConfidence: 0.6,
  })
}

const connections = [[11, 12], [11, 23], [12, 24], [23, 24], [11, 13], [13, 15], [12, 14], [14, 16], [23, 25], [25, 27], [24, 26], [26, 28]]

export function usePoseCamera() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const resources = useRef({ generation: 0, stream: null, detector: null, frame: 0 })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [metrics, setMetrics] = useState(null)
  const [facing, setFacing] = useState('user')

  const release = useCallback(() => {
    const r = resources.current
    r.generation++
    cancelAnimationFrame(r.frame)
    r.stream?.getTracks().forEach(track => { track.onended = null; track.stop() })
    r.stream = null
    r.detector?.close()
    r.detector = null
    if (videoRef.current) videoRef.current.srcObject = null
    const canvas = canvasRef.current
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
  }, [])

  const stop = useCallback(() => {
    release()
    setStatus('idle')
    setMetrics(null)
  }, [release])

  useEffect(() => {
    const onVisibility = () => { if (document.hidden) stop() }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', stop)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', stop)
      release()
    }
  }, [release, stop])

  const start = async (direction = facing) => {
    release()
    setMetrics(null)
    setError('')
    if (!window.isSecureContext) {
      setStatus('error')
      setError('La cámara necesita una conexión segura. En esta computadora abre http://localhost:5173. Desde el celular utiliza una dirección HTTPS con certificado válido; una IP por HTTP no permite activar la cámara.')
      return
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('error')
      setError('Este navegador no permite acceder a la cámara. Abre la app directamente en un navegador actualizado y permite el acceso.')
      return
    }
    setStatus('starting')
    setFacing(direction)
    const r = resources.current
    const generation = r.generation
    const current = () => resources.current.generation === generation
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: direction }, width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24, max: 30 } },
      })
      if (!current()) { stream.getTracks().forEach(track => track.stop()); return }
      r.stream = stream
      stream.getVideoTracks()[0].onended = () => {
        if (!current()) return
        stop()
        setError('Se interrumpió el acceso a la cámara. Puedes activarla nuevamente.')
      }
      const actualFacing = stream.getVideoTracks()[0].getSettings().facingMode
      if (actualFacing) setFacing(actualFacing)
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      if (!current()) return
      const detector = await createDetector()
      if (!current()) { detector.close(); return }
      r.detector = detector
      setStatus('live')
      let lastTime = -1
      let lastRun = 0
      const tick = now => {
        if (!current()) return
        try {
          const video = videoRef.current
          const canvas = canvasRef.current
          if (video?.readyState >= 2 && video.videoWidth && video.currentTime !== lastTime && now - lastRun >= 100) {
            lastTime = video.currentTime
            lastRun = now
            const result = detector.detectForVideo(video, now)
            const points = result.landmarks[0]
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext('2d')
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            const visible = p => p && (p.visibility ?? 0) >= 0.65
            if (points) {
              ctx.strokeStyle = '#6ee7b7'
              ctx.fillStyle = '#f5d6a9'
              ctx.lineWidth = Math.max(2, canvas.width / 240)
              connections.forEach(([a, b]) => {
                if (!visible(points[a]) || !visible(points[b])) return
                ctx.beginPath()
                ctx.moveTo(points[a].x * canvas.width, points[a].y * canvas.height)
                ctx.lineTo(points[b].x * canvas.width, points[b].y * canvas.height)
                ctx.stroke()
              })
              points.forEach(p => {
                if (!visible(p)) return
                ctx.beginPath()
                ctx.arc(p.x * canvas.width, p.y * canvas.height, 4, 0, 2 * Math.PI)
                ctx.fill()
              })
            }
            setMetrics(measurePose(points, canvas.width, canvas.height))
          }
          r.frame = requestAnimationFrame(tick)
        } catch (e) {
          if (!current()) return
          release()
          setMetrics(null)
          setStatus('error')
          setError(cameraError(e))
        }
      }
      r.frame = requestAnimationFrame(tick)
    } catch (e) {
      if (!current()) return
      release()
      setStatus('error')
      setError(cameraError(e))
    }
  }

  return { videoRef, canvasRef, status, error, metrics, facing, start, stop }
}
