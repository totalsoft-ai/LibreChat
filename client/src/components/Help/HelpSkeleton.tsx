export default function HelpSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse">
      {/* Title skeleton */}
      <div className="mb-8">
        <div className="h-10 w-3/4 rounded-md bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {/* Content skeleton */}
      <div className="space-y-4">
        {/* Paragraph 1 */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>

        {/* Section heading */}
        <div className="mt-8 h-8 w-2/3 rounded-md bg-gray-200 dark:bg-gray-700"></div>

        {/* Paragraph 2 */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>

        {/* Section heading */}
        <div className="mt-8 h-8 w-1/2 rounded-md bg-gray-200 dark:bg-gray-700"></div>

        {/* List items */}
        <div className="space-y-3 pl-4">
          <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>

        {/* Paragraph 3 */}
        <div className="mt-6 space-y-2">
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    </div>
  );
}
