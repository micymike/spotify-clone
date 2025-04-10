import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BsMusicNoteList, 
  BsHouseFill, 
  BsSearchHeart, 
  BsCollectionPlay, 
  BsBarChartLine 
} from 'react-icons/bs';

const Sidebar = ({ onClose }) => {
  const location = useLocation();

  const menuItems = [
    { 
      icon: <BsHouseFill />, 
      text: 'Home', 
      path: '/' 
    },
    { 
      icon: <BsSearchHeart />, 
      text: 'Search', 
      path: '/search' 
    },
    { 
      icon: <BsCollectionPlay />, 
      text: 'Playlists', 
      path: '/playlists' 
    },
    { 
      icon: <BsBarChartLine />, 
      text: 'Wrapped', 
      path: '/wrapped' 
    }
  ];

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <div className="bg-gray-900 text-white w-64 p-4 h-screen fixed left-0 top-0 z-50">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-green-500">Mimo</h1>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item, index) => (
          <Link 
            key={index} 
            to={item.path} 
            onClick={handleNavClick}
            className={`
              flex items-center p-3 rounded-lg transition-all duration-200 
              ${location.pathname === item.path 
                ? 'bg-green-500 text-black' 
                : 'hover:bg-gray-700'
              }
            `}
          >
            <span className="mr-3 text-xl">{item.icon}</span>
            <span>{item.text}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
