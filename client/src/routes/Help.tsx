import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetDocsListQuery, useGetDocContentQuery } from 'librechat-data-provider/react-query';
import Markdown from '~/components/Chat/Messages/Content/Markdown';
import { Spinner } from '@librechat/client';
import { cn } from '~/utils';
import { useScrollSpy, useHelpKeyboardShortcuts } from '~/hooks/Help';
import {
  HelpSearch,
  HelpMobileMenu,
  MobileMenuButton,
  HelpBreadcrumb,
  HelpNavigation,
  BackToTop,
  HelpSkeleton,
  HelpFeedback,
  HelpErrorBoundary,
} from '~/components/Help';

const SUPPORTED_LANGS = ['en', 'ro'] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];
const DEFAULT_LANG: Lang = 'en';

function HelpContent() {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

  // Language state — default English
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);

  // Get list of all documentation sections
  const { data: docsList, isLoading: isLoadingList } = useGetDocsListQuery(lang, {});

  // Determine current section (from URL or default)
  const currentSection = section || docsList?.default || 'index';

  // Get content for current section
  const { data: docContent, isLoading: isLoadingContent } = useGetDocContentQuery(
    currentSection,
    lang,
    { enabled: !!currentSection },
  );

  // When language changes, navigate to default section of new language
  const handleLangChange = (newLang: Lang) => {
    setLang(newLang);
    navigate('/help');
  };

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Use scroll spy hook for active section tracking
  const activeSubsection = useScrollSpy(docContent?.sections || [], 100);

  // Transform markdown content to handle internal documentation links
  const transformedContent = useMemo(() => {
    if (!docContent?.content) {
      return '';
    }

    // Transform markdown links like ./01-getting-started.md to /help/getting-started
    return docContent.content.replace(
      /\[([^\]]+)\]\(\.\/([^)]+)\.md\)/g,
      (_match, text, filename) => {
        // Convert filename to doc ID (e.g., "01-getting-started" -> "getting-started")
        const docId = filename.replace(/^\d+-/, '');
        return `[${text}](#${docId})`;
      }
    );
  }, [docContent?.content]);

  // Handle link clicks in markdown content
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A') {
        const href = target.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const docId = href.substring(1);
          navigate(`/help/${docId}`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, [navigate]);

  // Update URL when section changes
  const handleSectionChange = (sectionId: string) => {
    navigate(`/help/${sectionId}`);
    // Scroll to top and focus on content
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      contentRef.current?.focus();
    }, 100);
  };

  // Handle subsection click - scroll to subsection
  const handleSubsectionClick = (subsectionId: string) => {
    const element = document.getElementById(subsectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Focus on the element for accessibility
      element.setAttribute('tabindex', '-1');
      element.focus();
    }
  };

  // Keyboard shortcuts
  const getNextSection = () => {
    if (!docsList?.sections) {
      return;
    }
    const currentIndex = docsList.sections.findIndex((s) => s.id === currentSection);
    if (currentIndex < docsList.sections.length - 1) {
      return docsList.sections[currentIndex + 1].id;
    }
  };

  const getPreviousSection = () => {
    if (!docsList?.sections) {
      return;
    }
    const currentIndex = docsList.sections.findIndex((s) => s.id === currentSection);
    if (currentIndex > 0) {
      return docsList.sections[currentIndex - 1].id;
    }
  };

  useHelpKeyboardShortcuts({
    onNextSection: () => {
      const nextId = getNextSection();
      if (nextId) {
        handleSectionChange(nextId);
      }
    },
    onPreviousSection: () => {
      const prevId = getPreviousSection();
      if (prevId) {
        handleSectionChange(prevId);
      }
    },
    onGoHome: () => navigate('/'),
    onToggleSidebar: () => setIsMobileMenuOpen((prev) => !prev),
  });

  if (isLoadingList) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  // Get current section title for breadcrumb
  const currentSectionTitle = docsList?.sections.find((s) => s.id === currentSection)?.title;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white dark:bg-gray-900">
      {/* Breadcrumb */}
      <HelpBreadcrumb currentTitle={currentSectionTitle} />

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile menu */}
        <HelpMobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          sections={docsList?.sections || []}
          currentSection={currentSection}
          onSectionChange={handleSectionChange}
        />

        {/* Sidebar with tabs - Desktop only */}
        <aside className="hidden w-64 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 lg:block">
          <div className="sticky top-0 z-10 bg-gray-50 p-4 dark:bg-gray-800">
            <h1 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
              TESSA Help
            </h1>

            {/* Language switcher */}
            <div className="mb-4 flex rounded-md border border-gray-200 dark:border-gray-600">
              {SUPPORTED_LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => handleLangChange(l)}
                  className={cn(
                    'flex-1 py-1 text-xs font-medium transition-colors first:rounded-l-md last:rounded-r-md',
                    lang === l
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700',
                  )}
                  aria-pressed={lang === l}
                >
                  {l === 'en' ? 'English' : 'Română'}
                </button>
              ))}
            </div>

            {/* Search */}
            <HelpSearch
              sections={docsList?.sections || []}
              onSelectResult={handleSectionChange}
            />
          </div>

          <nav className="space-y-1 p-2" role="navigation" aria-label="Documentation sections">
            {docsList?.sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={cn(
                  'w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors',
                  currentSection === section.id
                    ? 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100'
                    : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700',
                )}
                aria-current={currentSection === section.id ? 'page' : undefined}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content area */}
        <main className="flex flex-1 flex-col overflow-hidden" role="main">
          {/* Mobile header with menu button */}
          <div className="flex items-center border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900 lg:hidden">
            <MobileMenuButton onClick={() => setIsMobileMenuOpen(true)} />
            <h1 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
              {currentSectionTitle}
            </h1>
          </div>

          {isLoadingContent ? (
            <div className="flex-1 overflow-y-auto p-8">
              <HelpSkeleton />
            </div>
          ) : docContent ? (
            <div className="flex flex-1 overflow-hidden">
              {/* Content */}
              <div className="flex-1 overflow-y-auto" ref={contentRef} tabIndex={-1}>
                <article className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                  {/* Markdown content */}
                  <div className="prose max-w-none dark:prose-invert [&>*]:max-w-none">
                    <Markdown content={transformedContent} isLatestMessage={false} />
                  </div>

                  {/* Feedback widget */}
                  <div className="mt-12">
                    <HelpFeedback sectionId={currentSection} sectionTitle={currentSectionTitle || ''} />
                  </div>

                  {/* Navigation */}
                  {docsList?.sections && (
                    <HelpNavigation
                      sections={docsList.sections}
                      currentSection={currentSection}
                      onNavigate={handleSectionChange}
                    />
                  )}
                </article>
              </div>

            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Documentation not found
                </p>
              </div>
            </div>
          )}

          {/* Back to top button */}
          <BackToTop />
        </main>
      </div>
    </div>
  );
}

// Wrap with Error Boundary
export default function Help() {
  return (
    <HelpErrorBoundary>
      <HelpContent />
    </HelpErrorBoundary>
  );
}
