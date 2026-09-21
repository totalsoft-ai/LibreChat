import { memo } from 'react';
import { Spinner } from '@librechat/client';
import { useLocalize } from '~/hooks';

const ThinkingIndicator = memo(() => {
  const localize = useLocalize();
  return (
    <div className="text-message mb-[0.625rem] flex min-h-[20px] items-center gap-2 text-text-secondary">
      <Spinner className="size-4" />
      <span className="shimmer">{localize('com_ui_thinking')}</span>
    </div>
  );
});

export default ThinkingIndicator;
