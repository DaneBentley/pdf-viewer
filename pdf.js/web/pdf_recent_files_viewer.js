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
/** @typedef {import("./interfaces.js").IL10n} IL10n */
/** @typedef {import("./recent_files_manager.js").RecentFilesManager} RecentFilesManager */
/** @typedef {import("./recent_files_manager.js").RecentFileEntry} RecentFileEntry */

/**
 * @typedef {Object} PDFRecentFilesViewerOptions
 * @property {HTMLDivElement} container - The viewer element.
 * @property {EventBus} eventBus - The application event bus.
 * @property {IL10n} l10n - The localization service.
 * @property {RecentFilesManager} recentFilesManager - The recent files manager.
 */

/**
 * PDF Recent Files Viewer - Displays and manages the recent files sidebar view
 */
class PDFRecentFilesViewer {
  /**
   * @param {PDFRecentFilesViewerOptions} options
   */
  constructor({ container, eventBus, l10n, recentFilesManager }) {
    this.container = container;
    this.eventBus = eventBus;
    this.l10n = l10n;
    this.recentFilesManager = recentFilesManager;
    this.selectedFingerprint = null;
    this.currentFingerprint = null;
    
    this.reset();
    this._addEventListeners();
  }

  reset() {
    this.container.textContent = "";
    this._createUI();
  }

  /**
   * Create the UI structure for recent files
   * @private
   */
  _createUI() {
    // Create header
    const header = document.createElement("div");
    header.className = "recentFilesHeader";
    
    const title = document.createElement("h2");
    title.textContent = "Recent Files";
    title.className = "recentFilesTitle";
    
    const clearButton = document.createElement("button");
    clearButton.className = "recentFilesClearButton";
    clearButton.textContent = "Clear All";
    clearButton.title = "Clear all recent files";
    clearButton.addEventListener("click", () => this._clearAllFiles());
    
    header.appendChild(title);
    header.appendChild(clearButton);
    
    // Create search input
    const searchContainer = document.createElement("div");
    searchContainer.className = "recentFilesSearchContainer";
    
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.className = "recentFilesSearchInput";
    searchInput.placeholder = "Search recent files...";
    searchInput.addEventListener("input", (e) => this._filterFiles(e.target.value));
    searchInput.addEventListener("keydown", (e) => this._handleSearchKeydown(e));
    
    searchContainer.appendChild(searchInput);
    
    // Create files list container
    const listContainer = document.createElement("div");
    listContainer.className = "recentFilesList";
    
    // Create empty state
    const emptyState = document.createElement("div");
    emptyState.className = "recentFilesEmpty";
    emptyState.innerHTML = `
      <div class="recentFilesEmptyIcon"></div>
      <div class="recentFilesEmptyText">No recent files</div>
      <div class="recentFilesEmptySubtext">Open a PDF to see it here</div>
    `;
    
    // Create no results state
    const noResultsState = document.createElement("div");
    noResultsState.className = "recentFilesNoResults";
    noResultsState.style.display = "none";
    noResultsState.innerHTML = `
      <div class="recentFilesEmptyIcon"></div>
      <div class="recentFilesEmptyText">No matching files</div>
      <div class="recentFilesEmptySubtext">Try a different search term</div>
    `;
    
    this.container.appendChild(header);
    this.container.appendChild(searchContainer);
    this.container.appendChild(listContainer);
    this.container.appendChild(emptyState);
    this.container.appendChild(noResultsState);
    
    // Store references
    this._listContainer = listContainer;
    this._emptyState = emptyState;
    this._noResultsState = noResultsState;
    this._clearButton = clearButton;
    this._searchInput = searchInput;
    this._currentFilter = "";
    
    // Initial render
    this._renderFilesList();
  }

  /**
   * Add event listeners
   * @private
   */
  _addEventListeners() {
    this.eventBus._on("recentfileschanged", (evt) => {
      this._renderFilesList();
    });
    
    this.eventBus._on("recentfilesthumbnailupdate", (evt) => {
      this._updateThumbnail(evt.fingerprint, evt.thumbnail);
    });
  }

  /**
   * Render the list of recent files
   * @private
   */
  _renderFilesList() {
    let files = this.recentFilesManager.getRecentFiles();
    
    // Apply filter if present
    if (this._currentFilter) {
      files = files.filter(file => 
        file.filename.toLowerCase().includes(this._currentFilter) ||
        file.url.toLowerCase().includes(this._currentFilter)
      );
    }
    
    // Clear existing list
    this._listContainer.textContent = "";
    
    // Handle empty states
    if (this.recentFilesManager.getRecentFiles().length === 0) {
      // No files at all
      this._emptyState.style.display = "block";
      this._noResultsState.style.display = "none";
      this._clearButton.disabled = true;
      this._searchInput.style.display = "none";
      return;
    } else if (files.length === 0 && this._currentFilter) {
      // No files match search
      this._emptyState.style.display = "none";
      this._noResultsState.style.display = "block";
      this._clearButton.disabled = false;
      this._searchInput.style.display = "block";
      return;
    } else {
      // Files to display
      this._emptyState.style.display = "none";
      this._noResultsState.style.display = "none";
      this._clearButton.disabled = false;
      this._searchInput.style.display = "block";
    }
    
    // Create file items
    for (const file of files) {
      const fileItem = this._createFileItem(file);
      this._listContainer.appendChild(fileItem);
    }
    
    // Restore current file indicator if set
    if (this.currentFingerprint) {
      const currentItem = this._listContainer.querySelector(`[data-fingerprint="${this.currentFingerprint}"]`);
      if (currentItem) {
        currentItem.classList.add('current');
      }
    }
    
    // Add keyboard navigation
    this._setupKeyboardNavigation();
  }

  /**
   * Create a file item element
   * @param {RecentFileEntry} file - The file entry
   * @returns {HTMLElement} The file item element
   * @private
   */
  _createFileItem(file) {
    const item = document.createElement("div");
    item.className = "recentFileItem";
    item.dataset.fingerprint = file.fingerprint;
    
    // Thumbnail
    const thumbnail = document.createElement("div");
    thumbnail.className = "recentFileThumbnail";
    
    if (file.thumbnail) {
      const img = document.createElement("img");
      img.src = file.thumbnail;
      img.alt = "PDF thumbnail";
      thumbnail.appendChild(img);
    } else {
      thumbnail.innerHTML = '<div class="recentFileThumbnailPlaceholder"></div>';
    }
    
    // Content
    const content = document.createElement("div");
    content.className = "recentFileContent";
    
    const filename = document.createElement("div");
    filename.className = "recentFileFilename";
    filename.textContent = file.filename;
    filename.title = file.filename;
    
    const metadata = document.createElement("div");
    metadata.className = "recentFileMetadata";
    
    const lastOpened = document.createElement("span");
    lastOpened.className = "recentFileLastOpened";
    lastOpened.textContent = this._formatDate(file.lastOpened);
    
    const pageInfo = document.createElement("span");
    pageInfo.className = "recentFilePageInfo";
    pageInfo.textContent = `Page ${file.viewState.page}`;
    
    metadata.appendChild(lastOpened);
    metadata.appendChild(pageInfo);
    
    // Cache status indicator
    const cacheStatus = document.createElement("span");
    cacheStatus.className = "recentFileCacheStatus";
    if (file.isCached) {
      cacheStatus.title = `Cached locally (${this._formatFileSize(file.fileSize)})`;
      cacheStatus.classList.add('cached');
    } else {
      cacheStatus.title = 'Will download when opened';
      cacheStatus.classList.add('not-cached');
    }
    metadata.appendChild(cacheStatus);
    
    // Edit indicator
    if (file.hasEdits) {
      const editIndicator = document.createElement("div");
      editIndicator.className = "recentFileEditIndicator";
      editIndicator.textContent = "●";
      editIndicator.title = "Has unsaved changes";
      metadata.appendChild(editIndicator);
    }
    
    content.appendChild(filename);
    content.appendChild(metadata);
    
    // Actions
    const actions = document.createElement("div");
    actions.className = "recentFileActions";
    
    const removeButton = document.createElement("button");
    removeButton.className = "recentFileRemoveButton";
    removeButton.title = "Remove from recent files";
    removeButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this._removeFile(file.fingerprint);
    });
    
    actions.appendChild(removeButton);
    
    // Assemble item
    item.appendChild(thumbnail);
    item.appendChild(content);
    item.appendChild(actions);
    
    // Click handler to open file (with visual selection feedback)
    item.addEventListener("click", () => {
      // Show selection feedback briefly
      this._selectFile(file.fingerprint);
      // Open the file
      this._openFile(file);
    });
    
    return item;
  }

  /**
   * Format a timestamp into a readable date string
   * @param {number} timestamp - The timestamp to format
   * @returns {string} Formatted date string
   * @private
   */
  _formatDate(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) {
      return "Just now";
    } else if (minutes < 60) {
      return `${minutes} min ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (days < 7) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return new Date(timestamp).toLocaleDateString();
    }
  }

  /**
   * Format file size into a readable string
   * @param {number} bytes - The file size in bytes
   * @returns {string} Formatted file size string
   * @private
   */
  _formatFileSize(bytes) {
    if (!bytes || bytes === 0) return "Unknown size";
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  }

  /**
   * Select a file item
   * @param {string} fingerprint - The file fingerprint to select
   * @private
   */
  _selectFile(fingerprint) {
    // Remove previous selection
    const previousSelected = this._listContainer.querySelector('.recentFileItem.selected');
    if (previousSelected) {
      previousSelected.classList.remove('selected');
    }

    // Add selection to current item
    const currentItem = this._listContainer.querySelector(`[data-fingerprint="${fingerprint}"]`);
    if (currentItem) {
      currentItem.classList.add('selected');
      this.selectedFingerprint = fingerprint;
    }
  }

  /**
   * Set the currently viewed file
   * @param {string} fingerprint - The file fingerprint that is currently being viewed
   * @public
   */
  setCurrentFile(fingerprint) {
    // Remove previous current file indicator
    const previousCurrent = this._listContainer.querySelector('.recentFileItem.current');
    if (previousCurrent) {
      previousCurrent.classList.remove('current');
    }

    // Add current indicator to the file being viewed
    if (fingerprint) {
      const currentItem = this._listContainer.querySelector(`[data-fingerprint="${fingerprint}"]`);
      if (currentItem) {
        currentItem.classList.add('current');
        this.currentFingerprint = fingerprint;
      }
    } else {
      this.currentFingerprint = null;
    }
  }

  /**
   * Open a recent file
   * @param {RecentFileEntry} file - The file to open
   * @private
   */
  _openFile(file) {
    this.eventBus.dispatch("openrecentfile", {
      source: this,
      file: file
    });
  }

  /**
   * Remove a file from recent files
   * @param {string} fingerprint - The file fingerprint
   * @private
   */
  _removeFile(fingerprint) {
    this.recentFilesManager.removeRecentFile(fingerprint);
  }

  /**
   * Clear all recent files
   * @private
   */
  _clearAllFiles() {
    if (confirm("Are you sure you want to clear all recent files?")) {
      this.recentFilesManager.clearAllRecentFiles();
    }
  }

  /**
   * Update thumbnail for a specific file
   * @param {string} fingerprint - The file fingerprint
   * @param {string} thumbnail - The thumbnail data
   * @private
   */
  _updateThumbnail(fingerprint, thumbnail) {
    const fileItem = this._listContainer.querySelector(`[data-fingerprint="${fingerprint}"]`);
    if (fileItem) {
      const thumbnailContainer = fileItem.querySelector(".recentFileThumbnail");
      if (thumbnailContainer) {
        thumbnailContainer.innerHTML = "";
        const img = document.createElement("img");
        img.src = thumbnail;
        img.alt = "PDF thumbnail";
        thumbnailContainer.appendChild(img);
      }
    }
  }

  /**
   * Filter files based on search input
   * @param {string} filter - The search term
   * @private
   */
  _filterFiles(filter) {
    this._currentFilter = filter.toLowerCase();
    this._renderFilesList();
  }

  /**
   * Handle search keydown event
   * @param {KeyboardEvent} e - The keydown event
   * @private
   */
  _handleSearchKeydown(e) {
    if (e.key === "Enter") {
      this._filterFiles(this._searchInput.value);
    }
  }

  /**
   * Add keyboard navigation
   * @private
   */
  _setupKeyboardNavigation() {
    const fileItems = this._listContainer.querySelectorAll('.recentFileItem');
    
    fileItems.forEach((item, index) => {
      item.tabIndex = index === 0 ? 0 : -1;
      item.addEventListener('keydown', (e) => this._handleFileItemKeydown(e, index));
      item.addEventListener('contextmenu', (e) => this._showContextMenu(e, item));
    });
  }

  /**
   * Handle keydown events on file items
   * @param {KeyboardEvent} e - The keydown event
   * @param {number} index - The current item index
   * @private
   */
  _handleFileItemKeydown(e, index) {
    const fileItems = this._listContainer.querySelectorAll('.recentFileItem');
    let newIndex = index;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        newIndex = Math.min(index + 1, fileItems.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        newIndex = Math.max(index - 1, 0);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        const fingerprint = fileItems[index].dataset.fingerprint;
        const file = this.recentFilesManager.getRecentFile(fingerprint);
        if (file) {
          this._selectFile(fingerprint);
          this._openFile(file);
        }
        break;
      case 'Delete':
        e.preventDefault();
        const deleteFingerprint = fileItems[index].dataset.fingerprint;
        this._removeFile(deleteFingerprint);
        break;
      case 'Escape':
        this._searchInput.focus();
        break;
      default:
        return;
    }

    // Update focus
    if (newIndex !== index && fileItems[newIndex]) {
      fileItems[index].tabIndex = -1;
      fileItems[newIndex].tabIndex = 0;
      fileItems[newIndex].focus();
    }
  }

  /**
   * Show context menu for file item
   * @param {MouseEvent} e - The context menu event
   * @param {HTMLElement} item - The file item element
   * @private
   */
  _showContextMenu(e, item) {
    e.preventDefault();
    
    const fingerprint = item.dataset.fingerprint;
    const file = this.recentFilesManager.getRecentFile(fingerprint);
    
    if (!file) return;

    // Remove existing context menu
    const existingMenu = document.querySelector('.recentFilesContextMenu');
    if (existingMenu) {
      existingMenu.remove();
    }

    // Create context menu
    const contextMenu = document.createElement('div');
    contextMenu.className = 'recentFilesContextMenu';
    contextMenu.style.position = 'fixed';
    contextMenu.style.left = `${e.clientX}px`;
    contextMenu.style.top = `${e.clientY}px`;
    contextMenu.style.zIndex = '10000';

    const menuItems = [
      {
        label: 'Open',
        action: () => this._openFile(file),
        dataAction: 'open'
      },
      {
        label: 'Open in New Tab',
        action: () => window.open(file.url, '_blank'),
        dataAction: 'openNewTab'
      },
      { type: 'separator' },
      {
        label: 'Copy File Path',
        action: () => navigator.clipboard?.writeText(file.url),
        dataAction: 'copyPath'
      },
      {
        label: 'Show File Info',
        action: () => this._showFileInfo(file),
        dataAction: 'showInfo'
      },
      { type: 'separator' },
      {
        label: 'Remove from Recent',
        action: () => this._removeFile(fingerprint),
        className: 'destructive',
        dataAction: 'remove'
      }
    ];

    menuItems.forEach(menuItem => {
      if (menuItem.type === 'separator') {
        const separator = document.createElement('div');
        separator.className = 'contextMenuSeparator';
        contextMenu.appendChild(separator);
      } else {
        const menuButton = document.createElement('button');
        menuButton.className = `contextMenuItem ${menuItem.className || ''}`;
        if (menuItem.dataAction) {
          menuButton.setAttribute('data-action', menuItem.dataAction);
        }
        menuButton.innerHTML = `<span class="contextMenuIcon"></span>${menuItem.label}`;
        menuButton.addEventListener('click', () => {
          menuItem.action();
          contextMenu.remove();
        });
        contextMenu.appendChild(menuButton);
      }
    });

    document.body.appendChild(contextMenu);

    // Close menu on outside click
    const closeMenu = (e) => {
      if (!contextMenu.contains(e.target)) {
        contextMenu.remove();
        document.removeEventListener('click', closeMenu);
        document.removeEventListener('keydown', escapeHandler);
      }
    };

    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        contextMenu.remove();
        document.removeEventListener('click', closeMenu);
        document.removeEventListener('keydown', escapeHandler);
      }
    };

    setTimeout(() => {
      document.addEventListener('click', closeMenu);
      document.addEventListener('keydown', escapeHandler);
    }, 10);
  }

  /**
   * Show file information dialog
   * @param {RecentFileEntry} file - The file to show info for
   * @private
   */
  _showFileInfo(file) {
    const info = [
      `Filename: ${file.filename}`,
      `Last Opened: ${this._formatDate(file.lastOpened)}`,
      `Current Page: ${file.viewState.page}`,
      `Zoom Level: ${Math.round(file.viewState.zoom * 100)}%`,
      `Rotation: ${file.viewState.rotation}°`,
      `Has Edits: ${file.hasEdits ? 'Yes' : 'No'}`,
      `File Path: ${file.url}`
    ].join('\n');

    alert(info);
  }
}

export { PDFRecentFilesViewer }; 