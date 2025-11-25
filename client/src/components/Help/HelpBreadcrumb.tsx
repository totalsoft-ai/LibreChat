import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HelpBreadcrumbProps {
  currentTitle?: string;
}

export default function HelpBreadcrumb({ currentTitle }: HelpBreadcrumbProps) {
  return (
    <nav className="flex border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-2">
        <li>
          <div>
            <Link
              to="/"
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              aria-label="Home"
            >
              <Home className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            </Link>
          </div>
        </li>
        <li>
          <div className="flex items-center">
            <ChevronRight
              className="h-5 w-5 flex-shrink-0 text-gray-400"
              aria-hidden="true"
            />
            <Link
              to="/help"
              className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Help
            </Link>
          </div>
        </li>
        {currentTitle && (
          <li>
            <div className="flex items-center">
              <ChevronRight
                className="h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              <span
                className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                aria-current="page"
              >
                {currentTitle}
              </span>
            </div>
          </li>
        )}
      </ol>
    </nav>
  );
}
