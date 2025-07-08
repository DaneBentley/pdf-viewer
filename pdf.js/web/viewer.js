/* Copyright 2016 Mozilla Foundation
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

import { RenderingStates, ScrollMode, SpreadMode } from "./ui_utils.js";
import { AppOptions } from "./app_options.js";
import { LinkTarget } from "./pdf_link_service.js";
import { PDFViewerApplication } from "./app.js";

const AppConstants =
  typeof PDFJSDev === "undefined" || PDFJSDev.test("GENERIC")
    ? { LinkTarget, RenderingStates, ScrollMode, SpreadMode }
    : null;

window.PDFViewerApplication = PDFViewerApplication;
window.PDFViewerApplicationConstants = AppConstants;
window.PDFViewerApplicationOptions = AppOptions;

function getViewerConfiguration() {
  return {
    appContainer: document.body,
    principalContainer: document.getElementById("mainContainer"),
    mainContainer: document.getElementById("viewerContainer"),
    viewerContainer: document.getElementById("viewer"),
    toolbar: {
      container: document.getElementById("toolbarContainer"),
      numPages: document.getElementById("numPages"),
      pageNumber: document.getElementById("pageNumber"),
      scaleSelect: document.getElementById("scaleSelect"),
      customScaleOption: document.getElementById("customScaleOption"),
      previous: document.getElementById("previous"),
      next: document.getElementById("next"),
      zoomIn: document.getElementById("zoomInButton"),
      zoomOut: document.getElementById("zoomOutButton"),
      print: document.getElementById("printButton"),
      editorFreeTextButton: document.getElementById("editorFreeTextButton"),
      editorFreeTextParamsToolbar: document.getElementById(
        "editorFreeTextParamsToolbar"
      ),
      editorHighlightButton: document.getElementById("editorHighlightButton"),
      editorHighlightParamsToolbar: document.getElementById(
        "editorHighlightParamsToolbar"
      ),
      editorHighlightColorPicker: document.getElementById(
        "editorHighlightColorPicker"
      ),
      editorInkButton: document.getElementById("editorInkButton"),
      editorInkParamsToolbar: document.getElementById("editorInkParamsToolbar"),
      editorStampButton: document.getElementById("editorStampButton"),
      editorStampParamsToolbar: document.getElementById(
        "editorStampParamsToolbar"
      ),
      editorSignatureButton: document.getElementById("editorSignatureButton"),
      editorSignatureParamsToolbar: document.getElementById(
        "editorSignatureParamsToolbar"
      ),
      download: document.getElementById("downloadButton"),
      // Page Layout Controls (Main Toolbar)
      scrollVerticalMainButton: document.getElementById("scrollVerticalMain"),
      scrollHorizontalMainButton: document.getElementById("scrollHorizontalMain"),
      scrollWrappedMainButton: document.getElementById("scrollWrappedMain"),
      scrollPageMainButton: document.getElementById("scrollPageMain"),
    },
    secondaryToolbar: {
      toolbar: document.getElementById("secondaryToolbar"),
      toggleButton: document.getElementById("secondaryToolbarToggleButton"),
      presentationModeButton: document.getElementById("presentationMode"),
      openFileButton:
        typeof PDFJSDev === "undefined" || PDFJSDev.test("GENERIC")
          ? document.getElementById("secondaryOpenFile")
          : null,
      printButton: document.getElementById("secondaryPrint"),
      downloadButton: document.getElementById("secondaryDownload"),
      viewBookmarkButton: document.getElementById("viewBookmark"),
      firstPageButton: document.getElementById("firstPage"),
      lastPageButton: document.getElementById("lastPage"),
      pageRotateCwButton: document.getElementById("pageRotateCw"),
      pageRotateCcwButton: document.getElementById("pageRotateCcw"),
      cursorSelectToolButton: document.getElementById("cursorSelectTool"),
      cursorHandToolButton: document.getElementById("cursorHandTool"),
      scrollPageButton: document.getElementById("scrollPage"),
      scrollVerticalButton: document.getElementById("scrollVertical"),
      scrollHorizontalButton: document.getElementById("scrollHorizontal"),
      scrollWrappedButton: document.getElementById("scrollWrapped"),
      spreadNoneButton: document.getElementById("spreadNone"),
      spreadOddButton: document.getElementById("spreadOdd"),
      spreadEvenButton: document.getElementById("spreadEven"),
      imageAltTextSettingsButton: document.getElementById(
        "imageAltTextSettings"
      ),
      imageAltTextSettingsSeparator: document.getElementById(
        "imageAltTextSettingsSeparator"
      ),
      toggleAnnotationToolbarButton: document.getElementById("toggleAnnotationToolbar"),
      documentPropertiesButton: document.getElementById("documentProperties"),
    },
    sidebar: {
      // Divs (and sidebar button)
      outerContainer: document.getElementById("outerContainer"),
      sidebarContainer: document.getElementById("sidebarContainer"),
      toggleButton: document.getElementById("sidebarToggleButton"),
      resizer: document.getElementById("sidebarResizer"),
      // Buttons
      thumbnailButton: document.getElementById("viewThumbnail"),
      outlineButton: document.getElementById("viewOutline"),
      attachmentsButton: document.getElementById("viewAttachments"),
      layersButton: document.getElementById("viewLayers"),
      recentFilesButton: document.getElementById("viewRecentFiles"),
      // Views
      thumbnailView: document.getElementById("thumbnailView"),
      outlineView: document.getElementById("outlineView"),
      attachmentsView: document.getElementById("attachmentsView"),
      layersView: document.getElementById("layersView"),
      recentFilesView: document.getElementById("recentFilesView"),
      // View-specific options
      currentOutlineItemButton: document.getElementById("currentOutlineItem"),
    },
    findBar: {
      bar: document.getElementById("findbar"),
      toggleButton: document.getElementById("viewFindButton"),
      findField: document.getElementById("findInput"),
      highlightAllCheckbox: document.getElementById("findHighlightAll"),
      caseSensitiveCheckbox: document.getElementById("findMatchCase"),
      matchDiacriticsCheckbox: document.getElementById("findMatchDiacritics"),
      entireWordCheckbox: document.getElementById("findEntireWord"),
      findMsg: document.getElementById("findMsg"),
      findResultsCount: document.getElementById("findResultsCount"),
      findPreviousButton: document.getElementById("findPreviousButton"),
      findNextButton: document.getElementById("findNextButton"),
    },
    passwordOverlay: {
      dialog: document.getElementById("passwordDialog"),
      label: document.getElementById("passwordText"),
      input: document.getElementById("password"),
      submitButton: document.getElementById("passwordSubmit"),
      cancelButton: document.getElementById("passwordCancel"),
    },
    documentProperties: {
      dialog: document.getElementById("documentPropertiesDialog"),
      closeButton: document.getElementById("documentPropertiesClose"),
      fields: {
        fileName: document.getElementById("fileNameField"),
        fileSize: document.getElementById("fileSizeField"),
        title: document.getElementById("titleField"),
        author: document.getElementById("authorField"),
        subject: document.getElementById("subjectField"),
        keywords: document.getElementById("keywordsField"),
        creationDate: document.getElementById("creationDateField"),
        modificationDate: document.getElementById("modificationDateField"),
        creator: document.getElementById("creatorField"),
        producer: document.getElementById("producerField"),
        version: document.getElementById("versionField"),
        pageCount: document.getElementById("pageCountField"),
        pageSize: document.getElementById("pageSizeField"),
        linearized: document.getElementById("linearizedField"),
      },
    },
    altTextDialog: {
      dialog: document.getElementById("altTextDialog"),
      optionDescription: document.getElementById("descriptionButton"),
      optionDecorative: document.getElementById("decorativeButton"),
      textarea: document.getElementById("descriptionTextarea"),
      cancelButton: document.getElementById("altTextCancel"),
      saveButton: document.getElementById("altTextSave"),
    },
    newAltTextDialog: {
      dialog: document.getElementById("newAltTextDialog"),
      title: document.getElementById("newAltTextTitle"),
      descriptionContainer: document.getElementById(
        "newAltTextDescriptionContainer"
      ),
      textarea: document.getElementById("newAltTextDescriptionTextarea"),
      disclaimer: document.getElementById("newAltTextDisclaimer"),
      learnMore: document.getElementById("newAltTextLearnMore"),
      imagePreview: document.getElementById("newAltTextImagePreview"),
      createAutomatically: document.getElementById(
        "newAltTextCreateAutomatically"
      ),
      createAutomaticallyButton: document.getElementById(
        "newAltTextCreateAutomaticallyButton"
      ),
      downloadModel: document.getElementById("newAltTextDownloadModel"),
      downloadModelDescription: document.getElementById(
        "newAltTextDownloadModelDescription"
      ),
      error: document.getElementById("newAltTextError"),
      errorCloseButton: document.getElementById("newAltTextCloseButton"),
      cancelButton: document.getElementById("newAltTextCancel"),
      notNowButton: document.getElementById("newAltTextNotNow"),
      saveButton: document.getElementById("newAltTextSave"),
    },
    altTextSettingsDialog: {
      dialog: document.getElementById("altTextSettingsDialog"),
      createModelButton: document.getElementById("createModelButton"),
      aiModelSettings: document.getElementById("aiModelSettings"),
      learnMore: document.getElementById("altTextSettingsLearnMore"),
      deleteModelButton: document.getElementById("deleteModelButton"),
      downloadModelButton: document.getElementById("downloadModelButton"),
      showAltTextDialogButton: document.getElementById(
        "showAltTextDialogButton"
      ),
      altTextSettingsCloseButton: document.getElementById(
        "altTextSettingsCloseButton"
      ),
      closeButton: document.getElementById("altTextSettingsCloseButton"),
    },
    addSignatureDialog: {
      dialog: document.getElementById("addSignatureDialog"),
      panels: document.getElementById("addSignatureActionContainer"),
      typeButton: document.getElementById("addSignatureTypeButton"),
      typeInput: document.getElementById("addSignatureTypeInput"),
      drawButton: document.getElementById("addSignatureDrawButton"),
      drawSVG: document.getElementById("addSignatureDraw"),
      drawPlaceholder: document.getElementById("addSignatureDrawPlaceholder"),
      drawThickness: document.getElementById("addSignatureDrawThickness"),
      imageButton: document.getElementById("addSignatureImageButton"),
      imageSVG: document.getElementById("addSignatureImage"),
      imagePlaceholder: document.getElementById("addSignatureImagePlaceholder"),
      imagePicker: document.getElementById("addSignatureFilePicker"),
      imagePickerLink: document.getElementById("addSignatureImageBrowse"),
      description: document.getElementById("addSignatureDescription"),
      clearButton: document.getElementById("clearSignatureButton"),
      saveContainer: document.getElementById("addSignatureSaveContainer"),
      saveCheckbox: document.getElementById("addSignatureSaveCheckbox"),
      errorBar: document.getElementById("addSignatureError"),
      errorCloseButton: document.getElementById("addSignatureErrorCloseButton"),
      cancelButton: document.getElementById("addSignatureCancelButton"),
      addButton: document.getElementById("addSignatureAddButton"),
    },
    editSignatureDialog: {
      dialog: document.getElementById("editSignatureDescriptionDialog"),
      description: document.getElementById("editSignatureDescription"),
      editSignatureView: document.getElementById("editSignatureView"),
      cancelButton: document.getElementById("editSignatureCancelButton"),
      updateButton: document.getElementById("editSignatureUpdateButton"),
    },
    annotationEditorParams: {
      editorFreeTextFontSize: document.getElementById("editorFreeTextFontSize"),
      editorFreeTextColor: document.getElementById("editorFreeTextColor"),
      editorInkColor: document.getElementById("editorInkColor"),
      editorInkThickness: document.getElementById("editorInkThickness"),
      editorInkOpacity: document.getElementById("editorInkOpacity"),
      editorStampAddImage: document.getElementById("editorStampAddImage"),
      editorSignatureAddSignature: document.getElementById(
        "editorSignatureAddSignature"
      ),
      editorFreeHighlightThickness: document.getElementById(
        "editorFreeHighlightThickness"
      ),
      editorHighlightShowAll: document.getElementById("editorHighlightShowAll"),
    },
    printContainer: document.getElementById("printContainer"),
    editorUndoBar: {
      container: document.getElementById("editorUndoBar"),
      message: document.getElementById("editorUndoBarMessage"),
      undoButton: document.getElementById("editorUndoBarUndoButton"),
      closeButton: document.getElementById("editorUndoBarCloseButton"),
    },
  };
}

function webViewerLoad() {
  const config = getViewerConfiguration();

  if (typeof PDFJSDev !== "undefined" && PDFJSDev.test("GENERIC")) {
    // Give custom implementations of the default viewer a simpler way to
    // set various `AppOptions`, by dispatching an event once all viewer
    // files are loaded but *before* the viewer initialization has run.
    const event = new CustomEvent("webviewerloaded", {
      bubbles: true,
      cancelable: true,
      detail: {
        source: window,
      },
    });
    try {
      // Attempt to dispatch the event at the embedding `document`,
      // in order to support cases where the viewer is embedded in
      // a *dynamically* created <iframe> element.
      parent.document.dispatchEvent(event);
    } catch (ex) {
      // The viewer could be in e.g. a cross-origin <iframe> element,
      // fallback to dispatching the event at the current `document`.
      console.error("webviewerloaded:", ex);
      document.dispatchEvent(event);
    }
  }
  PDFViewerApplication.run(config);
}

// Block the "load" event until all pages are loaded, to ensure that printing
// works in Firefox; see https://bugzilla.mozilla.org/show_bug.cgi?id=1618553
document.blockUnblockOnload?.(true);

if (
  document.readyState === "interactive" ||
  document.readyState === "complete"
) {
  webViewerLoad();
} else {
  document.addEventListener("DOMContentLoaded", webViewerLoad, true);
}

// Dark Mode Toggle functionality
function initializeDarkModeToggle() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const html = document.documentElement;
  
  // Check for saved preference or default to 'auto' (follow system)
  const savedMode = localStorage.getItem('pdfjs-color-scheme') || 'auto';
  
  // Set the color scheme
  function setColorScheme(mode) {
    if (mode === 'auto') {
      html.style.colorScheme = 'light dark';
      html.removeAttribute('data-theme');
      html.classList.remove('light', 'dark');
    } else {
      html.style.colorScheme = mode;
      html.removeAttribute('data-theme');
      html.classList.remove('light', 'dark');
      html.classList.add(mode);
    }
  }
  
  // Update button icon and title based on current mode
  function updateButton() {
    const currentMode = localStorage.getItem('pdfjs-color-scheme') || 'auto';
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = currentMode === 'dark' || (currentMode === 'auto' && systemDark);
    
    darkModeToggle.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  }
  
  // Apply saved mode
  setColorScheme(savedMode);
  updateButton();
  
  // Listen for system preference changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', updateButton);
  
  darkModeToggle.addEventListener('click', () => {
    const currentMode = localStorage.getItem('pdfjs-color-scheme') || 'auto';
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = currentMode === 'dark' || (currentMode === 'auto' && systemDark);
    
    const newMode = isDark ? 'light' : 'dark';
    
    setColorScheme(newMode);
    localStorage.setItem('pdfjs-color-scheme', newMode);
    updateButton();
  });
}

// Invert Colors Toggle functionality
function initializeInvertColorsToggle() {
  const invertColorsToggle = document.getElementById('invertColorsToggle');
  const pdfViewer = document.getElementById('viewer');
  
  // Check for saved invert preference or default to 'false'
  const savedInvert = localStorage.getItem('pdfjs-invert-colors') === 'true';
  
  // Apply saved state
  if (savedInvert) {
    pdfViewer.classList.add('invertColors');
    invertColorsToggle.classList.add('toggled');
    invertColorsToggle.title = 'Disable Color Inversion';
  } else {
    invertColorsToggle.title = 'Invert Colors for Night Reading';
  }
  
  invertColorsToggle.addEventListener('click', () => {
    const isInverted = pdfViewer.classList.contains('invertColors');
    
    if (isInverted) {
      pdfViewer.classList.remove('invertColors');
      invertColorsToggle.classList.remove('toggled');
      invertColorsToggle.title = 'Invert Colors for Night Reading';
      localStorage.setItem('pdfjs-invert-colors', 'false');
    } else {
      pdfViewer.classList.add('invertColors');
      invertColorsToggle.classList.add('toggled');
      invertColorsToggle.title = 'Disable Color Inversion';
      localStorage.setItem('pdfjs-invert-colors', 'true');
    }
  });
}

// Initialize dark mode toggle when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDarkModeToggle);
} else {
  initializeDarkModeToggle();
}

// Initialize invert colors toggle when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeInvertColorsToggle);
} else {
  initializeInvertColorsToggle();
}

// Main Toolbar Page Layout Buttons functionality
function initializeMainToolbarPageLayoutButtons() {
  const config = getViewerConfiguration();
  
  // Get main toolbar buttons
  const scrollVerticalMain = config.toolbar.scrollVerticalMainButton;
  const scrollHorizontalMain = config.toolbar.scrollHorizontalMainButton;
  const scrollWrappedMain = config.toolbar.scrollWrappedMainButton;
  const scrollPageMain = config.toolbar.scrollPageMainButton;
  
  if (!scrollVerticalMain || !scrollHorizontalMain || !scrollWrappedMain || !scrollPageMain) {
    console.warn('Main toolbar page layout buttons not found');
    return;
  }
  
  // Define ScrollMode constants to match ui_utils.js
  const ScrollMode = {
    UNKNOWN: -1,
    VERTICAL: 0,    // Default value
    HORIZONTAL: 1,
    WRAPPED: 2,
    PAGE: 3
  };
  
  // Button mappings with their corresponding scroll modes
  const buttonMappings = [
    { button: scrollVerticalMain, mode: ScrollMode.VERTICAL },
    { button: scrollHorizontalMain, mode: ScrollMode.HORIZONTAL },
    { button: scrollWrappedMain, mode: ScrollMode.WRAPPED },
    { button: scrollPageMain, mode: ScrollMode.PAGE }
  ];
  
  // Add click listeners to main toolbar buttons
  buttonMappings.forEach(({ button, mode }) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      // Directly dispatch scroll mode change event
      PDFViewerApplication.eventBus.dispatch("switchscrollmode", { 
        source: PDFViewerApplication, 
        mode: mode 
      });
    });
  });
  
  // Sync button states when scroll mode changes
  function syncButtonStates() {
    const app = window.PDFViewerApplication;
    if (app?.eventBus) {
      app.eventBus._on('scrollmodechanged', ({ mode }) => {
        // Update button states
        scrollVerticalMain.classList.toggle('toggled', mode === ScrollMode.VERTICAL);
        scrollHorizontalMain.classList.toggle('toggled', mode === ScrollMode.HORIZONTAL);
        scrollWrappedMain.classList.toggle('toggled', mode === ScrollMode.WRAPPED);
        scrollPageMain.classList.toggle('toggled', mode === ScrollMode.PAGE);
        
        // Update aria-checked attributes for accessibility
        scrollVerticalMain.setAttribute('aria-checked', mode === ScrollMode.VERTICAL ? 'true' : 'false');
        scrollHorizontalMain.setAttribute('aria-checked', mode === ScrollMode.HORIZONTAL ? 'true' : 'false');
        scrollWrappedMain.setAttribute('aria-checked', mode === ScrollMode.WRAPPED ? 'true' : 'false');
        scrollPageMain.setAttribute('aria-checked', mode === ScrollMode.PAGE ? 'true' : 'false');
      });
    } else {
      // Retry if PDFViewerApplication is not ready yet
      setTimeout(syncButtonStates, 100);
    }
  }
  
  // Start syncing button states
  syncButtonStates();
}

// Initialize main toolbar page layout buttons when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMainToolbarPageLayoutButtons);
} else {
  initializeMainToolbarPageLayoutButtons();
}

export {
  PDFViewerApplication,
  AppConstants as PDFViewerApplicationConstants,
  AppOptions as PDFViewerApplicationOptions,
};
