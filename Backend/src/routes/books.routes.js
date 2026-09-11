const express = require('express');
const fs = require('fs'); 
const path = require('path'); 
const Book = require('../models/Book');
const bookGenerator = require('../services/bookGenerator');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// All book routes require a logged-in user.
router.use(requireAuth);

/**
 * POST /books/generate
 * body: { prompt: string, pageCount?: number (4-12), style?: string }
 * Generates the book in-process (Gemini for text, Cloudflare for images),
 * saves the result with images downloaded to disk, returns the saved book.
 */
router.post('/generate', async (req, res) => {
  try {
    const { prompt, pageCount = 8, style } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'prompt (string) is required' });
    }

    // 1. Run text and image generation
    const storyResult = await bookGenerator.generateBook(prompt, pageCount, style);

    // 2. Setup a local folder for the saved images
    const uploadDir = path.join(__dirname, '../public/images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 3. Process pages and convert base64 image data to local files
    const processedPages = storyResult.pages.map((page) => {
      // 💡 FIX: Accessing page.image directly since your map output assigns it directly
      // Checking if cloudflare's nested format or our standard format is available
      const rawImage = page.image && page.image.result ? page.image.result.image : (page.image ? page.image.base64 || page.image : null);

      if (rawImage) {
        try {
          // Clean the base64 string if it contains a data URI prefix
          const base64Clean = rawImage.replace(/^data:image\/\w+;base64,/, '');
          
          // Generate a completely unique file name for this page illustration
          const fileName = `book-${Date.now()}-page-${page.pageNumber}.png`;
          const filePath = path.join(uploadDir, fileName);

          // Write the physical file to your local disk
          fs.writeFileSync(filePath, base64Clean, 'base64');

          // Replace the massive base64 object with a clean local server URL path
          return {
            ...page,
            image: {
              url: `/images/${fileName}`, 
              mimeType: 'image/png'
            },
            imageError: null // clear any errors
          };
        } catch (fileErr) {
          console.error(`Failed to save image to disk for page ${page.pageNumber}:`, fileErr);
          return { ...page, image: null, imageError: 'Failed to write image file to local storage.' };
        }
      }
      
      // If it hit an upper level error block in imageGenerator.js
      return page;
    });

    // 4. Create the final book document with the file paths
    const book = await Book.create({
      userId: req.user.id,
      title: storyResult.title,
      characterDescription: storyResult.characterDescription,
      style: storyResult.style,
      pageCount: storyResult.pageCount,
      pages: processedPages, 
    });

    res.status(201).json({ book });
  } catch (err) {
    console.error('Book generation error:', err.message);
    res.status(502).json({ error: 'Failed to generate book', details: err.message });
  }
});
/**
 * GET /books/styles
 * Returns the available art style presets for the frontend's style picker.
 */
router.get('/styles', (req, res) => {
  try {
    const result = bookGenerator.getStyles();
    res.json(result);
  } catch (err) {
    console.error('Get styles error:', err.message);
    res.status(500).json({ error: 'Failed to fetch styles' });
  }
});

/**
 * GET /books
 * Lists the current user's books (summary only — no full page/image payload).
 */
router.get('/', async (req, res) => {
  try {
    const books = await Book.find({ userId: req.user.id })
      .select('title characterDescription style pageCount createdAt')
      .sort({ createdAt: -1 });
    res.json({ books });
  } catch (err) {
    console.error('List books error:', err);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

/**
 * GET /books/:id
 * Full book, including all pages and images. Ownership-checked.
 */
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, userId: req.user.id });
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json({ book });
  } catch (err) {
    console.error('Get book error:', err);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

/**
 * DELETE /books/:id
 * Ownership-checked.
 */
router.delete('/:id', async (req, res) => {
  try {
    const result = await Book.deleteOne({ _id: req.params.id, userId: req.user.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Delete book error:', err);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

// 💡 THE CRUCIAL MISSING LINE THAT FIXED THE EXPRESS CRASH:
module.exports = router;