import {
  isMobileOnly,
  isTablet,
  isSmartTV,
  isWearable,
  isConsole,
} from "react-device-detect";

export const getDevice = (): 'mobile' | 'tablet' | 'smarttv' | 'wearable' | 'console' | 'desktop' => {
  const device =
  (isMobileOnly) ? 'mobile' :
  (isTablet) ? 'tablet' :
  (isSmartTV) ? 'smarttv' :
  (isWearable) ? 'wearable' :
  (isConsole) ? 'console' :
  'desktop';

  return device;
}
