/**
 * SearchBar - Natural language search for photos
 * 
 * Supports queries like:
 * - "receipts from last month"
 * - "screenshots"
 * - "documents"
 * - "high privacy risk"
 */

import { useState } from 'react';
import { PhotoCategory } from '../types/photo';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onCategoryFilter: (category: PhotoCategory | 'all') => void;
  selectedCategory: PhotoCategory | 'all';
  photoCount: number;
}

export function SearchBar({ 
  onSearch, 
  onCategoryFilter, 
  selectedCategory,
  photoCount 
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const categories: Array<{ value: PhotoCategory | 'all'; label: string; emoji: string }> = [
    { value: 'all', label: 'All Photos', emoji: '📂' },
    { value: PhotoCategory.Document, label: 'Documents', emoji: '📄' },
    { value: PhotoCategory.Receipt, label: 'Receipts', emoji: '🧾' },
    { value: PhotoCategory.Screenshot, label: 'Screenshots', emoji: '📱' },
    { value: PhotoCategory.Note, label: 'Notes', emoji: '📝' },
    { value: PhotoCategory.PersonalPhoto, label: 'Personal', emoji: '📷' },
  ];

  return (
    <div className="search-bar">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search photos... (e.g., 'receipts from last month', 'documents')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear"
              onClick={() => {
                setSearchQuery('');
                onSearch('');
              }}
            >
              ✕
            </button>
          )}
        </div>
        <button type="submit" className="btn-search">
          Search
        </button>
      </form>

      <div className="category-filters">
        {categories.map((cat) => (
          <button
            key={cat.value}
            className={`category-filter ${selectedCategory === cat.value ? 'active' : ''}`}
            onClick={() => onCategoryFilter(cat.value)}
          >
            <span className="filter-emoji">{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="search-stats">
        <span className="stats-icon">📊</span>
        <span className="stats-text">
          {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
          {selectedCategory !== 'all' && ` in ${selectedCategory}`}
        </span>
      </div>
    </div>
  );
}
