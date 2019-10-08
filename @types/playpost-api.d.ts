export declare namespace Api {
  interface Article {
    id: string;
    title: string;
    url: string;
    audiofiles: Audiofile[];
    sourceName: string;
  }

  interface Audiofile {
    id: string;
    url: string;
    voice: Voice;
    length: number;
  }

  interface Voice {
    id: string;
    label: string;
    length: number;
    languageCode: string;
  }
}
