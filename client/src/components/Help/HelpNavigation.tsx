import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '~/utils';

interface DocSection {
  id: string;
  title: string;
  order: number;
}

interface HelpNavigationProps {
  sections: DocSection[];
  currentSection: string;
  onNavigate: (sectionId: string) => void;
}

export default function HelpNavigation({
  sections,
  currentSection,
  onNavigate,
}: HelpNavigationProps) {
  const currentIndex = sections.findIndex((s) => s.id === currentSection);
  const prevSection = currentIndex > 0 ? sections[currentIndex - 1] : null;
  const nextSection = currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null;

  if (!prevSection && !nextSection) {
    return null;
  }

  return (
    <nav
      className="flex items-center justify-between border-t border-gray-200 px-4 py-6 dark:border-gray-700 sm:px-6"
      aria-label="Pagination"
    >
      <div className="flex flex-1 justify-between sm:justify-start">
        {prevSection ? (
          <button
            onClick={() => onNavigate(prevSection.id)}
            className="inline-flex items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">{prevSection.title}</span>
          </button>
        ) : (
          <div />
        )}
        {nextSection && (
          <button
            onClick={() => onNavigate(nextSection.id)}
            className="ml-3 inline-flex items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-700"
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">{nextSection.title}</span>
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>
      {prevSection && nextSection && (
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div className="ml-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">{prevSection.title}</span>
            </p>
          </div>
          <div className="mr-4 text-right">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">{nextSection.title}</span>
            </p>
          </div>
        </div>
      )}
    </nav>
  );
}
