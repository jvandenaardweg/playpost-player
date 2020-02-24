export declare namespace Api {
  interface Article {
    id: string;
    title: string;
    url: string;
    description: string | null;
    canonicalUrl: string | null;
    imageUrl: string | null;
    audiofiles: Audiofile[];
    sourceName: string;
  }

  interface Audiofile {
    id: string;
    url: string;
    voice: Voice;
    length: number;
    article: Article;
    voice: Voice;
  }

  interface Voice {
    id: string;
    label: string;
    length: number;
    languageCode: string;
  }
}
