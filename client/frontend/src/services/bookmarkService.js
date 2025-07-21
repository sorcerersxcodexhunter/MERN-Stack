// Bookmark Management Service
class BookmarkService {
  constructor() {
    this.BOOKMARK_KEY = 'jobPortalBookmarks';
  }

  // Get all bookmarks for the current user
  getBookmarks(userId = null) {
    try {
      // First, try to migrate old bookmarks if they exist
      this.migrateOldBookmarks(userId);
      
      const bookmarksData = localStorage.getItem(this.BOOKMARK_KEY);
      if (!bookmarksData) return new Set();
      
      const allBookmarks = JSON.parse(bookmarksData);
      
      // If userId is provided, get user-specific bookmarks
      if (userId) {
        return new Set(allBookmarks[userId] || []);
      }
      
      // For backward compatibility, if no userId, get all bookmarks
      if (Array.isArray(allBookmarks)) {
        return new Set(allBookmarks);
      }
      
      // If it's an object, get all bookmarks from all users
      const allUserBookmarks = Object.values(allBookmarks).flat();
      return new Set(allUserBookmarks);
    } catch (error) {
      
      return new Set();
    }
  }

  // Migrate old bookmark format to new user-specific format
  migrateOldBookmarks(userId) {
    try {
      const oldBookmarks = localStorage.getItem('bookmarkedJobs');
      if (oldBookmarks && userId) {
        const oldBookmarkArray = JSON.parse(oldBookmarks);
        if (Array.isArray(oldBookmarkArray) && oldBookmarkArray.length > 0) {
          
          
          // Save old bookmarks to new format
          this.saveBookmarks(oldBookmarkArray, userId);
          
          // Remove old format
          localStorage.removeItem('bookmarkedJobs');
          
          
        }
      }
    } catch (error) {
      
    }
  }

  // Save bookmarks for the current user
  saveBookmarks(bookmarks, userId = null) {
    try {
      let allBookmarks = {};
      
      // Load existing bookmarks
      const existingData = localStorage.getItem(this.BOOKMARK_KEY);
      if (existingData) {
        const parsed = JSON.parse(existingData);
        if (typeof parsed === 'object' && !Array.isArray(parsed)) {
          allBookmarks = parsed;
        }
      }
      
      // Convert Set to Array for storage
      const bookmarkArray = Array.isArray(bookmarks) ? bookmarks : [...bookmarks];
      
      if (userId) {
        // Save user-specific bookmarks
        allBookmarks[userId] = bookmarkArray;
      } else {
        // For backward compatibility, save as general bookmarks
        allBookmarks['general'] = bookmarkArray;
      }
      
      localStorage.setItem(this.BOOKMARK_KEY, JSON.stringify(allBookmarks));
      
    } catch (error) {
      
    }
  }

  // Add a bookmark
  addBookmark(jobId, userId = null) {
    const bookmarks = this.getBookmarks(userId);
    bookmarks.add(jobId);
    this.saveBookmarks(bookmarks, userId);
    return bookmarks;
  }

  // Remove a bookmark
  removeBookmark(jobId, userId = null) {
    const bookmarks = this.getBookmarks(userId);
    bookmarks.delete(jobId);
    this.saveBookmarks(bookmarks, userId);
    return bookmarks;
  }

  // Toggle a bookmark
  toggleBookmark(jobId, userId = null) {
    const bookmarks = this.getBookmarks(userId);
    if (bookmarks.has(jobId)) {
      bookmarks.delete(jobId);
    } else {
      bookmarks.add(jobId);
    }
    this.saveBookmarks(bookmarks, userId);
    return bookmarks;
  }

  // Check if a job is bookmarked
  isBookmarked(jobId, userId = null) {
    const bookmarks = this.getBookmarks(userId);
    return bookmarks.has(jobId);
  }

  // Clear all bookmarks (used on logout)
  clearAllBookmarks() {
    localStorage.removeItem(this.BOOKMARK_KEY);
  }

  // Clear bookmarks for a specific user
  clearUserBookmarks(userId) {
    try {
      const bookmarksData = localStorage.getItem(this.BOOKMARK_KEY);
      if (!bookmarksData) return;
      
      const allBookmarks = JSON.parse(bookmarksData);
      if (allBookmarks && typeof allBookmarks === 'object') {
        delete allBookmarks[userId];
        localStorage.setItem(this.BOOKMARK_KEY, JSON.stringify(allBookmarks));
      }
    } catch (error) {
      
    }
  }

  // Get bookmark count for a user
  getBookmarkCount(userId = null) {
    return this.getBookmarks(userId).size;
  }
}

// Create a singleton instance
const bookmarkService = new BookmarkService();

export default bookmarkService;
