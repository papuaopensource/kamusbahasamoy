import type { Alpine } from "alpinejs";
import {
  fetchAllSongs,
  fetchAllWords,
  fetchSong,
  fetchWord,
  type SongDetail,
  type SongSummary,
  type WordDetail,
  type WordSummary,
} from "@/lib/api";

const meaningText = (word: WordSummary) => {
  const meanings = word.meanings.map((meaning) => meaning.name).filter(Boolean);
  return meanings.length > 0 ? meanings.join(", ") : "Tidak ada arti";
};

type TranslationSuggestion = {
  label: string;
  translation: string;
  category: string;
};

const speak = (text: string) => {
  if (!("speechSynthesis" in window) || !text) return false;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "id-ID";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
};

export default (Alpine: Alpine) => {
  Alpine.data("translator", () => ({
    words: [] as WordSummary[],
    loading: true,
    error: "",
    inputText: "",
    translatedText: "",
    reversed: false,
    suggestions: [] as TranslationSuggestion[],
    showSuggestions: false,
    translationHint: "",
    currentWord: null as WordSummary | WordDetail | null,
    relatedWords: [] as string[],
    dialogOpen: false,
    loadingDetail: false,
    detailError: "",
    notice: "",

    async init() {
      try {
        this.words = await fetchAllWords();
      } catch (reason) {
        this.error =
          reason instanceof Error ? reason.message : "Data kamus gagal dimuat.";
      } finally {
        this.loading = false;
      }
    },

    meanings(word: WordSummary) {
      return meaningText(word);
    },

    relatedSourceWords(word: WordSummary) {
      return (word.related_words ?? [])
        .map((related) =>
          this.reversed ? related.text : (related.meanings?.[0]?.name ?? ""),
        )
        .filter(Boolean);
    },

    translate() {
      const input = this.inputText.trim().toLowerCase();
      if (!input || this.words.length === 0) {
        this.translatedText = "";
        this.translationHint = "";
        this.currentWord = null;
        this.relatedWords = [];
        return;
      }

      const exact = this.reversed
        ? this.words.find((word) => word.text.toLowerCase() === input)
        : this.words.find((word) =>
            word.meanings.some(
              (meaning) => meaning.name?.toLowerCase() === input,
            ),
          );

      if (exact) {
        this.translatedText = this.reversed
          ? (exact.meanings[0]?.name ?? "Tidak ada terjemahan")
          : exact.text;
        this.currentWord = exact;
        this.relatedWords = this.relatedSourceWords(exact);
        this.translationHint = "Padanan langsung ditemukan di dalam kamus.";
        return;
      }

      const found: WordSummary[] = [];
      const inputParts = input.split(/\s+/);
      this.translatedText = inputParts
        .map((part) => {
          const word = this.reversed
            ? this.words.find((item) => item.text.toLowerCase() === part)
            : this.words.find((item) =>
                item.meanings.some(
                  (meaning) => meaning.name?.toLowerCase() === part,
                ),
              );
          if (!word) return part;
          found.push(word);
          return this.reversed
            ? (word.meanings[0]?.name ?? "Tidak ada terjemahan")
            : word.text;
        })
        .join(" ");

      this.currentWord = found.length === 1 ? found[0] : null;
      this.relatedWords = this.currentWord
        ? this.relatedSourceWords(this.currentWord)
        : [];
      const unmatchedCount = inputParts.length - found.length;
      this.translationHint =
        found.length === 0
          ? "Belum ada padanan yang ditemukan. Teks ditampilkan kembali tanpa perubahan."
          : unmatchedCount > 0
            ? `${found.length} kata ditemukan. ${unmatchedCount} kata yang belum tersedia dipertahankan seperti input.`
            : `${found.length} kata ditemukan dan diterjemahkan dari data kamus.`;
    },

    updateSuggestions() {
      const part = this.inputText.trim().toLowerCase().split(/\s+/).pop() ?? "";
      if (!part) {
        this.suggestions = [];
        this.showSuggestions = false;
        return;
      }

      const matches = this.words.flatMap((word) => {
        const category = word.word_class?.name ?? "kelas kata belum tersedia";
        if (this.reversed) {
          return word.text.toLowerCase().startsWith(part)
            ? [
                {
                  label: word.text,
                  translation: meaningText(word),
                  category,
                },
              ]
            : [];
        }

        return word.meanings
          .map((meaning) => meaning.name)
          .filter(
            (meaning): meaning is string =>
              Boolean(meaning) && meaning.toLowerCase().startsWith(part),
          )
          .map((meaning) => ({
            label: meaning,
            translation: word.text,
            category,
          }));
      });

      this.suggestions = [
        ...new Map(
          matches.map((item) => [item.label.toLowerCase(), item]),
        ).values(),
      ].slice(0, 5);
      this.showSuggestions = this.suggestions.length > 0;
    },

    applySuggestion(suggestion: TranslationSuggestion) {
      const parts = this.inputText.trim().split(/\s+/);
      parts.pop();
      parts.push(suggestion.label);
      this.inputText = parts.join(" ");
      this.showSuggestions = false;
      this.translate();
    },

    swapLanguages() {
      this.reversed = !this.reversed;
      const previousInput = this.inputText;
      this.inputText = this.translatedText;
      this.translatedText = previousInput;
      this.currentWord = null;
      this.relatedWords = [];
      this.translationHint = "";
      this.updateSuggestions();
      this.translate();
    },

    speakText(text: string) {
      if (!speak(text)) {
        this.showNotice("Browser ini belum mendukung pemutaran suara.");
      }
    },

    async copyTranslation() {
      if (!this.translatedText) return;
      try {
        await navigator.clipboard.writeText(this.translatedText);
        this.showNotice("Terjemahan telah disalin.");
      } catch {
        this.showNotice("Terjemahan belum dapat disalin oleh browser ini.");
      }
    },

    showNotice(message: string) {
      this.notice = message;
      window.setTimeout(() => {
        this.notice = "";
      }, 2400);
    },

    selectRelated(word: string) {
      this.inputText = word;
      this.showSuggestions = false;
      this.translate();
    },

    findRelated(word: string) {
      return this.words.find((item) =>
        this.reversed
          ? item.text.toLowerCase() === word.toLowerCase()
          : item.meanings.some(
              (meaning) => meaning.name?.toLowerCase() === word.toLowerCase(),
            ),
      );
    },

    relatedTarget(word: string) {
      const related = this.findRelated(word);
      if (!related) return "";
      return this.reversed ? meaningText(related) : related.text;
    },

    async openDetail(word?: WordSummary) {
      const target = word ?? this.currentWord;
      if (!target) return;
      this.dialogOpen = true;
      this.loadingDetail = true;
      this.detailError = "";
      this.currentWord = target;
      try {
        this.currentWord = await fetchWord(target.id);
      } catch (reason) {
        this.detailError =
          reason instanceof Error
            ? reason.message
            : "Detail kata gagal dimuat.";
      } finally {
        this.loadingDetail = false;
      }
    },

    closeDialog() {
      this.dialogOpen = false;
      this.detailError = "";
    },
  }));

  Alpine.data("vocabulary", () => ({
    words: [] as WordSummary[],
    loading: true,
    error: "",
    searchQuery: "",
    selectedCategory: "all",
    activeLetter: "",
    sortOrder: "asc" as "asc" | "desc",
    viewMode: "grid" as "grid" | "list",
    selectedWord: null as WordSummary | null,
    wordDetail: null as WordDetail | null,
    dialogOpen: false,
    loadingDetail: false,
    detailError: "",

    async init() {
      await this.loadWords();
    },

    async loadWords() {
      this.loading = true;
      this.error = "";
      try {
        this.words = await fetchAllWords();
      } catch (reason) {
        this.error =
          reason instanceof Error ? reason.message : "Data kamus gagal dimuat.";
      } finally {
        this.loading = false;
      }
    },

    get categories() {
      return [
        ...new Set(
          this.words
            .map((word) => word.word_class?.name)
            .filter((name): name is string => Boolean(name)),
        ),
      ].sort();
    },

    categoryCount(category: string) {
      return this.words.filter((word) => word.word_class?.name === category)
        .length;
    },

    get filteredWords() {
      const query = this.searchQuery.trim().toLowerCase();
      return this.words
        .filter((word) => {
          const matchesSearch =
            !query ||
            word.text.toLowerCase().includes(query) ||
            word.meanings.some((meaning) =>
              meaning.name?.toLowerCase().includes(query),
            );
          const matchesCategory =
            this.selectedCategory === "all" ||
            word.word_class?.name === this.selectedCategory;
          return matchesSearch && matchesCategory;
        })
        .sort((first, second) =>
          this.sortOrder === "asc"
            ? first.text.localeCompare(second.text)
            : second.text.localeCompare(first.text),
        );
    },

    get groupedWords() {
      const groups = new Map<string, WordSummary[]>();

      for (const word of this.filteredWords) {
        const firstCharacter = word.text.trim().charAt(0).toUpperCase();
        const letter = /^[A-Z]$/.test(firstCharacter) ? firstCharacter : "#";
        const group = groups.get(letter) ?? [];
        group.push(word);
        groups.set(letter, group);
      }

      return Array.from(groups, ([letter, words]) => ({ letter, words }));
    },

    get availableLetters() {
      return this.groupedWords.map((group) => group.letter);
    },

    meanings(word: WordSummary) {
      return meaningText(word);
    },

    resetAlphabet(scroller?: HTMLElement) {
      if (!scroller) return;
      scroller.scrollTop = 0;
      this.activeLetter = this.groupedWords[0]?.letter ?? "";
    },

    scrollToLetter(letter: string, scroller?: HTMLElement) {
      if (!scroller) return;
      const target = scroller.querySelector<HTMLElement>(
        `[data-letter="${letter}"]`,
      );
      if (!target) return;

      this.activeLetter = letter;
      scroller.scrollTo({
        top: Math.max(target.offsetTop - 8, 0),
        behavior: "smooth",
      });
    },

    updateActiveLetter(scroller?: HTMLElement) {
      if (!scroller) return;
      const groups = Array.from(
        scroller.querySelectorAll<HTMLElement>("[data-letter]"),
      );
      if (groups.length === 0) {
        this.activeLetter = "";
        return;
      }

      const marker = scroller.scrollTop + 32;
      let active = groups[0].dataset.letter ?? "";
      for (const group of groups) {
        if (group.offsetTop > marker) break;
        active = group.dataset.letter ?? active;
      }
      this.activeLetter = active;
    },

    speakText(text: string) {
      speak(text);
    },

    async openDetail(word: WordSummary) {
      this.selectedWord = word;
      this.wordDetail = null;
      this.dialogOpen = true;
      this.loadingDetail = true;
      this.detailError = "";
      try {
        this.wordDetail = await fetchWord(word.id);
      } catch (reason) {
        this.detailError =
          reason instanceof Error
            ? reason.message
            : "Detail kata gagal dimuat.";
      } finally {
        this.loadingDetail = false;
      }
    },

    closeDialog() {
      this.dialogOpen = false;
      this.selectedWord = null;
      this.wordDetail = null;
      this.detailError = "";
    },
  }));

  Alpine.data("songs", () => ({
    songs: [] as SongSummary[],
    loading: true,
    error: "",
    searchQuery: "",
    selectedComposer: "",
    sortOrder: "title-asc",
    selectedSong: null as SongSummary | null,
    songDetail: null as SongDetail | null,
    dialogOpen: false,
    loadingDetail: false,
    detailError: "",

    async init() {
      try {
        this.songs = await fetchAllSongs();
      } catch (reason) {
        this.error =
          reason instanceof Error ? reason.message : "Data lagu gagal dimuat.";
      } finally {
        this.loading = false;
      }
    },

    get composers() {
      return [
        ...new Set(
          this.songs
            .map((song) => song.composer)
            .filter((composer): composer is string => Boolean(composer)),
        ),
      ].sort();
    },

    get filteredSongs() {
      const query = this.searchQuery.trim().toLowerCase();
      const [field, direction] = this.sortOrder.split("-");
      return this.songs
        .filter((song) => {
          const matchesSearch =
            !query ||
            song.title.toLowerCase().includes(query) ||
            song.composer?.toLowerCase().includes(query) ||
            song.description?.toLowerCase().includes(query);
          const matchesComposer =
            !this.selectedComposer ||
            (this.selectedComposer === "unknown" && !song.composer) ||
            song.composer === this.selectedComposer;
          return matchesSearch && matchesComposer;
        })
        .sort((first, second) => {
          const firstValue =
            field === "title" ? first.title : (first.composer ?? "zzz");
          const secondValue =
            field === "title" ? second.title : (second.composer ?? "zzz");
          return direction === "asc"
            ? firstValue.localeCompare(secondValue)
            : secondValue.localeCompare(firstValue);
        });
    },

    async openDetail(song: SongSummary) {
      this.selectedSong = song;
      this.songDetail = null;
      this.dialogOpen = true;
      this.loadingDetail = true;
      this.detailError = "";
      try {
        this.songDetail = await fetchSong(song.id);
      } catch (reason) {
        this.detailError =
          reason instanceof Error ? reason.message : "Lirik gagal dimuat.";
      } finally {
        this.loadingDetail = false;
      }
    },

    verseLabel(verse: { type: string }, index: number) {
      if (verse.type !== "verse") return "Reff";
      const count =
        this.songDetail?.verses
          .slice(0, index + 1)
          .filter((item) => item.type === "verse").length ?? 1;
      return `Bait ${count}`;
    },

    closeDialog() {
      this.dialogOpen = false;
      this.selectedSong = null;
      this.songDetail = null;
      this.detailError = "";
    },
  }));
};
