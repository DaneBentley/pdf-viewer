/* Copyright 2024 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @typedef {import("./event_utils.js").EventBus} EventBus */

const DEFAULT_MAX_RECENT_FILES = 20;
const RECENT_FILES_STORAGE_KEY = "pdfjs.recentFiles";
const RECENT_FILES_CACHE_DB = "pdfjs.recentFilesCache";
const RECENT_FILES_CACHE_STORE = "files";
const RECENT_FILES_CACHE_VERSION = 1;

/**
 * @typedef {Object} RecentFileEntry
 * @property {string} fingerprint - Unique PDF fingerprint
 * @property {string} filename - Display name of the file
 * @property {string} url - File URL or path
 * @property {number} lastOpened - Timestamp when file was last opened
 * @property {string} [thumbnail] - Base64 encoded thumbnail image
 * @property {boolean} hasEdits - Whether the file has unsaved annotations
 * @property {Object} viewState - Saved view state (page, zoom, scroll position)
 * @property {number} viewState.page - Current page number
 * @property {number} viewState.zoom - Current zoom level
 * @property {number} viewState.scrollTop - Scroll position
 * @property {number} viewState.scrollLeft - Horizontal scroll position
 * @property {number} viewState.rotation - Page rotation
 * @property {boolean} isCached - Whether the file data is cached locally
 * @property {number} fileSize - Size of the cached file in bytes
 */

/**
 * @typedef {Object} CachedFileData
 * @property {string} fingerprint - Unique PDF fingerprint
 * @property {ArrayBuffer} data - The PDF file data
 * @property {string} filename - Display name of the file
 * @property {string} originalUrl - Original file URL
 * @property {number} cachedAt - Timestamp when file was cached
 * @property {number} fileSize - Size of the file in bytes
 */

/**
 * Recent Files Manager - Manages locally stored recently opened PDF files
 * with their metadata, thumbnails, view states, and cached file data.
 */
class RecentFilesManager {
  /**
   * @param {EventBus} eventBus - The application event bus
   * @param {number} maxFiles - Maximum number of recent files to store
   */
  constructor(eventBus, maxFiles = DEFAULT_MAX_RECENT_FILES) {
    this.eventBus = eventBus;
    this.maxFiles = maxFiles;
    this.recentFiles = new Map();
    this.cacheDB = null;
    
    this._initializeFromStorage();
    this._initializeCache();
  }

  /**
   * Initialize the recent files from localStorage
   * @private
   */
  async _initializeFromStorage() {
    try {
      const stored = localStorage.getItem(RECENT_FILES_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (Array.isArray(data.files)) {
          // Convert array to Map for faster lookups
          for (const file of data.files) {
            this.recentFiles.set(file.fingerprint, file);
          }
          // Clean up old entries if we exceed max files
          this._cleanupOldEntries();
        }
      }
    } catch (error) {
      console.warn("Failed to load recent files from storage:", error);
      // Reset storage on corruption
      this.recentFiles.clear();
      this._saveToStorage();
    }
  }

  /**
   * Initialize IndexedDB for file caching
   * @private
   */
  async _initializeCache() {
    try {
      if (!window.indexedDB) {
        console.warn("IndexedDB not available, file caching disabled");
        return;
      }

      const request = indexedDB.open(RECENT_FILES_CACHE_DB, RECENT_FILES_CACHE_VERSION);
      
      request.onerror = () => {
        console.warn("Failed to open IndexedDB for file caching:", request.error);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store for cached files
        if (!db.objectStoreNames.contains(RECENT_FILES_CACHE_STORE)) {
          const store = db.createObjectStore(RECENT_FILES_CACHE_STORE, { keyPath: 'fingerprint' });
          store.createIndex('cachedAt', 'cachedAt', { unique: false });
          store.createIndex('fileSize', 'fileSize', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.cacheDB = event.target.result;
        this._cleanupExpiredCache();
      };
    } catch (error) {
      console.warn("Failed to initialize file cache:", error);
    }
  }

  /**
   * Save current recent files to localStorage
   * @private
   */
  _saveToStorage() {
    try {
      const data = {
        files: Array.from(this.recentFiles.values())
          .sort((a, b) => b.lastOpened - a.lastOpened) // Sort by most recent first
      };
      localStorage.setItem(RECENT_FILES_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn("Failed to save recent files to storage:", error);
    }
  }

  /**
   * Clean up old entries to maintain max file limit
   * @private
   */
  _cleanupOldEntries() {
    if (this.recentFiles.size <= this.maxFiles) {
      return;
    }

    // Sort by last opened date and remove oldest entries
    const sortedFiles = Array.from(this.recentFiles.values())
      .sort((a, b) => b.lastOpened - a.lastOpened);
    
    // Keep only the most recent files
    const filesToKeep = sortedFiles.slice(0, this.maxFiles);
    const filesToRemove = sortedFiles.slice(this.maxFiles);
    
    this.recentFiles.clear();
    
    for (const file of filesToKeep) {
      this.recentFiles.set(file.fingerprint, file);
    }

    // Remove cached data for files we're no longer tracking
    for (const file of filesToRemove) {
      this._removeCachedFile(file.fingerprint);
    }
  }

  /**
   * Clean up expired cached files (older than 30 days)
   * @private
   */
  async _cleanupExpiredCache() {
    if (!this.cacheDB) return;

    try {
      const transaction = this.cacheDB.transaction([RECENT_FILES_CACHE_STORE], 'readwrite');
      const store = transaction.objectStore(RECENT_FILES_CACHE_STORE);
      const index = store.index('cachedAt');
      
      const cutoffTime = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days ago
      const range = IDBKeyRange.upperBound(cutoffTime);
      
      const request = index.openCursor(range);
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
    } catch (error) {
      console.warn("Failed to cleanup expired cache:", error);
    }
  }

  /**
   * Cache PDF file data in IndexedDB
   * @param {string} fingerprint - PDF fingerprint
   * @param {ArrayBuffer} data - PDF file data
   * @param {string} filename - Display filename
   * @param {string} originalUrl - Original file URL
   * @returns {Promise<boolean>} Success status
   */
  async _cacheFileData(fingerprint, data, filename, originalUrl) {
    if (!this.cacheDB || !data) {
      return false;
    }

    try {
      const cachedData = {
        fingerprint,
        data,
        filename,
        originalUrl,
        cachedAt: Date.now(),
        fileSize: data.byteLength
      };

      const transaction = this.cacheDB.transaction([RECENT_FILES_CACHE_STORE], 'readwrite');
      const store = transaction.objectStore(RECENT_FILES_CACHE_STORE);
      
      await new Promise((resolve, reject) => {
        const request = store.put(cachedData);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      // Update the recent file entry to indicate it's cached
      const file = this.recentFiles.get(fingerprint);
      if (file) {
        file.isCached = true;
        file.fileSize = data.byteLength;
        this._saveToStorage();
      }

      return true;
    } catch (error) {
      console.warn("Failed to cache file data:", error);
      return false;
    }
  }

  /**
   * Retrieve cached PDF file data from IndexedDB
   * @param {string} fingerprint - PDF fingerprint
   * @returns {Promise<ArrayBuffer|null>} Cached file data or null
   */
  async _getCachedFileData(fingerprint) {
    if (!this.cacheDB) {
      return null;
    }

    try {
      const transaction = this.cacheDB.transaction([RECENT_FILES_CACHE_STORE], 'readonly');
      const store = transaction.objectStore(RECENT_FILES_CACHE_STORE);
      
      const cachedData = await new Promise((resolve, reject) => {
        const request = store.get(fingerprint);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      return cachedData?.data || null;
    } catch (error) {
      console.warn("Failed to retrieve cached file data:", error);
      return null;
    }
  }

  /**
   * Remove cached file data from IndexedDB
   * @param {string} fingerprint - PDF fingerprint
   * @private
   */
  async _removeCachedFile(fingerprint) {
    if (!this.cacheDB) {
      return;
    }

    try {
      const transaction = this.cacheDB.transaction([RECENT_FILES_CACHE_STORE], 'readwrite');
      const store = transaction.objectStore(RECENT_FILES_CACHE_STORE);
      store.delete(fingerprint);
    } catch (error) {
      console.warn("Failed to remove cached file:", error);
    }
  }

  /**
   * Add or update a recent file entry with optional caching
   * @param {string} fingerprint - PDF fingerprint
   * @param {string} filename - Display filename
   * @param {string} url - File URL
   * @param {Object} [viewState] - Current view state
   * @param {ArrayBuffer} [fileData] - PDF file data to cache
   */
  async addRecentFile(fingerprint, filename, url, viewState = {}, fileData = null) {
    const now = Date.now();
    const existingFile = this.recentFiles.get(fingerprint);
    
    const fileEntry = {
      fingerprint,
      filename: filename || "Unknown Document",
      url,
      lastOpened: now,
      thumbnail: existingFile?.thumbnail || null,
      hasEdits: existingFile?.hasEdits || false,
      isCached: existingFile?.isCached || false,
      fileSize: existingFile?.fileSize || 0,
      viewState: {
        page: 1,
        zoom: 1,
        scrollTop: 0,
        scrollLeft: 0,
        rotation: 0,
        ...existingFile?.viewState,
        ...viewState
      }
    };

    this.recentFiles.set(fingerprint, fileEntry);

    // Cache file data if provided
    if (fileData) {
      const cached = await this._cacheFileData(fingerprint, fileData, filename, url);
      if (cached) {
        fileEntry.isCached = true;
        fileEntry.fileSize = fileData.byteLength;
      }
    }

    this._cleanupOldEntries();
    this._saveToStorage();

    // Notify listeners
    this.eventBus.dispatch("recentfileschanged", {
      source: this,
      files: this.getRecentFiles()
    });
  }

  /**
   * Get cached file data for opening
   * @param {string} fingerprint - PDF fingerprint
   * @returns {Promise<{data: ArrayBuffer, filename: string}|null>} Cached file info or null
   */
  async getCachedFile(fingerprint) {
    const file = this.recentFiles.get(fingerprint);
    if (!file || !file.isCached) {
      return null;
    }

    const data = await this._getCachedFileData(fingerprint);
    if (!data) {
      // Mark as not cached if data is missing
      file.isCached = false;
      this._saveToStorage();
      return null;
    }

    return {
      data,
      filename: file.filename,
      viewState: file.viewState
    };
  }

  /**
   * Check if a file is cached locally
   * @param {string} fingerprint - PDF fingerprint
   * @returns {boolean} Whether the file is cached
   */
  isFileCached(fingerprint) {
    const file = this.recentFiles.get(fingerprint);
    return file?.isCached || false;
  }

  /**
   * Update view state for a file
   * @param {string} fingerprint - PDF fingerprint
   * @param {Object} viewState - New view state
   */
  updateViewState(fingerprint, viewState) {
    const file = this.recentFiles.get(fingerprint);
    if (file) {
      file.viewState = { ...file.viewState, ...viewState };
      file.lastOpened = Date.now(); // Update last opened time
      this._saveToStorage();
    }
  }

  /**
   * Update thumbnail for a file
   * @param {string} fingerprint - PDF fingerprint
   * @param {string} thumbnailData - Base64 encoded thumbnail
   */
  updateThumbnail(fingerprint, thumbnailData) {
    const file = this.recentFiles.get(fingerprint);
    if (file) {
      file.thumbnail = thumbnailData;
      this._saveToStorage();
      
      // Notify listeners of thumbnail update
      this.eventBus.dispatch("recentfilesthumbnailupdate", {
        source: this,
        fingerprint,
        thumbnail: thumbnailData
      });
    }
  }

  /**
   * Mark a file as having edits
   * @param {string} fingerprint - PDF fingerprint
   * @param {boolean} hasEdits - Whether file has unsaved edits
   */
  updateEditStatus(fingerprint, hasEdits) {
    const file = this.recentFiles.get(fingerprint);
    if (file) {
      file.hasEdits = hasEdits;
      this._saveToStorage();
    }
  }

  /**
   * Update cached file data
   * @param {string} fingerprint - PDF fingerprint
   * @param {Uint8Array} data - New PDF data
   */
  async updateCachedFileData(fingerprint, data) {
    try {
      const file = this.recentFiles.get(fingerprint);
      if (!file) {
        throw new Error(`File with fingerprint ${fingerprint} not found in recent files`);
      }
      
      // Update the cached data using existing method
      const cached = await this._cacheFileData(fingerprint, data, file.filename, file.url);
      
      if (cached) {
        // Update file size in recent files entry
        file.fileSize = data.length;
        file.isCached = true;
        this._saveToStorage();
        
        // Notify listeners
        this.eventBus.dispatch("recentfileschanged", {
          source: this,
          files: this.getRecentFiles()
        });
        
        console.log(`Updated cached data for ${fingerprint}, size: ${data.length} bytes`);
      } else {
        throw new Error("Failed to cache file data");
      }
    } catch (error) {
      console.error("Failed to update cached file data:", error);
      throw error;
    }
  }

  /**
   * Remove a file from recent files
   * @param {string} fingerprint - PDF fingerprint
   */
  removeRecentFile(fingerprint) {
    if (this.recentFiles.delete(fingerprint)) {
      this._saveToStorage();
      
      // Remove cached data
      this._removeCachedFile(fingerprint);
      
      // Notify listeners
      this.eventBus.dispatch("recentfileschanged", {
        source: this,
        files: this.getRecentFiles()
      });
    }
  }

  /**
   * Clear all recent files
   */
  clearAllRecentFiles() {
    // Remove all cached files
    for (const file of this.recentFiles.values()) {
      this._removeCachedFile(file.fingerprint);
    }
    
    this.recentFiles.clear();
    this._saveToStorage();
    
    // Notify listeners
    this.eventBus.dispatch("recentfileschanged", {
      source: this,
      files: []
    });
  }

  /**
   * Get all recent files sorted by last opened
   * @returns {RecentFileEntry[]} Array of recent files
   */
  getRecentFiles() {
    return Array.from(this.recentFiles.values())
      .sort((a, b) => b.lastOpened - a.lastOpened);
  }

  /**
   * Get a specific recent file by fingerprint
   * @param {string} fingerprint - PDF fingerprint
   * @returns {RecentFileEntry|null} The file entry or null
   */
  getRecentFile(fingerprint) {
    return this.recentFiles.get(fingerprint) || null;
  }

  /**
   * Generate a thumbnail from a PDF page
   * @param {Object} page - PDF page object
   * @param {number} maxWidth - Maximum thumbnail width
   * @param {number} maxHeight - Maximum thumbnail height
   * @returns {Promise<string>} Base64 encoded thumbnail
   */
  async generateThumbnail(page, maxWidth = 150, maxHeight = 200) {
    try {
      const viewport = page.getViewport({ scale: 1 });
      const scale = Math.min(maxWidth / viewport.width, maxHeight / viewport.height);
      const scaledViewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
      };

      await page.render(renderContext).promise;
      return canvas.toDataURL("image/jpeg", 0.8);
    } catch (error) {
      console.warn("Failed to generate thumbnail:", error);
      return null;
    }
  }
}

export { RecentFilesManager }; 