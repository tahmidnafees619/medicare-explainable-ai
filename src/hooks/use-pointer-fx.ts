import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';

/**
 * Pointer-reactive and scroll-reveal primitives for the landing visuals.
 *
 * Design rule: none of these hooks call setState on pointer movement. They
 * write CSS custom properties straight to the DOM inside a rAF loop, and the
 * stylesheet does the rest. Re-rendering React on every mousemove is the usual
 * cause of janky "interactive background" pages.
 */

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const finePointer = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/**
 * Tracks the pointer across the viewport and publishes damped coordinates as
 * CSS variables on the returned element:
 *   --mx / --my    normalised 0..1  (parallax maths)
 *   --mpx / --mpy  percentages      (gradient positions)
 */
export function usePointerField<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion() || !finePointer()) return;

    let targetX = 0.5;
    let targetY = 0.4;
    let curX = 0.5;
    let curY = 0.4;
    let frame = 0;
    let running = false;

    const tick = () => {
      // Critically damped-ish follow: fast enough to feel attached to the
      // cursor, slow enough to read as weight rather than a jump-cut.
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;

      el.style.setProperty('--mx', curX.toFixed(4));
      el.style.setProperty('--my', curY.toFixed(4));
      el.style.setProperty('--mpx', `${(curX * 100).toFixed(2)}%`);
      el.style.setProperty('--mpy', `${(curY * 100).toFixed(2)}%`);

      // Park the loop once we have converged; restart on the next move.
      if (Math.abs(targetX - curX) > 0.0005 || Math.abs(targetY - curY) > 0.0005) {
        frame = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    };

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX / window.innerWidth;
      targetY = e.clientY / window.innerHeight;
      if (!running) {
        running = true;
        frame = requestAnimationFrame(tick);
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return ref;
}

/**
 * Reveals every `[data-reveal]` descendant once as it scrolls into view.
 * Elements are unobserved after firing so they never re-animate.
 */
export function useReveal<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));

    // Reduced motion: show everything immediately, animate nothing.
    if (reducedMotion() || typeof IntersectionObserver === 'undefined') {
      items.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    items.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return ref;
}

/** 3D tilt + cursor-tracked specular glare. CSS gates this to fine pointers. */
export function useTilt() {
  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    el.style.setProperty('--tx', (px - 0.5).toFixed(3));
    el.style.setProperty('--ty', (py - 0.5).toFixed(3));
    el.style.setProperty('--cx', `${(px * 100).toFixed(1)}%`);
    el.style.setProperty('--cy', `${(py * 100).toFixed(1)}%`);
  };

  const onPointerEnter = (e: ReactPointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.dataset.hovered = 'true';
    el.style.willChange = 'transform';
  };

  const onPointerLeave = (e: ReactPointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.dataset.hovered = 'false';
    el.style.setProperty('--tx', '0');
    el.style.setProperty('--ty', '0');
    // Drop the compositor hint again - a permanent will-change wastes memory.
    el.style.willChange = 'auto';
  };

  return { onPointerMove, onPointerEnter, onPointerLeave };
}

/** Nudges an element toward the cursor while hovered. */
export function useMagnetic(strength = 0.22) {
  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) * strength;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * strength;
    el.style.setProperty('--pull-x', dx.toFixed(2));
    el.style.setProperty('--pull-y', dy.toFixed(2));
  };

  const onPointerLeave = (e: ReactPointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.style.setProperty('--pull-x', '0');
    el.style.setProperty('--pull-y', '0');
  };

  return { onPointerMove, onPointerLeave };
}

/** True once the page has scrolled past `offset` px. Used to solidify the nav. */
export function useScrolled(offset = 8): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > offset));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [offset]);

  return scrolled;
}
