
/**
 * StoryVerse API Service
 * Real backend communication only.
 *
 * Backend:
 * https://storyverse-jsq5.onrender.com
 */

// ======================================================
// API URL
// ======================================================

export const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://storyverse-jsq5.onrender.com';

console.log('StoryVerse API:', API_URL);

// Warm-up ping to wake up Render free tier backend on initial site load
export function pingBackend() {
  fetch(`${API_URL}/health`).catch(() => {});
}

pingBackend();

/**
 * Universal image URL extractor.
 * Converts strings, base64 objects, and relative URLs into reliable image src strings.
 */
export function getImageUrl(image) {
  if (!image) return null;

  if (typeof image === 'string') {
    // Fix legacy mangled strings like "data:image/jpeg;base64,https://..."
    if (image.includes('http://') || image.includes('https://')) {
      const httpIndex = image.indexOf('http');
      return image.substring(httpIndex);
    }
    if (image.startsWith('data:') || image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    if (image.startsWith('/images/')) {
      return `${API_URL}${image}`;
    }
    // If it looks like raw base64 without prefix
    if (image.length > 50 && !image.includes(' ')) {
      return `data:image/jpeg;base64,${image}`;
    }
    return image;
  }

  if (typeof image === 'object' && image !== null) {
    const target = image.url || image.base64 || image.image || image.src || (image.result && image.result.image) || null;
    return getImageUrl(target);
  }

  return null;
}

// ======================================================
// LOCAL STORAGE KEYS
// ======================================================

const TOKEN_KEY = 'storyverse_token';
const USER_KEY = 'storyverse_user';

// ======================================================
// TOKEN / USER HELPERS
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
 */

export async function loginUser(
  email,
  password
) {
  const cleanEmail = email.trim();

  if (!cleanEmail) {
    throw new Error(
      'Email is required.'
    );
  }

  if (!password) {
    throw new Error(
      'Password is required.'
    );
  }

  const url =
    `${API_URL}/auth/login`;

  console.log(
    'LOGIN →',
    url
  );

  try {
    const response =
      await fetch(url, {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

    const contentType =
      response.headers.get(
        'content-type'
      ) || '';

    let data;

    if (
      contentType.includes(
        'application/json'
      )
    ) {
      data =
        await response.json();
    } else {
      const text =
        await response.text();

      throw new Error(
        text ||
        'Server returned an invalid response.'
      );
    }

    console.log(
      'LOGIN ←',
      data
    );

    if (!response.ok) {
      throw new Error(
        data.error ||
        data.message ||
        `Login failed (${response.status})`
      );
    }

    if (!data.token) {
      throw new Error(
        'Login succeeded but the backend did not return a token.'
      );
    }

    setToken(data.token);

    if (data.user) {
      setUser(data.user);
    }

    return data;

  } catch (error) {
    console.error(
      'LOGIN ERROR:',
      error
    );

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
 */

export async function registerUser(
  username,
  email,
  password
) {
  const cleanUsername =
    username.trim();

  const cleanEmail =
    email.trim();

  if (!cleanUsername) {
    throw new Error(
      'Username is required.'
    );
  }

  if (!cleanEmail) {
    throw new Error(
      'Email is required.'
    );
  }

  if (!password) {
    throw new Error(
      'Password is required.'
    );
  }

  const url =
    `${API_URL}/auth/register`;

  console.log(
    'REGISTER →',
    url
  );

  try {
    const response =
      await fetch(url, {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          username:
            cleanUsername,

          email:
            cleanEmail,

          password,
        }),
      });

    const contentType =
      response.headers.get(
        'content-type'
      ) || '';

    let data;

    if (
      contentType.includes(
        'application/json'
      )
    ) {
      data =
        await response.json();
    } else {
      const text =
        await response.text();

      throw new Error(
        text ||
        'Server returned an invalid response.'
      );
    }

    console.log(
      'REGISTER ←',
      data
    );

    if (!response.ok) {
      throw new Error(
        data.error ||
        data.message ||
        `Registration failed (${response.status})`
      );
    }

    if (!data.token) {
      throw new Error(
        'Registration succeeded but the backend did not return a token.'
      );
    }

    setToken(data.token);

    if (data.user) {
      setUser(data.user);
    }

    return data;

  } catch (error) {
    console.error(
      'REGISTER ERROR:',
      error
    );

    throw error;
  }
}

// ======================================================
// GET STYLES
// ======================================================

/**
 * GET /api/styles
 *
 * IMPORTANT:
 * This function now requires the backend
 * endpoint to exist.
 */

export async function getStyles() {
  const url =
    `${API_URL}/api/styles`;

  console.log(
    'STYLES →',
    url
  );

  try {
    const response =
      await fetch(url);

    const contentType =
      response.headers.get(
        'content-type'
      ) || '';

    if (
      !contentType.includes(
        'application/json'
      )
    ) {
      throw new Error(
        'Styles endpoint returned a non-JSON response.'
      );
    }

    const data =
      await response.json();

    console.log(
      'STYLES ←',
      data
    );

    if (!response.ok) {
      throw new Error(
        data.error ||
        data.message ||
        `Failed to load styles (${response.status})`
      );
    }

    if (
      !data.styles ||
      !Array.isArray(data.styles)
    ) {
      throw new Error(
        'Backend returned an invalid styles response.'
      );
    }

    return data;

  } catch (error) {
    console.error(
      'STYLES ERROR:',
      error
    );

    throw error;
  }
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
  const token =
    getToken();

  if (!token) {
    throw new Error(
      'You must be logged in to load books.'
    );
  }

  const url =
    `${API_URL}/books`;

  console.log(
    'GET BOOKS →',
    url
  );

  try {
    const response =
      await fetch(url, {
        method: 'GET',

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      });

    const contentType =
      response.headers.get(
        'content-type'
      ) || '';

    if (
      !contentType.includes(
        'application/json'
      )
    ) {
      throw new Error(
        'Books endpoint returned a non-JSON response.'
      );
    }

    const data =
      await response.json();

    console.log(
      'GET BOOKS ←',
      data
    );

    if (!response.ok) {
      throw new Error(
        data.error ||
        data.message ||
        `Failed to load books (${response.status})`
      );
    }

    if (Array.isArray(data)) {
      return data;
    }

    if (
      data.books &&
      Array.isArray(data.books)
    ) {
      return data.books;
    }

    throw new Error(
      'Backend returned an invalid books response.'
    );

  } catch (error) {
    console.error(
      'GET BOOKS ERROR:',
      error
    );

    throw error;
  }
}

// ======================================================
// GET SINGLE BOOK
// ======================================================

/**
 * GET /books/:id
 */

export async function getBookById(
  id
) {
  if (!id) {
    throw new Error(
      'Book ID is required.'
    );
  }

  const token =
    getToken();

  if (!token) {
    throw new Error(
      'You must be logged in to load this book.'
    );
  }

  const url =
    `${API_URL}/books/${id}`;

  console.log(
    'GET BOOK →',
    url
  );

  try {
    const response =
      await fetch(url, {
        method: 'GET',

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      });

    const contentType =
      response.headers.get(
        'content-type'
      ) || '';

    if (
      !contentType.includes(
        'application/json'
      )
    ) {
      throw new Error(
        'Book endpoint returned a non-JSON response.'
      );
    }

    const data =
      await response.json();

    console.log(
      'GET BOOK ←',
      data
    );

    if (!response.ok) {
      throw new Error(
        data.error ||
        data.message ||
        `Failed to load book (${response.status})`
      );
    }

    return data.book || data;

  } catch (error) {
    console.error(
      'GET BOOK ERROR:',
      error
    );

    throw error;
  }
}

// ======================================================
// DELETE BOOK
// ======================================================

/**
 * DELETE /books/:id
 */

export async function deleteBook(
  id
) {
  if (!id) {
    throw new Error(
      'Book ID is required.'
    );
  }

  const token =
    getToken();

  if (!token) {
    throw new Error(
      'You must be logged in to delete a book.'
    );
  }

  const url =
    `${API_URL}/books/${id}`;

  console.log(
    'DELETE BOOK →',
    url
  );

  try {
    const response =
      await fetch(url, {
        method: 'DELETE',

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      });

    const contentType =
      response.headers.get(
        'content-type'
      ) || '';

    let data = {};

    if (
      contentType.includes(
        'application/json'
      )
    ) {
      data =
        await response.json();
    }

    console.log(
      'DELETE BOOK ←',
      data
    );

    if (!response.ok) {
      throw new Error(
        data.error ||
        data.message ||
        `Failed to delete book (${response.status})`
      );
    }

    return data;

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
  const token =
    getToken();

  if (!token) {
    throw new Error(
      'You must be logged in to generate a book.'
    );
  }

  if (
    !prompt ||
    !prompt.trim()
  ) {
    throw new Error('Prompt is required.');
  }

  const url = `${API_URL}/books/generate`;

  console.log('GENERATE BOOK →', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        prompt: prompt.trim(),
        pageCount,
        style,
      }),
    });

    const contentType = response.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(text || 'Server returned an invalid response.');
    }

    console.log('GENERATE BOOK ←', data);

    if (!response.ok) {
      throw new Error(
        data.error || data.message || `Book generation failed (${response.status})`
      );
    }

    return data.book || data;
  } catch (error) {
    console.error('GENERATE BOOK ERROR:', error);
    throw error;
  }
}

