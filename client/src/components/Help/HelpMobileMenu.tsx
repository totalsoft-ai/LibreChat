import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Menu } from 'lucide-react';
import { cn } from '~/utils';

interface DocSection {
  id: string;
  title: string;
  order: number;
  filename: string;
}

interface HelpMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  sections: DocSection[];
  currentSection: string;
  onSectionChange: (sectionId: string) => void;
}

export default function HelpMobileMenu({
  isOpen,
  onClose,
  sections,
  currentSection,
  onSectionChange,
}: HelpMobileMenuProps) {
  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId);
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/80" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                  <button
                    type="button"
                    className="-m-2.5 p-2.5"
                    onClick={onClose}
                    aria-label="Close menu"
                  >
                    <X className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>

              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-50 px-6 pb-4 dark:bg-gray-800">
                <div className="flex h-16 shrink-0 items-center">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    TESSA Help
                  </h1>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {sections.map((section) => (
                          <li key={section.id}>
                            <button
                              onClick={() => handleSectionClick(section.id)}
                              className={cn(
                                'group flex w-full gap-x-3 rounded-md p-2 text-left text-sm font-semibold leading-6',
                                currentSection === section.id
                                  ? 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100'
                                  : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700',
                              )}
                            >
                              {section.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-300 lg:hidden"
      onClick={onClick}
      aria-label="Open menu"
    >
      <Menu className="h-6 w-6" aria-hidden="true" />
    </button>
  );
}
