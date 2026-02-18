/**
 * PDF Report Generator
 * Generates comprehensive PDF reports with statistics, charts, and maps
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Load Japanese font support
// Note: For production, you would need to add a Japanese font

/**
 * Generate PDF report for WI data
 * @param {Object} params - Report generation parameters
 * @param {Object} params.wiData - WI GeoJSON data with metadata
 * @param {string} params.areaName - Selected area name
 * @param {string} params.profileName - Selected profile name
 * @param {HTMLCanvasElement} params.mapCanvas - Map screenshot canvas (optional)
 * @param {HTMLCanvasElement} params.histogramCanvas - Histogram chart canvas (optional)
 * @param {HTMLElement} params.boxPlotSvg - Box plot SVG element (optional)
 */
export const generateWIPDFReport = async ({
  wiData,
  areaName,
  profileName,
  mapCanvas = null,
  histogramCanvas = null,
  boxPlotSvg = null,
}) => {
  // Create new PDF document (A4, portrait)
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;

  let yPosition = margin;

  // Helper: Add new page if needed
  const checkPageBreak = (requiredSpace) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // ===== TITLE =====
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('Walkability Index Report', margin, yPosition);
  yPosition += 12;

  // ===== METADATA =====
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  const generatedDate = new Date().toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Generated: ${generatedDate}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Area: ${areaName}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Profile: ${profileName}`, margin, yPosition);
  yPosition += 12;

  // ===== STATISTICS TABLE =====
  checkPageBreak(40);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Statistics Summary', margin, yPosition);
  yPosition += 8;

  if (wiData?.metadata?.statistics) {
    const stats = wiData.metadata.statistics;
    const statsData = [
      ['Metric', 'Value'],
      ['Mean', stats.mean.toFixed(2)],
      ['Minimum', stats.min.toFixed(2)],
      ['Maximum', stats.max.toFixed(2)],
      ['Standard Deviation', stats.std.toFixed(2)],
      ['Grid Count', stats.count.toString()],
    ];

    doc.autoTable({
      startY: yPosition,
      head: [statsData[0]],
      body: statsData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [52, 152, 219], fontStyle: 'bold' },
      margin: { left: margin, right: margin },
      styles: { fontSize: 10 },
    });

    yPosition = doc.lastAutoTable.finalY + 10;
  }

  // ===== HISTOGRAM CHART =====
  if (histogramCanvas) {
    checkPageBreak(80);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('WI Score Distribution', margin, yPosition);
    yPosition += 8;

    try {
      const imgData = histogramCanvas.toDataURL('image/png');
      const imgWidth = contentWidth;
      const imgHeight = (histogramCanvas.height / histogramCanvas.width) * imgWidth;

      checkPageBreak(imgHeight);
      doc.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 10;
    } catch (error) {
      console.error('Error adding histogram to PDF:', error);
      doc.setFontSize(10);
      doc.setFont(undefined, 'italic');
      doc.text('(Chart could not be rendered)', margin, yPosition);
      yPosition += 10;
    }
  }

  // ===== BOX PLOT =====
  if (boxPlotSvg) {
    checkPageBreak(60);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Box Plot', margin, yPosition);
    yPosition += 8;

    try {
      // Convert SVG to canvas for PDF
      const svgString = new XMLSerializer().serializeToString(boxPlotSvg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      // Create blob from SVG
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      await new Promise((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width || 300;
          canvas.height = img.height || 200;
          ctx.drawImage(img, 0, 0);

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = contentWidth * 0.6;
          const imgHeight = (canvas.height / canvas.width) * imgWidth;

          checkPageBreak(imgHeight);
          doc.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 10;

          URL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = reject;
        img.src = url;
      });
    } catch (error) {
      console.error('Error adding box plot to PDF:', error);
      doc.setFontSize(10);
      doc.setFont(undefined, 'italic');
      doc.text('(Box plot could not be rendered)', margin, yPosition);
      yPosition += 10;
    }
  }

  // ===== MAP SCREENSHOT =====
  if (mapCanvas) {
    checkPageBreak(100);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Map View', margin, yPosition);
    yPosition += 8;

    try {
      const imgData = mapCanvas.toDataURL('image/png');
      const imgWidth = contentWidth;
      const imgHeight = (mapCanvas.height / mapCanvas.width) * imgWidth;

      checkPageBreak(imgHeight);
      doc.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 10;
    } catch (error) {
      console.error('Error adding map to PDF:', error);
      doc.setFontSize(10);
      doc.setFont(undefined, 'italic');
      doc.text('(Map could not be rendered)', margin, yPosition);
      yPosition += 10;
    }
  }

  // ===== FOOTER =====
  const totalPages = doc.internal.pages.length - 1; // -1 because first page is always counted
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // ===== SAVE PDF =====
  const fileName = `WI_Report_${areaName}_${profileName}_${Date.now()}.pdf`;
  doc.save(fileName);

  return fileName;
};

/**
 * Capture canvas from Chart.js chart element
 * @param {HTMLElement} chartContainer - Container element with data-chart-type attribute
 * @returns {HTMLCanvasElement|null}
 */
export const captureChartCanvas = (chartContainer) => {
  if (!chartContainer) return null;

  // Find canvas element within container
  const canvas = chartContainer.querySelector('canvas');
  return canvas || null;
};

/**
 * Capture SVG element for box plot
 * @param {HTMLElement} svgContainer - Container element with SVG
 * @returns {SVGElement|null}
 */
export const captureSVGElement = (svgContainer) => {
  if (!svgContainer) return null;

  // Find SVG element within container
  const svg = svgContainer.querySelector('svg');
  return svg || null;
};

/**
 * Capture map screenshot using Leaflet's built-in functionality
 * Note: This requires leaflet-simple-map-screenshoter or similar plugin
 * For now, returns null - implement if needed
 * @param {Object} mapRef - Leaflet map reference
 * @returns {Promise<HTMLCanvasElement|null>}
 */
export const captureMapScreenshot = async (mapRef) => {
  // TODO: Implement map screenshot capture
  // Options:
  // 1. Use leaflet-simple-map-screenshoter plugin
  // 2. Use leaflet-easyprint plugin
  // 3. Manually render tiles to canvas

  console.warn('Map screenshot capture not implemented yet');
  return null;
};
