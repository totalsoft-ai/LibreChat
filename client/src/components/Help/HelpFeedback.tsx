import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '~/utils';

interface HelpFeedbackProps {
  sectionId: string;
  sectionTitle: string;
}

export default function HelpFeedback({ sectionId, sectionTitle }: HelpFeedbackProps) {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [showThanks, setShowThanks] = useState(false);

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type);
    setShowThanks(true);

    // Log feedback (you can replace this with an API call)
    console.log('Help feedback:', {
      sectionId,
      sectionTitle,
      feedback: type,
      timestamp: new Date().toISOString(),
    });

    // Hide thanks message after 3 seconds
    setTimeout(() => {
      setShowThanks(false);
    }, 3000);
  };

  if (showThanks) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
        <p className="text-sm text-green-800 dark:text-green-200">
          Thank you for your feedback! It helps us improve our documentation.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          Was this page helpful?
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleFeedback('positive')}
            className={cn(
              'inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold shadow-sm transition-colors',
              feedback === 'positive'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-600',
            )}
            aria-label="Yes, this page was helpful"
          >
            <ThumbsUp
              className={cn("h-5 w-5", feedback === 'positive' && "fill-current")}
              aria-hidden="true"
            />
            <span>Yes</span>
          </button>
          <button
            type="button"
            onClick={() => handleFeedback('negative')}
            className={cn(
              'inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold shadow-sm transition-colors',
              feedback === 'negative'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-600',
            )}
            aria-label="No, this page was not helpful"
          >
            <ThumbsDown
              className={cn("h-5 w-5", feedback === 'negative' && "fill-current")}
              aria-hidden="true"
            />
            <span>No</span>
          </button>
        </div>
      </div>
    </div>
  );
}
