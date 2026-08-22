const API_URL = import.meta.env.PUBLIC_API_URL ?? "http://localhost:5000";

export interface Meaning {
  id: number;
  name: string | null;
}

export interface WordClass {
  id: number;
  name: string;
  abbreviation: string;
}

export interface Language {
  id: number;
  name: string;
}

export interface WordSummary {
  id: number;
  text: string;
  pronunciation: string | null;
  meanings: Meaning[];
  word_class: WordClass | null;
  language: Language | null;
  related_words?: WordSummary[];
}

export interface WordDetail extends WordSummary {
  definition: string | null;
  example_original: string | null;
  example_translation: string | null;
  related_words: WordSummary[];
}

export interface Verse {
  type: string;
  content: string[];
  order: number;
}

export interface SongSummary {
  id: number;
  title: string;
  composer: string | null;
  description: string | null;
}

export interface SongDetail extends SongSummary {
  verses: Verse[];
}

export async function fetchAllWords(letter?: string): Promise<WordSummary[]> {
  const params = new URLSearchParams({ limit: "2000" });
  if (letter) params.set("letter", letter);
  const res = await fetch(`${API_URL}/dictionary?${params}`);
  if (!res.ok) throw new Error("Gagal mengambil data kamus");
  return res.json();
}

export async function fetchWord(id: number): Promise<WordDetail> {
  const res = await fetch(`${API_URL}/dictionary/${id}`);
  if (!res.ok) throw new Error("Kata tidak ditemukan");
  return res.json();
}

export async function fetchAllSongs(): Promise<SongSummary[]> {
  const res = await fetch(`${API_URL}/songs`);
  if (!res.ok) throw new Error("Gagal mengambil data lagu");
  return res.json();
}

export async function fetchSong(id: number): Promise<SongDetail> {
  const res = await fetch(`${API_URL}/songs/${id}`);
  if (!res.ok) throw new Error("Lagu tidak ditemukan");
  return res.json();
}
