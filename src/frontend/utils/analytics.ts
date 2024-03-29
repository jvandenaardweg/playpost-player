import { getDevice } from "./device";
import { getPlatform } from "./platform";

export const trackEvent = (event: string, articleId: string, audiofileId: string, sessionId: string, value?: any) => {
  const device = getDevice()
  const platform = getPlatform(window.navigator)

  const urlParams = new URLSearchParams(window.location.search);
  const referrerParam = urlParams.get('referrer'); // Embedly returns this as the referrer, so prefer that
  const referrer = (referrerParam) ? referrerParam : document.referrer ? document.referrer : null;

  const eventData = {
    event,
    articleId,
    audiofileId,
    value,
    device,
    platform,
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
