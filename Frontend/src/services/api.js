
/**
 * Storyverse API Service
 * Handles communication with the Storyverse backend,
 * authentication token storage, and local book caching.
 */

// ======================================================
// API URL
// ======================================================

export const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://storyverse-jsq5.onrender.com';

console.log('Storyverse API URL:', API_URL);

// ======================================================
// LOCAL STORAGE KEYS
// ======================================================

const TOKEN_KEY = 'storyverse_token';
const USER_KEY = 'storyverse_user';
const BOOKS_STORAGE_KEY = 'storyverse_books';

// ======================================================
// INITIAL SAMPLE BOOKS
// ======================================================

export const INITIAL_BOOKS = [
  {
    id: 'book-sideways-city',
    title: 'The Sideways City',
    prompt:
      'A quiet city where gravity tilts westward and lamplight paints the rooftops',
    style: 'watercolor',
    pageCount: 8,
    createdAt: '2026-09-10T12:00:00.000Z',
    coverImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAbn674iMCijkvfkMueFK3ptfVbZgk9v5RzgPBs4SHXD5UVEoUatrtZzYZfDFVDVoNMED9vdDACnKRgnF6zBfwOfNj_533Gp3TJSSPbhgrsFeEZ6U1zGuJKKQZaq10julQWuh8mc9z3AyqHH93eMbe5RMuzxZ0Jq2OFbuqvSY-mpAV9-KbFB2LCl1TB8y3cnxhgzTNwJUi22ZRA6Yq7B4Laiugzmu7rc0rEaAPnnxAGStSa41u8tmh7',
    pages: [
      {
        pageNumber: 1,
        title: 'The Horizon Tilts',
        text: 'Oliver first noticed the change when his teacup slid horizontally across the kitchen table. Outside, the cobblestones curved upward into the sky, where trams glided along vertical facades without spilling a single passenger.',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAbn674iMCijkvfkMueFK3ptfVbZgk9v5RzgPBs4SHXD5UVEoUatrtZzYZfDFVDVoNMED9vdDACnKRgnF6zBfwOfNj_533Gp3TJSSPbhgrsFeEZ6U1zGuJKKQZaq10julQWuh8mc9z3AyqHH93eMbe5RMuzxZ0Jq2OFbuqvSY-mpAV9-KbFB2LCl1TB8y3cnxhgzTNwJUi22ZRA6Yq7B4Laiugzmu7rc0rEaAPnnxAGStSa41u8tmh7',
        caption: 'Streets built sideways against the dawn',
      },
      {
        pageNumber: 2,
        title: 'Steps Along the Wall',
        text: 'Stepping off his front porch, he did not fall downward. He stepped directly onto the brick wall of the clocktower. Rain fell toward the west, like silver threads carried by an invisible hand through the sleepy avenue.',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDezYQgC1FdbbgWzrsQe6JKal1KvTBhsZ_SExmStBeH1cusjuJRHm1G-zDxm4jtD22YLXOqwTdHEbaxrBHSfuWbtPJ6Xm75stvvrCzHAu9yfJoXouRZOd6aJrGD0Grw51ABpb4XuZHbJfceECyi2EVhNpSlWbgvXfENFtJcd6psl4WOjWrM81cFpu3FEDaCZh_Q9FOdYCnJzFc33Xt4OXoj45UWycsinyfuMh32YNNaeq-2xYbgedlJ',
        caption: 'Oliver tests the sideways gravity with a copper key',
      },
      {
        pageNumber: 3,
        title: 'The Floating Cartographer',
        text: "High above the rooftop garden, an elderly woman in velvet spectacles was rolling up a map of the city. 'Do not fight the lean,' she advised gently. 'In Storyverse, directions answer to whichever dream you speak aloud.'",
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCH9Oo-jkhLoQ7bqQOdPL7ROrQr64fFp0mcoVw-wxFVgAA2XSp1OlYNRj4EfUpHQtLDncJLmyImjTxSxTOJcsf89f0ki3EMfolUWK0wRZ1LCL8XtkOxjPDQhRqeccvuB-us9tqEslcmbYesKw5psVsMSFOJ1iAGTlwMF621Wgc7Hy95ELUD379oZq9jHaWSVCNbT4M7Z626cOCuaL-34WiC2LMbjFP6Lnsu4W1osNfmILRmyfF-XPYB',
        caption: 'The evening bells ringing sideways across the clouds',
      },
    ],
  },

  {
    id: 'book-clockwork-forest',
    title: 'The Clockwork Forest',
    prompt:
      'A forest of brass leaves and winding gears where mechanical songbirds tell the time',
    style: 'comic',
    pageCount: 6,
    createdAt: '2026-09-08T09:15:00.000Z',
    coverImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDci_yuBBuoczXQH0yVtvO36cmFcgFgGjmQB81LqQEhJi-2N9qnf8ay9auCzoTAkhCPF-FaXcqW24ee0qxHLSi7OZ7T7cW2t0noK0BFRWo3D8LkAQrW60Ztf-nKkg4CnoZ4I9LMkJ1AxrbqT0bWKL06xXaEA8kSVIS0DnJxDBlHmgT4s7ixz-l-hx-N3wAUQ5QHIUD_eLmJLWx-gOPHdFjkLIDYeBtN9pOHsBZeBfnQ5dVKIxJfN7dk',
    pages: [
      {
        pageNumber: 1,
        title: 'The Brass Canopy',
        text: 'Deep within the valley of Oakhaven, the branches did not sway in the breeze. They clicked. Gears turned inside the boles of giant copper trees, each leaf polished to a soft luster.',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDci_yuBBuoczXQH0yVtvO36cmFcgFgGjmQB81LqQEhJi-2N9qnf8ay9auCzoTAkhCPF-FaXcqW24ee0qxHLSi7OZ7T7cW2t0noK0BFRWo3D8LkAQrW60Ztf-nKkg4CnoZ4I9LMkJ1AxrbqT0bWKL06xXaEA8kSVIS0DnJxDBlHmgT4s7ixz-l-hx-N3wAUQ5QHIUD_eLmJLWx-gOPHdFjkLIDYeBtN9pOHsBZeBfnQ5dVKIxJfN7dk',
        caption: 'Gilded cogs turning in the early twilight',
      },
    ],
  },
];

// ======================================================
// LOCAL BOOK HELPERS
// ======================================================

function getLocalBooks() {
  try {
    const raw = localStorage.getItem(BOOKS_STORAGE_KEY);

    if (!raw) {
      localStorage.setItem(
        BOOKS_STORAGE_KEY,
        JSON.stringify(INITIAL_BOOKS)
      );

      return INITIAL_BOOKS;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.warn('Could not read local books:', error);
    return INITIAL_BOOKS;
  }
}

function saveLocalBooks(books) {
  try {
    localStorage.setItem(
      BOOKS_STORAGE_KEY,
      JSON.stringify(books)
    );
  } catch (error) {
    console.warn('Could not save local books:', error);
  }
}

// ======================================================
// TOKEN HELPERS
// ======================================================

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );
}

// ======================================================
// LOGIN
// ======================================================

/**
 * POST /auth/login
 *
 * Body:
 * {
 *   email,
 *   password
 * }
 *
 * Response:
 * {
 *   token,
 *   user
 * }
 */

export async function loginUser(email, password) {
  const cleanEmail = email.trim();

  if (!cleanEmail || !password) {
    throw new Error(
      'Please enter both email and password.'
    );
  }

  const url = `${API_URL}/auth/login`;

  console.log('LOGIN REQUEST:', url);

  try {
    const response = await fetch(url, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        email: cleanEmail,
        password,
      }),
    });

    const contentType =
      response.headers.get('content-type') || '';

    let data;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();

      throw new Error(
        text || 'Backend returned an invalid response.'
      );
    }

    console.log('LOGIN RESPONSE:', data);

    if (!response.ok) {
      throw new Error(
        data.error ||
        data.message ||
        'Login failed.'
      );
    }

    if (data.token) {
      setToken(data.token);
    }

    if (data.user) {
      setUser(data.user);
    }

    return data;
  } catch (error) {
    console.error('LOGIN ERROR:', error);

    throw error;
  }
}

// ======================================================
// REGISTER
// ======================================================

/**
 * POST /auth/register
 *
 * Body:
 * {
 *   username,
 *   email,
 *   password
 * }
 *
 * Response:
 * {
 *   token,
 *   user
 * }
 */

export async function registerUser(
  username,
  email,
  password
) {
  const cleanUsername = username.trim();
  const cleanEmail = email.trim();

  if (!cleanUsername) {
    throw new Error('Username is required.');
  }

  if (!cleanEmail) {
    throw new Error('Email is required.');
  }

  if (!password) {
    throw new Error('Password is required.');
  }

  const url = `${API_URL}/auth/register`;

  console.log('REGISTER REQUEST:', url);

  try {
    const response = await fetch(url, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        username: cleanUsername,
        email: cleanEmail,
        password,
      }),
    });

    const contentType =
      response.headers.get('content-type') || '';

    let data;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();

      throw new Error(
        text || 'Backend returned an invalid response.'
      );
    }

    console.log('REGISTER RESPONSE:', data);

    if (!response.ok) {
      throw new Error(
        data.error ||
        data.message ||
        'Registration failed.'
      );
    }

    if (data.token) {
      setToken(data.token);
    }

    if (data.user) {
      setUser(data.user);
    }

    return data;
  } catch (error) {
    console.error('REGISTER ERROR:', error);

    throw error;
  }
}

// ======================================================
// GET STYLES
// ======================================================

/**
 * GET /api/styles
 *
 * NOTE:
 * If your backend does not have /api/styles,
 * the frontend will use these defaults.
 */

export async function getStyles() {
  const url = `${API_URL}/api/styles`;

  try {
    console.log('STYLES REQUEST:', url);

    const response = await fetch(url);

    const contentType =
      response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await response.json();

      if (
        data.styles &&
        Array.isArray(data.styles)
      ) {
        return data;
      }
    }
  } catch (error) {
    console.warn(
      'Styles endpoint unavailable. Using defaults.'
    );
  }

  return {
    styles: [
      {
        key: 'comic_color',
        label: 'Color Comic',
      },
      {
        key: 'ink',
        label: 'Black & White Ink',
      },
      {
        key: 'watercolor',
        label: 'Storybook Watercolor',
      },
    ],

    default: 'watercolor',
  };
}

// ======================================================
// GET ALL BOOKS
// ======================================================

/**
 * GET /books
 *
 * Authorization:
 * Bearer <token>
 */

export async function getBooks() {
  const token = getToken();

  if (!token) {
    console.warn(
      'GET BOOKS: No authentication token.'
    );

    return getLocalBooks();
  }

  const url = `${API_URL}/books`;

  try {
    console.log('GET BOOKS REQUEST:', url);

    const response = await fetch(url, {
      method: 'GET',

      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const contentType =
      response.headers.get('content-type') || '';

    let data;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      throw new Error(
        'Invalid backend response.'
      );
    }

    console.log('GET BOOKS RESPONSE:', data);

    if (!response.ok) {
      throw new Error(
        data.error ||
        data.message ||
        'Failed to load books.'
      );
    }

    const books =
      Array.isArray(data)
        ? data
        : data.books || [];

    saveLocalBooks(books);

    return books;
  } catch (error) {
    console.error('GET BOOKS ERROR:', error);

    // Keep local cache as a fallback for dashboard
    return getLocalBooks();
  }
}

// ======================================================
// GET BOOK BY ID
// ======================================================

/**
 * GET /books/:id
 */

export async function getBookById(id) {
  const token = getToken();

  const url = `${API_URL}/books/${id}`;

  try {
    console.log(
      'GET BOOK REQUEST:',
      url
    );

    const response = await fetch(url, {
      method: 'GET',

      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const contentType =
      response.headers.get('content-type') || '';

    let data;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      throw new Error(
        'Invalid backend response.'
      );
    }

    console.log(
      'GET BOOK RESPONSE:',
      data
    );

    if (!response.ok) {
      throw new Error(
        data.error ||
        data.message ||
        'Failed to load book.'
      );
    }

    return data.book || data;
  } catch (error) {
    console.error(
      'GET BOOK ERROR:',
      error
    );

    // Local fallback
    const localBook = getLocalBooks().find(
      (book) =>
        book.id === id ||
        book._id === id
    );

    if (localBook) {
      return localBook;
    }

    return null;
  }
}

// ======================================================
// DELETE BOOK
// ======================================================

/**
 * DELETE /books/:id
 */

export async function deleteBook(id) {
  const token = getToken();

  if (!token) {
    throw new Error(
      'You must be logged in to delete a book.'
    );
  }

  const url = `${API_URL}/books/${id}`;

  try {
    console.log(
      'DELETE BOOK REQUEST:',
      url
    );

    const response = await fetch(url, {
      method: 'DELETE',

      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const contentType =
      response.headers.get('content-type') || '';

    let data = {};

    if (contentType.includes('application/json')) {
      data = await response.json();
    }

    console.log(
      'DELETE BOOK RESPONSE:',
      data
    );

    if (!response.ok) {
      throw new Error(
        data.error ||
        data.message ||
        'Failed to delete book.'
      );
    }

    const currentBooks =
      getLocalBooks().filter(
        (book) =>
          book.id !== id &&
          book._id !== id
      );

    saveLocalBooks(currentBooks);

    return data || {
      success: true,
    };
  } catch (error) {
    console.error(
      'DELETE BOOK ERROR:',
      error
    );

    throw error;
  }
}

// ======================================================
// GENERATE BOOK
// ======================================================

/**
 * POST /books/generate
 *
 * Authorization:
 * Bearer <token>
 *
 * Body:
 * {
 *   prompt,
 *   pageCount,
 *   style
 * }
 */

export async function generateBook({
  prompt,
  pageCount = 8,
  style = 'watercolor',
}) {
  const token = getToken();

  if (!token) {
    throw new Error(
      'You must be logged in to generate a book.'
    );
  }

  if (!prompt || !prompt.trim()) {
    throw new Error(
      'Please enter a story idea.'
    );
  }

  const url = `${API_URL}/books/generate`;

  console.log(
    'GENERATE BOOK REQUEST:',
    url
  );

  console.log(
    'GENERATE BOOK DATA:',
    {
      prompt,
      pageCount,
      style,
    }
  );

  const controller =
    new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 150000);

  try {
    const response = await fetch(url, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',

        Authorization:
          `Bearer ${token}`,
      },

      body: JSON.stringify({
        prompt: prompt.trim(),
        pageCount: Number(pageCount),
        style: style || 'watercolor',
      }),

      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType =
      response.headers.get('content-type') || '';

    let data;

    if (
      contentType.includes(
        'application/json'
      )
    ) {
      data = await response.json();
    } else {
      const text =
        await response.text();

      throw new Error(
        text ||
        'Backend returned an invalid response.'
      );
    }

    console.log(
      'GENERATE BOOK RESPONSE:',
      data
    );

    if (!response.ok) {
      const error = new Error(
        data.error ||
        data.message ||
        `Book generation failed (${response.status})`
      );

      error.status =
        response.status;

      error.details =
        data.details ||
        data.error ||
        'The backend could not generate the book.';

      throw error;
    }

    /*
     * Support different possible backend response formats:
     *
     * { book: {...} }
     *
     * OR
     *
     * { story: {...} }
     *
     * OR
     *
     * { id: "...", title: "..." }
     */

    const book =
      data.book ||
      data.story ||
      data;

    if (!book) {
      throw new Error(
        'Backend returned an empty book.'
      );
    }

    /*
     * Save generated book locally as a cache.
     */

    try {
      const books =
        getLocalBooks();

      const bookId =
        book.id ||
        book._id;

      if (bookId) {
        const existingIndex =
          books.findIndex(
            (item) =>
              item.id === bookId ||
              item._id === bookId
          );

        if (
          existingIndex !== -1
        ) {
          books[
            existingIndex
          ] = book;
        } else {
          books.unshift(book);
        }

        saveLocalBooks(books);
      }
    } catch (error) {
      console.warn(
        'Could not cache generated book:',
        error
      );
    }

    return book;

  } catch (error) {
    clearTimeout(timeoutId);

    if (
      error.name ===
      'AbortError'
    ) {
      const timeoutError =
        new Error(
          'Book generation took too long.'
        );

      timeoutError.details =
        'The backend took more than 2.5 minutes. Please try again.';

      throw timeoutError;
    }

    console.error(
      'GENERATE BOOK ERROR:',
      error
    );

    throw error;
  }
}

