import { useNavigate } from 'react-router-dom';
import { useLocalize } from '~/hooks';

function HeaderFeedback() {
  const navigate = useNavigate();
  const localize = useLocalize();

  return (
    <button
      type="button"
      aria-label={localize('com_nav_feedback')}
      onClick={() => navigate('/feedback')}
      className="inline-flex h-10 flex-shrink-0 items-center rounded-xl border border-border-light bg-transparent px-3 text-sm font-medium text-text-primary transition-all ease-in-out hover:bg-surface-tertiary"
    >
      {localize('com_nav_feedback')}
    </button>
  );
}

export default HeaderFeedback;
