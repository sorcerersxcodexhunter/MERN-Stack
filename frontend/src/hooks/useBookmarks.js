import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import bookmarkService from '../services/bookmarkService.js';

// Custom hook for bookmark management
export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState(new Set());
  const userData = useSelector((state) => state.auth.user);
  
  // Get user ID for bookmark management
  const userId = userData?.id || userData?._id || 'guest';

  // Load bookmarks on mount and when userId changes
  useEffect(() => {
    const userBookmarks = bookmarkService.getBookmarks(userId);
    setBookmarks(userBookmarks);
    
  }, [userId]);

  // Toggle bookmark function
  const toggleBookmark = (jobId) => {
    const updatedBookmarks = bookmarkService.toggleBookmark(jobId, userId);
    setBookmarks(new Set(updatedBookmarks)); // Create new Set to trigger re-render
    
  };

  // Check if a job is bookmarked
  const isBookmarked = (jobId) => {
    return bookmarks.has(jobId);
  };

  // Add bookmark function
  const addBookmark = (jobId) => {
    const updatedBookmarks = bookmarkService.addBookmark(jobId, userId);
    setBookmarks(new Set(updatedBookmarks));
    
  };

  // Remove bookmark function
  const removeBookmark = (jobId) => {
    const updatedBookmarks = bookmarkService.removeBookmark(jobId, userId);
    setBookmarks(new Set(updatedBookmarks));
    
  };

  // Get bookmark count
  const getBookmarkCount = () => {
    return bookmarks.size;
  };

  // Clear all bookmarks for current user
  const clearBookmarks = () => {
    bookmarkService.clearUserBookmarks(userId);
    setBookmarks(new Set());
    
  };

  return {
    bookmarks,
    toggleBookmark,
    isBookmarked,
    addBookmark,
    removeBookmark,
    getBookmarkCount,
    clearBookmarks,
    userId
  };
};

export default useBookmarks;
