import { useState, useEffect } from 'react';
import { Megaphone } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TooltipAnchor } from '@librechat/client';
import { useLocalize } from '~/hooks';

// Matches `right-6`; the chat view's right-hand SidePanel (id="controls-nav")
// is a real flex sibling with variable width, so this button must shift left
// by that amount to avoid sitting on top of it, instead of just floating at
// a fixed viewport offset.
const BASE_OFFSET = 24;

function FeedbackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const localize = useLocalize();
  const [rightOffset, setRightOffset] = useState(BASE_OFFSET);

  useEffect(() => {
    let resizeObserver: ResizeObserver | undefined;
    let currentPanel: HTMLElement | undefined;

    const detach = () => {
      resizeObserver?.disconnect();
      resizeObserver = undefined;
      currentPanel = undefined;
    };

    const attach = (panel: HTMLElement) => {
      currentPanel = panel;
      setRightOffset(panel.offsetWidth + BASE_OFFSET);
      resizeObserver = new ResizeObserver(() => {
        setRightOffset(panel.offsetWidth + BASE_OFFSET);
      });
      resizeObserver.observe(panel);
    };

    const checkPanel = () => {
      const panel = document.getElementById('controls-nav');
      if (panel && panel !== currentPanel) {
        detach();
        attach(panel);
      } else if (!panel && currentPanel) {
        detach();
        setRightOffset(BASE_OFFSET);
      }
    };

    checkPanel();
    const interval = setInterval(checkPanel, 400);

    return () => {
      clearInterval(interval);
      detach();
    };
  }, [location.pathname]);

  if (location.pathname === '/feedback') {
    return null;
  }

  return (
    <TooltipAnchor
      description={localize('com_nav_feedback')}
      side="left"
      role="button"
      tabIndex={0}
      aria-label={localize('com_nav_feedback')}
      onClick={() => navigate('/feedback')}
      style={{ right: `${rightOffset}px`, transition: 'right 0.15s ease' }}
      className="fixed bottom-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
    >
      <Megaphone size={20} aria-hidden="true" />
    </TooltipAnchor>
  );
}

export default FeedbackButton;
