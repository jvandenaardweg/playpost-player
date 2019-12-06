export const getCacheKey = (articleId: string, audiofileId: string): string => {
  const cacheKey = `v1/articles/${articleId}/audiofiles/${audiofileId}`;
  return cacheKey;
}
