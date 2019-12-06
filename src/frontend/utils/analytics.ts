import {
  isMobileOnly,
  isTablet,
  isSmartTV,
  isWearable,
  isConsole
} from "react-device-detect";

export const trackEvent = (event: string, articleId: string, audiofileId: string, sessionId: string, value?: any) => {
  const device =
  (isMobileOnly) ? 'mobile' :
  (isTablet) ? 'tablet' :
  (isSmartTV) ? 'smarttv' :
  (isWearable) ? 'wearable' :
  (isConsole) ? 'console' :
  'desktop';

  const referrer = document.referrer ? document.referrer : null;

  const eventData = {
    event,
    articleId,
    audiofileId,
    value,
    device,
    sessionId,
    referrer
  }

  return fetch(
    'https://player.playpost.app/v1/track',
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    }
  )
}
