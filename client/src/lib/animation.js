import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

// Runs GSAP setup against the element the returned ref is attached to, and
// reverts every tween / ScrollTrigger it created on unmount or when deps change.
export function useGsap(setup, deps = []) {
  const scope = useRef(null);
  useLayoutEffect(() => {
    if (!scope.current) return undefined;
    const ctx = gsap.context(() => setup(scope.current), scope);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return scope;
}

// ---- Pointer effects (desktop mice only; on touch they would "stick" after a tap) ----

export const canHover =
  typeof window !== 'undefined' && !!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;

// 3D tilt that follows the cursor.
export const tilt = canHover
  ? {
      onMouseMove(e) {
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        const rotateX = (e.clientY - r.top - r.height / 2) / 10;
        const rotateY = (r.width / 2 - (e.clientX - r.left)) / 10;
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px) scale(1.03)`;
      },
      onMouseLeave(e) {
        e.currentTarget.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
      },
    }
  : {};

// Image inside an .img-zoom container drifts toward the cursor.
export const zoomPan = canHover
  ? {
      onMouseMove(e) {
        const img = e.currentTarget.querySelector('img');
        if (!img) return;
        const r = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 20;
        const y = ((e.clientY - r.top) / r.height - 0.5) * 20;
        img.style.transform = `scale(1.15) translate(${x}px, ${y}px) rotate(2deg)`;
      },
      onMouseLeave(e) {
        const img = e.currentTarget.querySelector('img');
        if (img) img.style.transform = 'scale(1) translate(0, 0) rotate(0deg)';
      },
    }
  : {};

// Button pulled slightly toward the cursor.
export const magnetic = canHover
  ? {
      onMouseMove(e) {
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px, ${(e.clientY - r.top - r.height / 2) * 0.2}px)`;
      },
      onMouseLeave(e) {
        e.currentTarget.style.transform = 'translate(0, 0)';
      },
    }
  : {};

// Combine several handler sets so each one still runs.
export function mergeHandlers(...sets) {
  const merged = {};
  for (const set of sets) {
    for (const [name, fn] of Object.entries(set)) {
      const prev = merged[name];
      merged[name] = prev ? (e) => { prev(e); fn(e); } : fn;
    }
  }
  return merged;
}

// Click ripple for .ripple-btn elements.
export function ripple(e) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const size = Math.max(r.width, r.height);
  const span = document.createElement('span');
  Object.assign(span.style, {
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    left: `${e.clientX - r.left - size / 2}px`,
    top: `${e.clientY - r.top - size / 2}px`,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.6)',
    transform: 'scale(0)',
    animation: 'ripple-animation 0.6s ease-out',
    pointerEvents: 'none',
  });
  el.appendChild(span);
  setTimeout(() => span.remove(), 600);
}
