import React, { useState } from 'react';
import { Download, Smartphone, WifiOff } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <Button size="sm" variant="outline" onClick={install}>
        <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span>{compact ? 'Install' : 'Install App'}</span>
      </Button>
    );
  }

  if (isIOS) {
    return (
      <>
        <Button size="sm" variant="outline" onClick={() => setShowIOSGuide(true)}>
          <Smartphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>{compact ? 'Install' : 'Install on iOS'}</span>
        </Button>
        <Modal
          open={showIOSGuide}
          onClose={() => setShowIOSGuide(false)}
          title="Install SkillPath AI on iPhone / iPad"
          maxWidth="md"
        >
          <ol className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <li>1. Tap the <strong>Share</strong> button in Safari’s toolbar.</li>
            <li>2. Scroll down and select <strong>Add to Home Screen</strong>.</li>
            <li>3. Tap <strong>Add</strong> to launch SkillPath AI like a native app with offline lesson caching.</li>
          </ol>
          <div className="mt-5 flex justify-end">
            <Button onClick={() => setShowIOSGuide(false)}>Got it</Button>
          </div>
        </Modal>
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-medium text-white shadow-lg md:bottom-6"
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>Offline Mode — Cached lessons & local mentor active</span>
    </div>
  );
};
