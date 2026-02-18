import React, { useState } from 'react';
import {
  generateWIPDFReport,
  captureChartCanvas,
  captureSVGElement,
} from '../../utils/pdfGenerator';

/**
 * PDF Report Generator Component
 * Generates comprehensive PDF reports with statistics, charts, and maps
 */
const PDFReportGenerator = ({ wiData, areaName, profileName }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Capture chart canvases
      const histogramContainer = document.querySelector('[data-chart-type="histogram"]');
      const boxPlotContainer = document.querySelector('[data-chart-type="boxplot"]');

      const histogramCanvas = captureChartCanvas(histogramContainer);
      const boxPlotSvg = captureSVGElement(boxPlotContainer);

      // Note: Map capture not implemented yet
      const mapCanvas = null;

      // Generate PDF
      const fileName = await generateWIPDFReport({
        wiData,
        areaName,
        profileName,
        mapCanvas,
        histogramCanvas,
        boxPlotSvg,
      });

      console.log('PDF generated successfully:', fileName);
    } catch (err) {
      console.error('PDF generation error:', err);
      setError('PDFの生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleGeneratePDF}
        disabled={isGenerating || !wiData}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: isGenerating || !wiData ? '#95a5a6' : '#27ae60',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: isGenerating || !wiData ? 'default' : 'pointer',
          transition: 'background-color 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
        onMouseOver={(e) => {
          if (!isGenerating && wiData) {
            e.target.style.backgroundColor = '#229954';
          }
        }}
        onMouseOut={(e) => {
          if (!isGenerating && wiData) {
            e.target.style.backgroundColor = '#27ae60';
          }
        }}
      >
        <span style={{ fontSize: '16px' }}>📄</span>
        {isGenerating ? 'PDF生成中...' : 'PDFレポート生成'}
      </button>

      {error && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#c00',
        }}>
          {error}
        </div>
      )}

      <div style={{
        marginTop: '10px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        fontSize: '11px',
        color: '#7f8c8d',
      }}>
        レポートには統計情報、分布チャート、箱ひげ図が含まれます。
      </div>
    </div>
  );
};

export default PDFReportGenerator;
