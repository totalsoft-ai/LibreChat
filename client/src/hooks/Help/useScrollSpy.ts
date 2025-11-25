import { useEffect, useState, useCallback } from 'react';
import { useThrottle } from './useThrottle';

interface Section {
  id: string;
  title: string;
  subsections?: Array<{ id: string; title: string }>;
}

/**
 * Hook that tracks which section is currently visible in the viewport
 * @param sections - Array of sections to track
 * @param offset - Offset from top of viewport (default: 100)
 * @returns The ID of the currently active section
 */
export function useScrollSpy(sections: Section[], offset: number = 100): string | null {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleScroll = useCallback(() => {
    if (!sections || sections.length === 0) {
      return;
    }

    // Get all section IDs (including subsections)
    const sectionIds: string[] = [];
    sections.forEach((section) => {
      sectionIds.push(section.id);
      if (section.subsections) {
        section.subsections.forEach((sub) => sectionIds.push(sub.id));
      }
    });

    // Find which section is currently in view
    let currentActiveId: string | null = null;
    for (const id of sectionIds) {
      const element = document.getElementById(id);
      if (element) {
        const rect = element.getBoundingClientRect();
        // Check if element is in the top portion of viewport
        if (rect.top >= 0 && rect.top <= window.innerHeight / 2 + offset) {
          currentActiveId = id;
        }
        // If we've scrolled past this element, it might still be the active one
        if (rect.top < offset && rect.bottom > offset) {
          currentActiveId = id;
        }
      }
    }

    if (currentActiveId !== activeSection) {
      setActiveSection(currentActiveId);
    }
  }, [sections, offset, activeSection]);

  const throttledHandleScroll = useThrottle(handleScroll, 150);

  useEffect(() => {
    // Initial check
    handleScroll();

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [handleScroll, throttledHandleScroll]);

  return activeSection;
}
