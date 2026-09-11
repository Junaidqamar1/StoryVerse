import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getBookById, getImageUrl } from '../services/api';
import Navbar from '../components/Navbar';
import FloatingClouds from '../components/FloatingClouds';
import Button from '../components/Button';
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen, Share2, Sparkles, ImageOff } from 'lucide-react';

export default function BookReaderPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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

  const [imageErrorMap, setImageErrorMap] = useState({});

  const fallbackArtByStyle = {
    comic: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    ink: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    watercolor: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    storybook: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80',
  };

  const defaultFallback = fallbackArtByStyle[book.style] || fallbackArtByStyle.storybook;
  const currentImageSrc = imageErrorMap[currentPageIndex]
    ? defaultFallback
    : (getImageUrl(currentPage.image) || getImageUrl(book.coverImage) || defaultFallback);

  const hasPrev = currentPageIndex > 0;
  const hasNext = currentPageIndex < totalPages - 1;

  const styleLabels = {
    comic: 'Color Comic',
    ink: 'Black & White Ink',
    watercolor: 'Storybook Watercolor',
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
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                  Chapter {currentPage.pageNumber || currentPageIndex + 1}
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
