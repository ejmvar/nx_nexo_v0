import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Toolbar,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  RotateRight as RotateIcon,
  Search as SearchIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material';

// PDF.js types
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export interface PDFViewerProps {
  url?: string;
  data?: Uint8Array;
  width?: number | string;
  height?: number | string;
  scale?: number;
  showToolbar?: boolean;
  showSearch?: boolean;
  enableDownload?: boolean;
  enablePrint?: boolean;
  enableFullscreen?: boolean;
  onDocumentLoad?: (numPages: number) => void;
  onPageChange?: (pageNumber: number) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function PDFViewer({
  url,
  data,
  width = '100%',
  height = 600,
  scale: initialScale = 1.0,
  showToolbar = true,
  showSearch = true,
  enableDownload = true,
  enablePrint = true,
  enableFullscreen = true,
  onDocumentLoad,
  onPageChange,
  onError,
  className,
}: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(initialScale);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load PDF document
  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load PDF.js if not already loaded
        if (!window.pdfjsLib) {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.js';
          script.onload = () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
              'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js';
            loadDocument();
          };
          document.head.appendChild(script);
        } else {
          await loadDocument();
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load PDF';
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
        setLoading(false);
      }
    };

    const loadDocument = async () => {
      try {
        let loadingTask;
        if (url) {
          loadingTask = window.pdfjsLib.getDocument(url);
        } else if (data) {
          loadingTask = window.pdfjsLib.getDocument({ data });
        } else {
          throw new Error('Either url or data must be provided');
        }

        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setPageNumber(1);
        onDocumentLoad?.(pdf.numPages);
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load PDF document';
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
        setLoading(false);
      }
    };

    if (url || data) {
      loadPDF();
    }
  }, [url, data, onDocumentLoad, onError]);

  // Render current page
  const renderPage = useCallback(async (pageNum: number, pdf: any) => {
    if (!canvasRef.current || !pdf) return;

    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({
        scale: scale,
        rotation: rotation,
      });

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    } catch (err) {
      console.error('Error rendering page:', err);
    }
  }, [scale, rotation]);

  // Re-render when page, scale, or rotation changes
  useEffect(() => {
    if (pdfDoc && pageNumber) {
      renderPage(pageNumber, pdfDoc);
      onPageChange?.(pageNumber);
    }
  }, [pageNumber, scale, rotation, pdfDoc, renderPage, onPageChange]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= numPages) {
      setPageNumber(page);
    }
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));

  const rotate = () => setRotation(prev => (prev + 90) % 360);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = () => {
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = 'document.pdf';
      link.click();
    }
  };

  const handlePrint = () => {
    if (canvasRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Print PDF</title></head>
            <body style="margin: 0; display: flex; justify-content: center;">
              <img src="${canvasRef.current.toDataURL()}" style="max-width: 100%; height: auto;" />
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleSearch = () => {
    if (!pdfDoc || !searchText) return;

    // Basic search implementation - in a real app you'd want more sophisticated search
    const searchInPage = async (pageNum: number): Promise<boolean> => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const text = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .toLowerCase();

        return text.includes(searchText.toLowerCase());
      } catch {
        return false;
      }
    };

    // Search from current page onwards
    const searchFromCurrentPage = async () => {
      for (let i = pageNumber; i <= numPages; i++) {
        if (await searchInPage(i)) {
          setPageNumber(i);
          return;
        }
      }
      // If not found, search from beginning
      for (let i = 1; i < pageNumber; i++) {
        if (await searchInPage(i)) {
          setPageNumber(i);
          return;
        }
      }
    };

    searchFromCurrentPage();
  };

  if (error) {
    return (
      <Alert severity="error" className={className}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper
      className={className}
      sx={{
        width: isFullscreen ? '100vw' : width,
        height: isFullscreen ? '100vh' : height,
        display: 'flex',
        flexDirection: 'column',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 9999 : 'auto',
        bgcolor: 'background.paper',
      }}
    >
      {showToolbar && (
        <Toolbar sx={{ borderBottom: 1, borderColor: 'divider', flexWrap: 'wrap' }}>
          {/* Navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <IconButton
              onClick={() => goToPage(pageNumber - 1)}
              disabled={pageNumber <= 1}
              size="small"
            >
              <PrevIcon />
            </IconButton>
            <TextField
              size="small"
              type="number"
              value={pageNumber}
              onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
              inputProps={{ min: 1, max: numPages }}
              sx={{ width: 80, mx: 1 }}
            />
            <Typography variant="body2" sx={{ mr: 1 }}>
              of {numPages}
            </Typography>
            <IconButton
              onClick={() => goToPage(pageNumber + 1)}
              disabled={pageNumber >= numPages}
              size="small"
            >
              <NextIcon />
            </IconButton>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Zoom Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <IconButton onClick={zoomOut} size="small">
              <ZoomOutIcon />
            </IconButton>
            <Typography variant="body2" sx={{ mx: 1, minWidth: 60 }}>
              {Math.round(scale * 100)}%
            </Typography>
            <IconButton onClick={zoomIn} size="small">
              <ZoomInIcon />
            </IconButton>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Rotation */}
          <Tooltip title="Rotate">
            <IconButton onClick={rotate} size="small">
              <RotateIcon />
            </IconButton>
          </Tooltip>

          <Box sx={{ flexGrow: 1 }} />

          {/* Search */}
          {showSearch && (
            <TextField
              size="small"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleSearch}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mr: 2, minWidth: 200 }}
            />
          )}

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {enableDownload && (
              <Tooltip title="Download">
                <IconButton onClick={handleDownload} size="small">
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            )}
            {enablePrint && (
              <Tooltip title="Print">
                <IconButton onClick={handlePrint} size="small">
                  <PrintIcon />
                </IconButton>
              </Tooltip>
            )}
            {enableFullscreen && (
              <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
                <IconButton onClick={toggleFullscreen} size="small">
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      )}

      {/* PDF Canvas */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          overflow: 'auto',
          p: 2,
          bgcolor: 'grey.100',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography>Loading PDF...</Typography>
          </Box>
        ) : (
          <canvas
            ref={canvasRef}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              borderRadius: '4px',
            }}
          />
        )}
      </Box>
    </Paper>
  );
}

// PDF Thumbnail Component
export interface PDFThumbnailProps {
  url?: string;
  data?: Uint8Array;
  pageNumber?: number;
  width?: number;
  height?: number;
  onClick?: (pageNumber: number) => void;
  selected?: boolean;
  className?: string;
}

export function PDFThumbnail({
  url,
  data,
  pageNumber = 1,
  width = 120,
  height = 160,
  onClick,
  selected = false,
  className,
}: PDFThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadThumbnail = async () => {
      try {
        if (!window.pdfjsLib) return;

        let loadingTask;
        if (url) {
          loadingTask = window.pdfjsLib.getDocument(url);
        } else if (data) {
          loadingTask = window.pdfjsLib.getDocument({ data });
        } else {
          return;
        }

        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(pageNumber);

        const scale = Math.min(width / page.getViewport({ scale: 1 }).width, height / page.getViewport({ scale: 1 }).height);
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        setLoading(false);
      } catch (err) {
        console.error('Error loading thumbnail:', err);
        setLoading(false);
      }
    };

    loadThumbnail();
  }, [url, data, pageNumber, width, height]);

  return (
    <Card
      className={className}
      onClick={() => onClick?.(pageNumber)}
      sx={{
        width,
        cursor: onClick ? 'pointer' : 'default',
        border: selected ? 2 : 1,
        borderColor: selected ? 'primary.main' : 'divider',
        '&:hover': onClick ? { boxShadow: 3 } : {},
      }}
    >
      <CardContent sx={{ p: 1, textAlign: 'center' }}>
        {loading ? (
          <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '4px',
            }}
          />
        )}
        <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
          Page {pageNumber}
        </Typography>
      </CardContent>
    </Card>
  );
}

// PDF Thumbnails Sidebar Component
export interface PDFThumbnailsProps {
  url?: string;
  data?: Uint8Array;
  numPages: number;
  currentPage: number;
  onPageSelect: (pageNumber: number) => void;
  width?: number;
  className?: string;
}

export function PDFThumbnails({
  url,
  data,
  numPages,
  currentPage,
  onPageSelect,
  width = 140,
  className,
}: PDFThumbnailsProps) {
  return (
    <Box
      className={className}
      sx={{
        width,
        height: '100%',
        overflowY: 'auto',
        borderRight: 1,
        borderColor: 'divider',
        p: 1,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
        Pages
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
          <PDFThumbnail
            key={pageNum}
            url={url}
            data={data}
            pageNumber={pageNum}
            width={width - 16}
            height={(width - 16) * 1.33}
            onClick={onPageSelect}
            selected={pageNum === currentPage}
          />
        ))}
      </Box>
    </Box>
  );
}

// PDF Viewer with Thumbnails
export interface PDFViewerWithThumbnailsProps extends PDFViewerProps {
  showThumbnails?: boolean;
  thumbnailWidth?: number;
}

export function PDFViewerWithThumbnails({
  showThumbnails = true,
  thumbnailWidth = 140,
  ...viewerProps
}: PDFViewerWithThumbnailsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);

  const handleDocumentLoad = (pages: number) => {
    setNumPages(pages);
    viewerProps.onDocumentLoad?.(pages);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    viewerProps.onPageChange?.(page);
  };

  return (
    <Box sx={{ display: 'flex', height: viewerProps.height }}>
      {showThumbnails && numPages > 1 && (
        <PDFThumbnails
          url={viewerProps.url}
          data={viewerProps.data}
          numPages={numPages}
          currentPage={currentPage}
          onPageSelect={setCurrentPage}
          width={thumbnailWidth}
        />
      )}
      <Box sx={{ flex: 1 }}>
        <PDFViewer
          {...viewerProps}
          onDocumentLoad={handleDocumentLoad}
          onPageChange={handlePageChange}
        />
      </Box>
    </Box>
  );
}