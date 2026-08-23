"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return

    child.geometry.dispose()
    const materials = Array.isArray(child.material) ? child.material : [child.material]
    for (const material of materials) material.dispose()
  })
}

export function ChordlinkModelViewer({ label }: { label: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let disposed = false
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(28, 1, 0.001, 100)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    renderer.domElement.className = "size-full touch-none"
    renderer.domElement.setAttribute("aria-label", label)
    renderer.domElement.setAttribute("role", "img")
    container.append(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.enablePan = false
    controls.minPolarAngle = Math.PI * 0.15
    controls.maxPolarAngle = Math.PI * 0.72

    scene.add(new THREE.HemisphereLight(0xffffff, 0x4b5563, 2.2))
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.5)
    keyLight.position.set(3, 5, 4)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0xb8c5ff, 1.2)
    fillLight.position.set(-4, 1, -2)
    scene.add(fillLight)

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      renderer.setSize(width, height, false)
      camera.aspect = width / Math.max(height, 1)
      camera.updateProjectionMatrix()
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    resize()

    new GLTFLoader().load("/models/chordlink.glb", ({ scene: model }) => {
      if (disposed) {
        disposeObject(model)
        return
      }

      const bounds = new THREE.Box3().setFromObject(model)
      const center = bounds.getCenter(new THREE.Vector3())
      const size = bounds.getSize(new THREE.Vector3())
      model.position.sub(center)
      scene.add(model)

      const radius = Math.max(size.x, size.y, size.z) * 0.5
      const distance = radius / Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5))
      camera.position.set(distance * 0.82, distance * 0.62, distance * 0.9)
      controls.target.set(0, 0, 0)
      controls.minDistance = distance * 0.65
      controls.maxDistance = distance * 2.2
      controls.update()
      container.dataset.ready = "true"
    })

    let animationFrame = 0
    const render = () => {
      controls.update()
      renderer.render(scene, camera)
      animationFrame = requestAnimationFrame(render)
    }
    render()

    return () => {
      disposed = true
      cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      controls.dispose()
      disposeObject(scene)
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [label])

  return <div className="size-full bg-transparent" ref={containerRef} />
}
