import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getBookById, getImageUrl, createCraftStorySVG, fetchStoryAudio } from '../services/api';
import Navbar from '../components/Navbar';
import FloatingClouds from '../components/FloatingClouds';
import Button from '../components/Button';
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen, Share2, Sparkles, ImageOff, Volume2, Play, Pause, Square, Loader2, Globe } from 'lucide-react';

export default function BookReaderPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrorMap, setImageErrorMap] = useState({});

  // Audio narration state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioRef = useRef(null);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsAudioLoading(false);
  };

  // Stop audio whenever page index changes
  useEffect(() => {
    stopAudio();
  }, [currentPageIndex]);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const found = await getBookById(id);
        setBook(found);
      } finally {
        setIsLoading(false);
      }
    }
    load();
    return () => stopAudio();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#D4E8FA] flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-stone-800 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[#D4E8FA] flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <h2 className="font-craft-serif text-3xl font-normal text-stone-900 mb-2">
            Storybook not found
          </h2>
          <p className="text-stone-500 text-sm mb-4">
            This volume may have drifted away or been removed from your shelf.
          </p>
          <Link to="/dashboard">
            <Button variant="primary" size="md">
              Return to bookshelf
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const pages = book.pages || [];
  const totalPages = pages.length;
  const currentPage = pages[currentPageIndex] || {
    pageNumber: currentPageIndex + 1,
    title: book.title,
    text: book.prompt,
    image: book.coverImage,
    caption: 'Story illustration',
  };

  const dynamicCraftArt = createCraftStorySVG({
    title: currentPage.title || book.title,
    pageNumber: currentPage.pageNumber || currentPageIndex + 1,
    style: book.style,
    promptText: currentPage.text || currentPage.imagePrompt || book.prompt,
  });

  const currentImageSrc = imageErrorMap[currentPageIndex]
    ? dynamicCraftArt
    : (getImageUrl(currentPage.image) || getImageUrl(book.coverImage) || dynamicCraftArt);

  const hasPrev = currentPageIndex > 0;
  const hasNext = currentPageIndex < totalPages - 1;

  const styleLabels = {
    comic: 'Color Comic',
    comic_color: 'Color Comic',
    comic_bw: 'Black & White Ink',
    ink: 'Black & White Ink',
    storybook: 'Storybook Watercolor',
    watercolor: 'Storybook Watercolor',
  };

  const handleToggleNarration = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    if (!currentPage.text) return;

    setIsAudioLoading(true);

    try {
      // 1. Try ElevenLabs TTS server endpoint
      const result = await fetchStoryAudio(currentPage.text);

      if (result.audioUrl) {
        const audio = new Audio(result.audioUrl);
        audioRef.current = audio;
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => fallbackWebSpeech();
        await audio.play();
        setIsPlaying(true);
        setIsAudioLoading(false);
        return;
      }
    } catch (err) {
      console.warn('[Narration] ElevenLabs failed, falling back to Web Speech:', err);
    }

    fallbackWebSpeech();
  };

  const fallbackWebSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in your browser.');
      setIsAudioLoading(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentPage.text);
    
    // Set speech language if available
    const langMap = {
      English: 'en-US',
      Spanish: 'es-ES',
      French: 'fr-FR',
      German: 'de-DE',
      Hindi: 'hi-IN',
      Bengali: 'bn-IN',
      Japanese: 'ja-JP',
      Italian: 'it-IT',
      Portuguese: 'pt-PT',
    };
    if (book.language && langMap[book.language]) {
      utterance.lang = langMap[book.language];
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsAudioLoading(false);
  };

  return (
    <div className="relative min-h-screen bg-[#D4E8FA] flex flex-col justify-between overflow-x-hidden">
      <FloatingClouds variant="subtle" />
      <Navbar />

      <main className="relative z-20 flex-1 max-w-5xl mx-auto w-full px-4 sm:px-8 pt-6 pb-16">
        {/* Navigation & Book Info bar */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-stone-700 hover:text-black bg-white/80 backdrop-blur-xs px-4 py-2 rounded-full border border-white/90 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Bookshelf</span>
          </Link>

          <div className="flex items-center space-x-2">
            {book.language && (
              <span className="text-xs bg-sky-600 text-white px-3 py-1.5 rounded-full font-semibold flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <span>{book.language}</span>
              </span>
            )}
            <span className="text-xs bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/90 text-stone-700 font-medium">
              {styleLabels[book.style] || book.style}
            </span>
            <span className="text-xs bg-[#0D1116] text-white px-3 py-1.5 rounded-full font-medium">
              Page {currentPageIndex + 1} of {totalPages}
            </span>
          </div>
        </div>

        {/* Reader Book Spread Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl sm:rounded-[36px] border-2 border-white/95 shadow-[0_28px_60px_rgba(20,45,75,0.12)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[480px]">
            {/* Left Column: Illustrated Art */}
            <div className="md:col-span-6 bg-stone-100 relative min-h-[320px] md:min-h-[520px] overflow-hidden flex items-center justify-center">
              <img
                src={currentImageSrc}
                alt={currentPage.title || book.title}
                onError={() => {
                  setImageErrorMap((prev) => ({ ...prev, [currentPageIndex]: true }));
                }}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
              {currentPage.caption && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-xs text-white/90 text-xs px-3 py-1.5 rounded-xl text-center">
                  {currentPage.caption}
                </div>
              )}
            </div>

            {/* Right Column: Narrative Storybook Prose */}
            <div className="md:col-span-6 p-6 sm:p-10 flex flex-col justify-between bg-white">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Chapter {currentPage.pageNumber || currentPageIndex + 1}
                  </div>

                  {/* Voice Narration Button */}
                  <button
                    type="button"
                    onClick={handleToggleNarration}
                    disabled={isAudioLoading}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                      isPlaying
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                    }`}
                  >
                    {isAudioLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Loading voice...</span>
                      </>
                    ) : isPlaying ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>Read Out Loud</span>
                      </>
                    )}
                  </button>
                </div>

                <h2 className="font-craft-serif text-2xl sm:text-3xl font-normal text-stone-900 mb-6 leading-tight">
                  {currentPage.title || book.title}
                </h2>
                <div className="prose prose-stone text-stone-700 text-base sm:text-lg leading-relaxed font-serif">
                  <p>{currentPage.text}</p>
                </div>
              </div>

              {/* Spread Controls */}
              <div className="pt-8 border-t border-stone-100 flex items-center justify-between">
                <button
                  type="button"
                  disabled={!hasPrev}
                  onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-stone-700 hover:text-black disabled:opacity-30 disabled:hover:text-stone-700 bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-full transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-1">
                  {pages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentPageIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                        currentPageIndex === idx
                          ? 'bg-[#0D1116] w-6'
                          : 'bg-stone-200 hover:bg-stone-300'
                      }`}
                      aria-label={`Go to page ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  disabled={!hasNext}
                  onClick={() => setCurrentPageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-[#0D1116] hover:bg-[#252A34] disabled:opacity-30 px-4 py-2 rounded-full transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-20 py-4 text-center text-xs text-stone-500">
        Storyverse &bull; Illustrated storybooks
      </footer>
    </div>
  );
}
