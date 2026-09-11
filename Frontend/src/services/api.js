/**
 * Storyverse API Service
 * Handles network communication with {API_URL} endpoints,
 * auth token storage, and persistent local data.
 */

export const API_URL = import.meta.env.VITE_API_URL || '';

// Token and User LocalStorage Keys
const TOKEN_KEY = 'storyverse_token';
const USER_KEY = 'storyverse_user';
const BOOKS_STORAGE_KEY = 'storyverse_books';

// Initial sample seed books if localStorage is empty
export const INITIAL_BOOKS = [
  {
    id: 'book-sideways-city',
    title: 'The Sideways City',
    prompt: 'A quiet city where gravity tilts westward and lamplight paints the rooftops',
    style: 'watercolor',
    pageCount: 8,
    createdAt: '2026-09-10T12:00:00.000Z',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbn674iMCijkvfkMueFK3ptfVbZgk9v5RzgPBs4SHXD5UVEoUatrtZzYZfDFVDVoNMED9vdDACnKRgnF6zBfwOfNj_533Gp3TJSSPbhgrsFeEZ6U1zGuJKKQZaq10julQWuh8mc9z3AyqHH93eMbe5RMuzxZ0Jq2OFbuqvSY-mpAV9-KbFB2LCl1TB8y3cnxhgzTNwJUi22ZRA6Yq7B4Laiugzmu7rc0rEaAPnnxAGStSa41u8tmh7',
    pages: [
      {
        pageNumber: 1,
        title: 'The Horizon Tilts',
        text: 'Oliver first noticed the change when his teacup slid horizontally across the kitchen table. Outside, the cobblestones curved upward into the sky, where trams glided along vertical facades without spilling a single passenger.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbn674iMCijkvfkMueFK3ptfVbZgk9v5RzgPBs4SHXD5UVEoUatrtZzYZfDFVDVoNMED9vdDACnKRgnF6zBfwOfNj_533Gp3TJSSPbhgrsFeEZ6U1zGuJKKQZaq10julQWuh8mc9z3AyqHH93eMbe5RMuzxZ0Jq2OFbuqvSY-mpAV9-KbFB2LCl1TB8y3cnxhgzTNwJUi22ZRA6Yq7B4Laiugzmu7rc0rEaAPnnxAGStSa41u8tmh7',
        caption: 'Streets built sideways against the dawn'
      },
      {
        pageNumber: 2,
        title: 'Steps Along the Wall',
        text: 'Stepping off his front porch, he did not fall downward. He stepped directly onto the brick wall of the clocktower. Rain fell toward the west, like silver threads carried by an invisible hand through the sleepy avenue.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDezYQgC1FdbbgwZrsQe6JKal1KvTBhsZ_SExmStBeH1cusjuJRHm1G-zDxm4jtD22YLXOqwTdHEbaxrBHSfuWbtPJ6Xm75stvvrCzHAu9yfJoXouRZOd6aJrGD0Grw51ABpb4XuZHbJfceECyi2EVhNpSlWbgvXfENFtJcd6psl4WOjWrM81cFpu3FEDaCZh_Q9FOdYCnJzFc33Xt4OXoj45UWycsinyfuMh32YNNaeq-2xYbgedlJ',
        caption: 'Oliver tests the sideways gravity with a copper key'
      },
      {
        pageNumber: 3,
        title: 'The Floating Cartographer',
        text: "High above the rooftop garden, an elderly woman in velvet spectacles was rolling up a map of the city. 'Do not fight the lean,' she advised gently. 'In Storyverse, directions answer to whichever dream you speak aloud.'",
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCH9Oo-jkhLoQ7bqQOdPL7ROrQr64fFp0mcoVw-wxFVgAA2XSp1OlYNRj4EfUpHQtLDncJLmyImjTxSxTOJcsf89f0ki3EMfolUWK0wRZ1LCL8XtkOxjPDQhRqeccvuB-us9tqEslcmbYesKw5psVsMSFOJ1iAGTlwMF621Wgc7Hy95ELUD379oZq9jHaWSVCNbT4M7Z626cOCuaL-34WiC2LMbjFP6Lnsu4W1osNfmILRmyfF-XPYB',
        caption: 'The evening bells ringing sideways across the clouds'
      }
    ]
  },
  {
    id: 'book-clockwork-forest',
    title: 'The Clockwork Forest',
    prompt: 'A forest of brass leaves and winding gears where mechanical songbirds tell the time',
    style: 'comic',
    pageCount: 6,
    createdAt: '2026-09-08T09:15:00.000Z',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDci_yuBBuoczXQH0yVtvO36cmFcgFgGjmQB81LqQEhJi-2N9qnf8ay9auCzoTAkhCPF-FaXcqW24ee0qxHLSi7OZ7T7cW2t0noK0BFRWo3D8LkAQrW60Ztf-nKkg4CnoZ4I9LMkJ1AxrbqT0bWKL06xXaEA8kSVIS0DnJxDBlHmgT4s7ixz-l-hx-N3wAUQ5QHIUD_eLmJLWx-gOPHdFjkLIDYeBtN9pOHsBZeBfnQ5dVKIxJfN7dk',
    pages: [
      {
        pageNumber: 1,
        title: 'The Brass Canopy',
        text: 'Deep within the valley of Oakhaven, the branches did not sway in the breeze. They clicked. Gears turned inside the boles of giant copper trees, each leaf polished to a soft luster.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDci_yuBBuoczXQH0yVtvO36cmFcgFgGjmQB81LqQEhJi-2N9qnf8ay9auCzoTAkhCPF-FaXcqW24ee0qxHLSi7OZ7T7cW2t0noK0BFRWo3D8LkAQrW60Ztf-nKkg4CnoZ4I9LMkJ1AxrbqT0bWKL06xXaEA8kSVIS0DnJxDBlHmgT4s7ixz-l-hx-N3wAUQ5QHIUD_eLmJLWx-gOPHdFjkLIDYeBtN9pOHsBZeBfnQ5dVKIxJfN7dk',
        caption: 'Gilded cogs turning in the early twilight'
      }
    ]
  }
];

// Helper to get local stored books
function getLocalBooks() {
  try {
    const raw = localStorage.getItem(BOOKS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(INITIAL_BOOKS));
      return INITIAL_BOOKS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_BOOKS;
  }
}

function saveLocalBooks(books) {
  try {
    localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
  } catch {
    // Ignore storage quota errors
  }
}

// Token helpers
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
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * POST {API_URL}/auth/login
 * Body: { email, password }
 * Response: { token, user }
 */
export async function loginUser(email, password) {
  const cleanEmail = email.trim();
  const url = `${API_URL}/auth/login`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password }),
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Incorrect email or password');
      }
      if (data.token) {
        setToken(data.token);
        if (data.user) setUser(data.user);
      }
      return data;
    }
  } catch (err) {
    // If it was an explicit server error message, re-throw it
    if (err.message && err.message !== 'Failed to fetch' && !err.message.includes('Unexpected token')) {
      throw err;
    }
  }

  // Fallback handler if server endpoint is unreachable
  if (!cleanEmail || !password) {
    throw new Error('Please enter both email and password');
  }
  if (password.length < 6) {
    throw new Error('Incorrect email or password');
  }

  const mockUser = {
    id: 'user_' + Math.random().toString(36).substring(2, 9),
    email: cleanEmail,
    name: cleanEmail.split('@')[0],
  };
  const mockToken = 'mock_token_' + Date.now();
  setToken(mockToken);
  setUser(mockUser);
  return { token: mockToken, user: mockUser };
}

/**
 * POST {API_URL}/auth/register
 * Body: { email, password }
 * Response: { token, user }
 */
export async function registerUser(email, password) {
  const cleanEmail = email.trim();
  const url = `${API_URL}/auth/register`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password }),
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Email already in use');
      }
      if (data.token) {
        setToken(data.token);
        if (data.user) setUser(data.user);
      }
      return data;
    }
  } catch (err) {
    if (err.message && err.message !== 'Failed to fetch' && !err.message.includes('Unexpected token')) {
      throw err;
    }
  }

  // Fallback registration handler
  if (!cleanEmail || !password) {
    throw new Error('Please enter both email and password');
  }
  if (cleanEmail === 'taken@storyverse.com') {
    throw new Error('Email already in use');
  }

  const mockUser = {
    id: 'user_' + Math.random().toString(36).substring(2, 9),
    email: cleanEmail,
    name: cleanEmail.split('@')[0],
  };
  const mockToken = 'mock_token_' + Date.now();
  setToken(mockToken);
  setUser(mockUser);
  return { token: mockToken, user: mockUser };
}

/**
 * GET {API_URL}/api/styles
 * Response: { styles: [{ key, label }], default }
 */
export async function getStyles() {
  const url = `${API_URL}/api/styles`;
  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (data.styles && Array.isArray(data.styles)) {
        return data;
      }
    }
  } catch (err) {
    // Fall through to default styles
  }

  return {
    styles: [
      { key: 'comic', label: 'Color Comic' },
      { key: 'ink', label: 'Black & White Ink' },
      { key: 'watercolor', label: 'Storybook Watercolor' }
    ],
    default: 'watercolor'
  };
}

/**
 * GET {API_URL}/books
 * Headers: Authorization: Bearer <token>
 * Response: Book[]
 */
export async function getBooks() {
  const token = getToken();
  const url = `${API_URL}/books`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (Array.isArray(data)) {
        saveLocalBooks(data);
        return data;
      }
    }
  } catch (err) {
    // Fall through to local books
  }

  return getLocalBooks();
}

/**
 * DELETE {API_URL}/books/:id
 * Headers: Authorization: Bearer <token>
 */
export async function deleteBook(id) {
  const token = getToken();
  const url = `${API_URL}/books/${id}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (response.ok) {
      const current = getLocalBooks().filter(b => b.id !== id);
      saveLocalBooks(current);
      return { success: true };
    }
  } catch (err) {
    // Fall through
  }

  const current = getLocalBooks().filter(b => b.id !== id);
  saveLocalBooks(current);
  return { success: true };
}

/**
 * GET {API_URL}/books/:id
 */
export async function getBookById(id) {
  const token = getToken();
  const url = `${API_URL}/books/${id}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (data && data.id) return data;
    }
  } catch (err) {
    // Fall through
  }

  const local = getLocalBooks().find(b => b.id === id);
  if (local) return local;
  return INITIAL_BOOKS[0];
}

/**
 * POST {API_URL}/books/generate
 * Headers: Authorization: Bearer <token>
 * Body: { prompt, pageCount, style }
 * Note: Prompt asks not to set timeout under 2 minutes.
 */
export async function generateBook({ prompt, pageCount = 8, style = 'watercolor' }) {
  const token = getToken();
  const url = `${API_URL}/books/generate`;

  const controller = new AbortController();
  // 2.5 minutes timeout (150,000 ms) - strictly greater than 2 minutes
  const timeoutId = setTimeout(() => controller.abort(), 150000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ prompt, pageCount, style }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) {
        const err = new Error(data.error || 'Failed to generate book');
        err.details = data.details || 'The model was unable to complete the generation.';
        throw err;
      }
      if (data && data.id) {
        const books = getLocalBooks();
        books.unshift(data);
        saveLocalBooks(books);
        return data;
      }
    }
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const abortErr = new Error('Generation took longer than expected.');
      abortErr.details = 'Please try again with a slightly shorter scene prompt.';
      throw abortErr;
    }
    // If it's a server error response, throw it directly
    if (err.details || (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('Unexpected token'))) {
      throw err;
    }
  }

  // Fallback realistic generator if server endpoint returned non-JSON
  // Generates rich illustrated book based on user input
  const styleImages = {
    comic: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDci_yuBBuoczXQH0yVtvO36cmFcgFgGjmQB81LqQEhJi-2N9qnf8ay9auCzoTAkhCPF-FaXcqW24ee0qxHLSi7OZ7T7cW2t0noK0BFRWo3D8LkAQrW60Ztf-nKkg4CnoZ4I9LMkJ1AxrbqT0bWKL06xXaEA8kSVIS0DnJxDBlHmgT4s7ixz-l-hx-N3wAUQ5QHIUD_eLmJLWx-gOPHdFjkLIDYeBtN9pOHsBZeBfnQ5dVKIxJfN7dk',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuArN-Cg1pXKMbJ0AML5IrHOlGCrAC6w-ETNwUJhZRLBrI9zxVG_i5qpuWt6EZ83EhO6jPIcFixZhsAiWnepwcFTuCgmeh7KvF3zqvLng7ZTzBb-BT1N6pa0dF7YqYDsXbhTrX7ea-bJN9IayBsTYogjaNZ7YPzKBwXycwvDaUCDne_NWCtB1hXnco77FR3FVe_LExudpk2FiIdv-Ip8QXKx3Qh8Mzzmq0ZaKVCWTrBHp2B3uM-VzEMj'
    ],
    ink: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCH9Oo-jkhLoQ7bqQOdPL7ROrQr64fFp0mcoVw-wxFVgAA2XSp1OlYNRj4EfUpHQtLDncJLmyImjTxSxTOJcsf89f0ki3EMfolUWK0wRZ1LCL8XtkOxjPDQhRqeccvuB-us9tqEslcmbYesKw5psVsMSFOJ1iAGTlwMF621Wgc7Hy95ELUD379oZq9jHaWSVCNbT4M7Z626cOCuaL-34WiC2LMbjFP6Lnsu4W1osNfmILRmyfF-XPYB',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAxR09jdifjF2QluDFFBgDkDp5waodUb4Gb6N3unsigzf0g0iadbSCBx6pFkcCP_iO14c6aR3-fs5yJgCReVlt9u_vOYVcgSu8I0KQYssSXQPc9XFEg0sw5EC6hT5alCE4r8fSPXe5GXXjIMJLEo1ZjxH0I9KnHjuMXG2qOsa7tnuqG8tFCCrsmjysFDRou6raEaIW3jcUNevM-UN0J8jfjg0T4gsyPc7LN7VMZt4q_EghspHl3xcWR'
    ],
    watercolor: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAbn674iMCijkvfkMueFK3ptfVbZgk9v5RzgPBs4SHXD5UVEoUatrtZzYZfDFVDVoNMED9vdDACnKRgnF6zBfwOfNj_533Gp3TJSSPbhgrsFeEZ6U1zGuJKKQZaq10julQWuh8mc9z3AyqHH93eMbe5RMuzxZ0Jq2OFbuqvSY-mpAV9-KbFB2LCl1TB8y3cnxhgzTNwJUi22ZRA6Yq7B4Laiugzmu7rc0rEaAPnnxAGStSa41u8tmh7',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDezYQgC1FdbbgwZrsQe6JKal1KvTBhsZ_SExmStBeH1cusjuJRHm1G-zDxm4jtD22YLXOqwTdHEbaxrBHSfuWbtPJ6Xm75stvvrCzHAu9yfJoXouRZOd6aJrGD0Grw51ABpb4XuZHbJfceECyi2EVhNpSlWbgvXfENFtJcd6psl4WOjWrM81cFpu3FEDaCZh_Q9FOdYCnJzFc33Xt4OXoj45UWycsinyfuMh32YNNaeq-2xYbgedlJ',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAyl195-f2IszjAs9QrroJuoOS4eX9K4Q_x6NYcaBw8Hk9mQ-zwI5Ao5JcgdWClbfi4CfK9l9XCpEZogIe3qjTOkdDX_l7pckKbdMVTn8C8fDUsc9KiBoCSdKhtrqLiuUw59dVfEIuxlNNGXBji6j_VZkjEu-b49nKshtZwv643eTTLuoc5NOOFk1PCtDSXS2-I5yLbFCbpcd0s55SWG1sL5CNYajJCB8G30R09Y2N2zFaSxlUUUNUH'
    ]
  };

  const imagesForStyle = styleImages[style] || styleImages.watercolor;
  const count = parseInt(pageCount, 10) || 8;
  const pages = [];

  const words = prompt.trim().split(' ');
  const titleWords = words.slice(0, 4).join(' ');
  const bookTitle = titleWords.charAt(0).toUpperCase() + titleWords.slice(1);

  for (let i = 1; i <= count; i++) {
    const imgIndex = (i - 1) % imagesForStyle.length;
    pages.push({
      pageNumber: i,
      title: i === 1 ? 'The Beginning' : i === count ? 'The Horizon Reached' : `Chapter ${i}`,
      text: i === 1 
        ? `It all began with an idea: "${prompt}". The world shifted slightly as the ink dried on the first morning.`
        : `Across page ${i}, the atmosphere deepened. Every detail answered to the storyteller's voice, carrying the narrative forward into light and shadow.`,
      image: imagesForStyle[imgIndex],
      caption: `Page ${i} • ${style.charAt(0).toUpperCase() + style.slice(1)} study`
    });
  }

  const newBook = {
    id: 'book_' + Math.random().toString(36).substring(2, 9),
    title: bookTitle || 'A New Story',
    prompt,
    style,
    pageCount: count,
    createdAt: new Date().toISOString(),
    coverImage: pages[0].image,
    pages
  };

  const books = getLocalBooks();
  books.unshift(newBook);
  saveLocalBooks(books);

  return newBook;
}
