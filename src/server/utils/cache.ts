export const getArticleCacheKey = (articleId: string, audiofileId: string): string => {
  const cacheKey = `v1/articles/${articleId}/audiofiles/${audiofileId}`;
  return cacheKey;
}

export const getAudiofileCacheKey = (audiofileId: string): string => {
  const cacheKey = `v1/${audiofileId}`;
  return cacheKey;
}

