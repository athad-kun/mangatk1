'use client';
import { useState } from 'react';
import { categories } from '../data/mockManga';
import { SearchBar } from './SearchBar';

export function FilterSection({ onFilter, onSort }) {
  const [status, setStatus] = useState('All');
  const [order, setOrder] = useState('Name');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const handleFilter = () => {
    onFilter({ status, categories: selectedCategories });
  };

  const handleCategoryToggle = (cat) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const statuses = ['All', 'Completed', 'Ongoing'];
  const orders = ['Name', 'Latest Chapter', 'Most Popular', 'Rating'];

  return (
    <section className="py-8 bg-white dark:bg-gray-900 border-b" data-aos="fade-down">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <SearchBar onSearch={(q) => onFilter({ query: q })} />

          <div className="flex flex-wrap gap-4 items-center">
            {/* Status Dropdown */}
            <div className="relative">
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                aria-label="Filter by status"
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Categories Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:text-white flex items-center"
                aria-expanded={showCategoryDropdown}
                aria-label="Select categories"
              >
                Categories
                <span className="ml-2">{selectedCategories.length > 0 ? `(${selectedCategories.length})` : ''}</span>
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-10 p-2">
                  {categories.map(cat => (
                    <label key={cat} className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => handleCategoryToggle(cat)}
                        className="mr-2"
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Order Dropdown */}
            <div className="relative">
              <select 
                value={order} 
                onChange={(e) => onSort(e.target.value)}
                className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                aria-label="Sort by"
              >
                {orders.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* Filter Button */}
            <button 
              onClick={handleFilter} 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Apply filters"
            >
              Filter
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}