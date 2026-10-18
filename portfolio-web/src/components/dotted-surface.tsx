"use client";

import { useEffect, useRef } from "react";

// Wave of dots rendered with three.js behind its parent section. Dot colour
// follows --fg, so it re-tints on theme change. Three is loaded lazily, the
// loop pauses off-screen, and reduced-motion renders a single static frame.
export function DottedSurface({
  size = 7,
  opacity = 0.55,
  speed = 0.05,
}: {
  size?: number;
  opacity?: number;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let dispose: (() => void) | undefined;
    let cancelled = false;

    import("three").then((THREE) => {
      if (cancelled) return;

      const SEP = 150;
      const NX = 40;
      const NY = 60;
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, 1, 1, 10000);
      camera.position.set(0, 355, 1220);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      host.appendChild(renderer.domElement);

      const positions = new Float32Array(NX * NY * 3);
      for (let ix = 0, i = 0; ix < NX; ix++) {
        for (let iy = 0; iy < NY; iy++, i += 3) {
          positions[i] = ix * SEP - (NX * SEP) / 2;
          positions[i + 2] = iy * SEP - (NY * SEP) / 2;
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({
        size,
        transparent: true,
        opacity,
        sizeAttenuation: true,
      });
      scene.add(new THREE.Points(geometry, material));

      const tint = () =>
        material.color.set(
          getComputedStyle(document.documentElement)
            .getPropertyValue("--fg")
            .trim() || "#ffffff",
        );
      tint();
      const themeObserver = new MutationObserver(tint);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });

      const resize = () => {
        const { clientWidth: w, clientHeight: h } = host;
        if (!w || !h) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      const resizeObserver = new ResizeObserver(() => {
        resize();
        draw();
      });
      resizeObserver.observe(host);

      let count = 0;
      let raf = 0;
      let visible = true;

      function draw() {
        for (let ix = 0, i = 0; ix < NX; ix++) {
          for (let iy = 0; iy < NY; iy++, i += 3) {
            positions[i + 1] =
              Math.sin((ix + count) * 0.3) * 50 +
              Math.sin((iy + count) * 0.5) * 50;
          }
        }
        geometry.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
      }

      const loop = () => {
        draw();
        count += speed;
        raf = requestAnimationFrame(loop);
      };
      const start = () => {
        if (!reduce && !raf && visible && !document.hidden) loop();
      };
      const stop = () => {
        cancelAnimationFrame(raf);
        raf = 0;
      };

      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        visible ? start() : stop();
      });
      io.observe(host);
      const onVis = () => (document.hidden ? stop() : start());
      document.addEventListener("visibilitychange", onVis);

      resize();
      draw();
      start();

      dispose = () => {
        stop();
        io.disconnect();
        resizeObserver.disconnect();
        themeObserver.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    });

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [size, opacity, speed]);

  return <div ref={ref} className="dotted-surface" aria-hidden />;
}
