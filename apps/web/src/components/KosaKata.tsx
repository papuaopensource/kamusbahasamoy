'use client';

import { DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  ChevronDown,
  Home,
  Search,
  Volume2,
  Sparkles,
  Grid,
  List,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';
import {
  fetchAllWords,
  fetchWord,
  type WordSummary,
  type WordDetail,
} from '@/lib/api';

// Helper function to get category color
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'nomina':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'verba':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'adjektiva':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'pronomina':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'adverbia':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
    case 'numeralia':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'frasa':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

const getCategoryIcon = (_category: string) => {
  return <Sparkles className="h-3.5 w-3.5" />;
};

const getMeaningsAsString = (meanings: WordSummary['meanings']) => {
  if (!meanings || meanings.length === 0) return 'Tidak ada arti';
  const names = meanings.map((m) => m.name).filter(Boolean);
  return names.length > 0 ? names.join(', ') : 'Tidak ada arti';
};

const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function KosaKataPage() {
  const [words, setWords] = useState<WordSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentWordDetails, setCurrentWordDetails] =
    useState<WordDetail | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchAllWords(selectedLetter || undefined)
      .then(setWords)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedLetter]);

  const categories = useMemo(() => {
    const seen = new Map<string, { id: string; name: string }>();
    for (const word of words) {
      const wc = word.word_class;
      if (wc && !seen.has(wc.name)) {
        seen.set(wc.name, {
          id: wc.name,
          name: `${wc.name.charAt(0).toUpperCase() + wc.name.slice(1)} (${wc.abbreviation})`,
        });
      }
    }
    return [{ id: 'all', name: 'Semua' }, ...Array.from(seen.values())];
  }, [words]);

  const filteredVocabulary = useMemo(() => {
    return words
      .filter((word) => {
        const matchesSearch =
          searchQuery === '' ||
          word.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          word.meanings.some((m) =>
            m.name?.toLowerCase().includes(searchQuery.toLowerCase())
          );

        const matchesCategory =
          selectedCategory === 'all' ||
          word.word_class?.name === selectedCategory;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) =>
        sortOrder === 'asc'
          ? a.text.localeCompare(b.text)
          : b.text.localeCompare(a.text)
      );
  }, [words, searchQuery, selectedCategory, sortOrder]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      window.speechSynthesis.speak(utterance);
    }
  };

  const openWordDetail = async (word: WordSummary) => {
    setDialogOpen(true);
    setCurrentWordDetails(null);
    setLoadingDetail(true);
    try {
      const detail = await fetchWord(word.id);
      setCurrentWordDetails(detail);
    } finally {
      setLoadingDetail(false);
    }
  };

  const WordCard = ({ word }: { word: WordSummary }) => (
    <Dialog
      open={dialogOpen && currentWordDetails?.id === word.id}
      onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) setCurrentWordDetails(null);
      }}
    >
      <DialogTrigger asChild>
        <Card
          className="hover:bg-muted/50 cursor-pointer rounded-sm py-2 shadow-none transition-colors"
          onClick={() => openWordDetail(word)}
        >
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{word.text}</h3>
                <p className="text-muted-foreground text-sm">
                  {getMeaningsAsString(word.meanings)}
                </p>
              </div>
              <Badge
                variant="outline"
                className={`flex items-center gap-1 text-xs ${getCategoryColor(word.word_class?.name ?? '')}`}
              >
                {getCategoryIcon(word.word_class?.name ?? '')}
                {word.word_class?.name ?? '—'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader className="pr-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-2xl">
              {word.text}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => speakText(word.text)}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <div className="mr-4 flex gap-1">
              <Badge
                variant="outline"
                className={`flex items-center gap-1 text-xs ${getCategoryColor(word.word_class?.name ?? '')}`}
              >
                {getCategoryIcon(word.word_class?.name ?? '')}
                <span className="max-w-20 truncate">
                  {word.word_class?.name ?? '—'}
                </span>
              </Badge>
            </div>
          </div>
          <DialogDescription className="mt-1 text-left text-base font-medium">
            {getMeaningsAsString(word.meanings)}
          </DialogDescription>
        </DialogHeader>

        {loadingDetail && !currentWordDetails ? (
          <p className="text-muted-foreground py-4 text-sm">Memuat detail...</p>
        ) : currentWordDetails ? (
          <div className="space-y-4 py-4">
            <div>
              <h4 className="text-muted-foreground mb-2 text-sm font-medium">
                Definisi
              </h4>
              <p className="text-sm">
                {currentWordDetails.definition ?? 'Tidak ada definisi'}
              </p>
            </div>

            <div>
              <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                Contoh Kalimat
              </h4>
              {currentWordDetails.example_original ||
              currentWordDetails.example_translation ? (
                <div className="bg-muted/30 rounded-md p-3">
                  <p className="text-sm">
                    {currentWordDetails.example_original}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {currentWordDetails.example_translation}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Tidak ada contoh kalimat
                </p>
              )}
            </div>

            {currentWordDetails.pronunciation && (
              <div>
                <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                  Pengucapan
                </h4>
                <p className="text-sm">{currentWordDetails.pronunciation}</p>
              </div>
            )}

            <Separator />

            <div>
              <h4 className="text-muted-foreground mb-2 text-sm font-medium">
                Kata Terkait
              </h4>
              {currentWordDetails.related_words.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {currentWordDetails.related_words.map((related) => (
                    <Button
                      key={related.id}
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        setDialogOpen(false);
                        setTimeout(() => setSearchQuery(related.text), 100);
                      }}
                    >
                      {related.text}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Tidak ada kata terkait
                </p>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );

  const WordRow = ({ word }: { word: WordSummary }) => (
    <Dialog
      open={dialogOpen && currentWordDetails?.id === word.id}
      onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) setCurrentWordDetails(null);
      }}
    >
      <DialogTrigger asChild>
        <div
          className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-md border p-3 transition-colors"
          onClick={() => openWordDetail(word)}
        >
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-1.5 rounded-full ${getCategoryColor(word.word_class?.name ?? '').split(' ')[0]}`}
            />
            <div>
              <h3 className="font-medium">{word.text}</h3>
              <p className="text-muted-foreground text-sm">
                {getMeaningsAsString(word.meanings)}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`flex items-center gap-1 text-xs ${getCategoryColor(word.word_class?.name ?? '')}`}
          >
            {getCategoryIcon(word.word_class?.name ?? '')}
            {word.word_class?.name ?? '—'}
          </Badge>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader className="pr-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-2xl">
              {word.text}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => speakText(word.text)}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <div className="mr-4 flex gap-1">
              <Badge
                variant="outline"
                className={`flex items-center gap-1 text-xs ${getCategoryColor(word.word_class?.name ?? '')}`}
              >
                {getCategoryIcon(word.word_class?.name ?? '')}
                <span className="max-w-20 truncate">
                  {word.word_class?.name ?? '—'}
                </span>
              </Badge>
            </div>
          </div>
          <DialogDescription className="mt-1 text-base font-medium">
            {getMeaningsAsString(word.meanings)}
          </DialogDescription>
        </DialogHeader>

        {loadingDetail && !currentWordDetails ? (
          <p className="text-muted-foreground py-4 text-sm">Memuat detail...</p>
        ) : currentWordDetails ? (
          <div className="space-y-4 py-4">
            <div>
              <h4 className="text-muted-foreground mb-2 text-sm font-medium">
                Definisi
              </h4>
              <p className="text-sm">
                {currentWordDetails.definition ?? 'Tidak ada definisi'}
              </p>
            </div>
            <div>
              <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                Contoh Kalimat
              </h4>
              {currentWordDetails.example_original ||
              currentWordDetails.example_translation ? (
                <div className="bg-muted/30 rounded-md p-3">
                  <p className="text-sm">
                    {currentWordDetails.example_original}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {currentWordDetails.example_translation}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Tidak ada contoh kalimat
                </p>
              )}
            </div>
            {currentWordDetails.pronunciation && (
              <div>
                <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                  Pengucapan
                </h4>
                <p className="text-sm">{currentWordDetails.pronunciation}</p>
              </div>
            )}
            <Separator />
            <div>
              <h4 className="text-muted-foreground mb-2 text-sm font-medium">
                Kata Terkait
              </h4>
              {currentWordDetails.related_words.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {currentWordDetails.related_words.map((related) => (
                    <Button
                      key={related.id}
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        setDialogOpen(false);
                        setTimeout(() => setSearchQuery(related.text), 100);
                      }}
                    >
                      {related.text}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Tidak ada kata terkait
                </p>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <div className="mb-6 flex items-center gap-2">
        <Home className="text-muted-foreground h-4 w-4" />
        <a
          href="/"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          Beranda
        </a>
        <span className="text-muted-foreground mx-1">/</span>
        <span className="text-sm font-medium">Kosa Kata</span>
      </div>

      <div className="grid gap-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Kosa Kata</h1>
            <p className="text-muted-foreground">
              Jelajahi kosa kata bahasa Indonesia dan terjemahannya dalam bahasa
              Moy
            </p>
          </div>
          <div className="relative w-full md:w-65">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Cari kata..."
              className="bg-white pl-9 shadow-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="w-full space-y-4">
          <Card className='shadow-none'>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Daftar Kosa Kata</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span>
                      Total: {loading ? '...' : `${words.length} kata`}
                    </span>
                    {!loading &&
                      (selectedCategory !== 'all' ||
                        searchQuery ||
                        selectedLetter) && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span>
                            Ditampilkan: {filteredVocabulary.length} kata
                          </span>
                        </>
                      )}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 shadow-none">
                        {selectedCategory === 'all'
                          ? 'Semua Kategori'
                          : categories.find((c) => c.id === selectedCategory)
                              ?.name || 'Kategori'}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-55">
                      <DropdownMenuRadioGroup
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                      >
                        <DropdownMenuRadioItem value="all">
                          Semua Kategori
                          <span className="text-muted-foreground ml-auto text-xs">
                            {words.length}
                          </span>
                        </DropdownMenuRadioItem>
                        <DropdownMenuSeparator />
                        {categories.slice(1).map((category) => (
                          <DropdownMenuRadioItem
                            key={category.id}
                            value={category.id}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2 w-2 rounded-full ${getCategoryColor(category.id).split(' ')[0]}`}
                              />
                              {category.name}
                            </div>
                            <span className="text-muted-foreground ml-auto text-xs">
                              {
                                words.filter(
                                  (w) => w.word_class?.name === category.id
                                ).length
                              }
                            </span>
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <ToggleGroup
                    type="single"
                    value={viewMode}
                    onValueChange={(value) =>
                      value && setViewMode(value as 'grid' | 'list')
                    }
                  >
                    <ToggleGroupItem value="grid" aria-label="Grid View">
                      <Grid className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="list" aria-label="List View">
                      <List className="h-4 w-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        {sortOrder === 'asc' ? (
                          <SortAsc className="mr-2 h-4 w-4" />
                        ) : (
                          <SortDesc className="mr-2 h-4 w-4" />
                        )}
                        {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuRadioGroup
                        value={sortOrder}
                        onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}
                      >
                        <DropdownMenuRadioItem value="asc">
                          <SortAsc className="mr-2 h-4 w-4" />
                          A-Z
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="desc">
                          <SortDesc className="mr-2 h-4 w-4" />
                          Z-A
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-2">
                <Button
                  className={
                    selectedLetter === ''
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-black hover:text-white'
                  }
                  size="sm"
                  onClick={() => setSelectedLetter('')}
                >
                  Semua
                </Button>
                {alphabets.map((letter) => (
                  <Button
                    key={letter}
                    className={
                      selectedLetter === letter
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-black hover:text-white'
                    }
                    size="sm"
                    onClick={() => setSelectedLetter(letter)}
                  >
                    {letter}
                  </Button>
                ))}
              </div>

              <ScrollArea className="h-125 pr-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground">
                      Memuat data kamus...
                    </p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-destructive">{error}</p>
                  </div>
                ) : filteredVocabulary.length > 0 ? (
                  viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {filteredVocabulary.map((word) => (
                        <WordCard key={word.id} word={word} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredVocabulary.map((word) => (
                        <WordRow key={word.id} word={word} />
                      ))}
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BookOpen className="text-muted-foreground mb-4 h-12 w-12" />
                    <h3 className="text-lg font-medium">
                      Tidak ada kata yang ditemukan
                    </h3>
                    <p className="text-muted-foreground">
                      Coba ubah filter atau kata kunci pencarian Anda
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
