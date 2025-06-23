import React, { useState } from 'react';
import wordList from './wordlist';
import { openDB } from 'idb';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [word, setWord] = useState('');
  const [result, setResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const initDB = async () => {
    return await openDB('dictionary', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('words')) {
          db.createObjectStore('words');
        }
      },
    });
  };

  const handleSearch = async () => {
    const db = await initDB();
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const data = await res.json();
      await db.put('words', data[0], word);
      setResult(data[0]);
    } catch (err) {
      const offlineResult = await db.get('words', word);
      if (offlineResult) {
        setResult(offlineResult);
      } else {
        alert("Not found offline. Try again online.");
      }
    }
  };

  const onChangeHandler = (e) => {
    const val = e.target.value;
    setWord(val);
    if (val.length > 1) {
      const matches = wordList
        .filter(w => w.startsWith(val.toLowerCase()))
        .slice(0, 5);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">

      {/* Background Glow Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500 rounded-full filter blur-2xl opacity-30 animate-ping"></div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-10 drop-shadow-xl tracking-wide"
      >
        NEXUS DICTIONARY
      </motion.h1>

      {/* Search Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="w-full max-w-xl relative"
      >
        <div className="bg-white/10 border border-cyan-400/20 backdrop-blur-xl rounded-2xl p-4 shadow-xl relative">
          <input
            type="text"
            placeholder="Search for a word..."
            value={word}
            onChange={onChangeHandler}
            className="w-full px-6 py-4 bg-transparent text-white placeholder-cyan-300 focus:outline-none text-xl tracking-wide"
          />

          {suggestions.length > 0 && (
            <ul className="absolute z-30 w-full mt-2 bg-black/90 border border-cyan-500/30 rounded-xl overflow-hidden">
              {suggestions.map((suggestion, i) => (
                <li
                  key={i}
                  onClick={() => {
                    setWord(suggestion);
                    setSuggestions([]);
                  }}
                  className="px-6 py-3 text-cyan-100 hover:bg-cyan-600/10 cursor-pointer border-b border-cyan-400/10 last:border-b-0"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>

      {/* Search Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSearch}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 rounded-full text-white font-bold shadow-xl hover:shadow-2xl transition-all"
      >
        Execute Neural Search
      </motion.button>

      {/* Search Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-black/60 backdrop-blur-xl rounded-3xl shadow-2xl mt-12 p-10 w-full max-w-4xl border border-white/10"
          >
            <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
              {result.word}
            </h2>
            <p className="text-cyan-300 text-xl mb-4 italic">{result.phonetics?.[0]?.text}</p>
            <p className="text-white/80 text-lg mb-2">
              <span className="text-cyan-400 font-semibold">Part of Speech:</span> {result.meanings?.[0]?.partOfSpeech}
            </p>
            <p className="text-white/90 text-xl">
              <span className="text-purple-300 font-semibold">Definition:</span> {result.meanings?.[0]?.definitions?.[0]?.definition}
            </p>

            {result.meanings?.[0]?.definitions?.[0]?.example && (
              <div className="mt-4">
                <p className="text-yellow-200 italic">
                  "{result.meanings[0].definitions[0].example}"
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Glow Line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 animate-pulse" />

    </div>
  );
}

export default App;
