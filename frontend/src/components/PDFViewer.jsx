import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import PropTypes from "prop-types";

// Configurar worker de PDF.js usando unpkg como respaldo
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFViewer = ({ pdfUrl, pdfFile }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setError(null);
  }

  function onDocumentLoadError(error) {
    console.error("Error al cargar PDF:", error);
    setError(error.message || "Error desconocido al cargar el PDF");
  }

  // Determinar qué fuente usar: archivo local o URL
  const pdfSource = pdfFile || pdfUrl;

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(numPages, prev + 1));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(2.0, prev + 0.1));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(0.5, prev - 0.1));
  };

  if (!pdfSource) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-gray-400">
          <span className="text-6xl mb-4 block">📄</span>
          <p className="text-lg">No hay PDF cargado</p>
          <p className="text-sm mt-2">Ingresa una URL o carga un archivo PDF</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#2C2F36] rounded-lg p-4">
      {/* Controles */}
      <div className="flex items-center justify-between mb-4 bg-[#23262F] p-3 rounded-lg">
        <div className="flex gap-2">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente →
          </button>
        </div>
        <div className="text-white text-sm">
          Página {pageNumber} de {numPages || "?"}
        </div>
        <div className="flex gap-2">
          <button
            onClick={zoomOut}
            className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700"
          >
            -
          </button>
          <span className="text-white px-3 py-2">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700"
          >
            +
          </button>
        </div>
      </div>

      {/* Mensaje de error si existe */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <span className="text-red-500 text-xl">⚠️</span>
            <div>
              <p className="text-red-400 font-semibold mb-1">
                Error al cargar el PDF
              </p>
              <p className="text-red-300 text-sm">{error}</p>
              <p className="text-gray-400 text-xs mt-2">
                Verifica que:
                <br />• La URL sea correcta y accesible
                <br />• El archivo sea un PDF válido
                <br />• El servidor permita CORS (Cross-Origin Resource Sharing)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Visor de PDF */}
      <div className="overflow-auto max-h-[600px] bg-gray-800 rounded-lg flex justify-center">
        <Document
          file={pdfSource}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          options={{
            cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
            cMapPacked: true,
          }}
          loading={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                <p className="text-gray-400 text-sm">Cargando PDF...</p>
              </div>
            </div>
          }
          error={
            <div className="text-center text-red-400 p-8">
              <span className="text-4xl mb-3 block">📄</span>
              <p className="font-semibold mb-2">No se pudo cargar el PDF</p>
              <p className="text-sm text-gray-400">
                Verifica la URL o intenta con otro documento
              </p>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>
    </div>
  );
};

PDFViewer.propTypes = {
  pdfUrl: PropTypes.string,
  pdfFile: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(File),
    PropTypes.instanceOf(Blob),
  ]),
};

export default PDFViewer;
