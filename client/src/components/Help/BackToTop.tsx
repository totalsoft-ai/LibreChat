import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '~/utils';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        'fixed bottom-8 right-8 z-40 rounded-full bg-green-600 p-3 text-white shadow-lg transition-all duration-300 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:bg-green-700 dark:hover:bg-green-600',
        isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-16 opacity-0',
      )}
      aria-label="Back to top"
    >
      <ArrowUp className="h-6 w-6" aria-hidden="true" />
    </button>
  );
}
