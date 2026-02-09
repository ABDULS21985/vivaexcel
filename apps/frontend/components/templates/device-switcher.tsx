'use client';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface DeviceSwitcherProps {
  currentDevice: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
}

const devices: { type: DeviceType; label: string; icon: JSX.Element }[] = [
  {
    type: 'desktop',
    label: 'Desktop',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    type: 'tablet',
    label: 'Tablet',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    type: 'mobile',
    label: 'Mobile',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export function DeviceSwitcher({ currentDevice, onDeviceChange }: DeviceSwitcherProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-gray-200 p-0.5 dark:bg-gray-700">
      {devices.map(({ type, label, icon }) => (
        <button
          key={type}
          onClick={() => onDeviceChange(type)}
          className={`rounded-md p-1.5 transition-colors ${
            currentDevice === type
              ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
          title={label}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
