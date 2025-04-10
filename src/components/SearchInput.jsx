import React from 'react';
import { BsSearch } from 'react-icons/bs';

const SearchInput = ({ 
  value, 
  onChange, 
  onSearch, 
  placeholder = "Search...", 
  loading = false 
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <BsSearch className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        disabled={loading}
      />
      {loading && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )}
    </div>
  );
};

export default SearchInput;
