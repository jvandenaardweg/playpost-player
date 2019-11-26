export const trackEvent = (event: string, articleId: string, audiofileId: string, value?: any) => {
  const eventData = {
    event,
    articleId,
    audiofileId,
    value
  }

  return fetch('https://player.playpost.app/v1/track', { method: 'POST', body: JSON.stringify(eventData) })
}
