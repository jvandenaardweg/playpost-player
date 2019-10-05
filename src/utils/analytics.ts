export const trackEvent = (name: string, articleId: string, data?: object) => {
  return new Promise((resolve, reject) => {
    return resolve(console.log('Should track:', name, articleId, data))
  })
}
