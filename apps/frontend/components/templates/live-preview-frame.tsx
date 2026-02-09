'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { DeviceSwitcher } from './device-switcher';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const DEVICE_WIDTHS: Record<DeviceType, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

const DEVICE_HEIGHTS: Record<DeviceType, string> = {
  desktop: '600px',
  tablet: '600px',
  mobile: '667px',
};

interface LivePreviewFrameProps {
  url: string;
  title?: string;
  className?: string;
}

export function LivePreviewFrame({ url, title, className = '' }: LivePreviewFrameProps) {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between rounded-t-xl border border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          {title && (
            <span className="ml-3 text-sm font-medium text-gray-600 dark:text-gray-300">
              {title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex max-w-xs items-center rounded-md bg-white px-3 py-1 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
            <svg className="mr-1.5 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="truncate">{url}</span>
          </div>
          <DeviceSwitcher currentDevice={device} onDeviceChange={setDevice} />
        </div>
      </div>

      {/* Preview Frame */}
      <div className="relative flex justify-center overflow-hidden rounded-b-xl border border-t-0 border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-900">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              <span className="text-sm text-gray-500">Loading preview...</span>
            </div>
          </div>
        )}
        <motion.div
          animate={{ width: DEVICE_WIDTHS[device] }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="relative"
          style={{ maxWidth: '100%' }}
        >
          <iframe
            ref={iframeRef}
            src={url}
            title={title || 'Live Preview'}
            className="w-full border-0 bg-white"
            style={{ height: DEVICE_HEIGHTS[device] }}
            onLoad={() => setIsLoading(false)}
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </motion.div>
      </div>
    </div>
  );
}
