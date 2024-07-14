"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Book {
  id: string;
  title: string;
  author: string;
  summary: string;
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [summary, setSummary] = useState('');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);

  const fetchBooks = async () => {
    const response = await axios.get('/api/books');
    setBooks(response.data);
  };

  const createBook = async () => {
    await axios.post('/api/books', { title, author, summary });
    fetchBooks();
    setTitle('');
    setAuthor('');
    setSummary('');
  };

  const searchBooks = async () => {
    const response = await axios.get(`/api/search?q=${query}`);
    setSearchResults(response.data);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-center mb-4">Book Collection</h1>
      <div className="flex flex-col border-2 border-black rounded-md p-3 items-center mb-8 space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-4 py-2 border rounded w-1/2"
        />
        <input
          type="text"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="px-4 py-2 border rounded w-1/2"
        />
        <input
          type="text"
          placeholder="Summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="px-4 py-2 border rounded w-1/2"
        />
        <button
          onClick={createBook}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Add Book
        </button>
      </div>
      <div className="flex">
        <div className="flex w-1/2 border-2 p-3 border-black rounded-md items-center justify-center overflow-auto">
          <div className="text-xl font-bold mb-4">Books</div>
          <ul className="space-y-4">
            {books.map((book) => (
              <li key={book.id} className="p-4 border rounded">
                <h3 className="text-lg font-semibold">{book.title}</h3>
                <p className="text-sm">Author: {book.author}</p>
                <p className="text-sm">Summary: {book.summary}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-1/2 pl-4 overflow-auto">
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="px-4 py-2 border rounded w-full mb-4"
          />
          <button
            onClick={searchBooks}
            className="px-4 py-2 bg-green-500 text-white rounded w-full"
          >
            Search
          </button>
          <ul className="mt-4 space-y-4">
            {searchResults.map((book) => (
              <li key={book.id} className="p-4 border rounded">
                <h3 className="text-lg font-semibold">{book.title}</h3>
                <p className="text-sm">Author: {book.author}</p>
                <p className="text-sm">Summary: {book.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
