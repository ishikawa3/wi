import React, { useState } from 'react';
import html2canvas from 'html2canvas';

/**
 * Export buttons component for PNG and CSV export
 */
const ExportButtons = ({ wiData, selectedArea, selectedProfile }) => {
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Export map as PNG image
   */
  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      // Find the map container
      const mapElement = document.querySelector('.leaflet-container');

      if (!mapElement) {
        alert('地図が見つかりません');
        return;
      }

      // Capture the map as canvas
      const canvas = await html2canvas(mapElement, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f0f0f0',
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `wi_map_${selectedArea}_${selectedProfile}_${Date.now()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      });

      console.log('PNG export completed');
    } catch (error) {
      console.error('PNG export failed:', error);
      alert('PNG エクスポートに失敗しました');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Export WI data as CSV
   */
  const handleExportCSV = () => {
    if (!wiData || !wiData.features || wiData.features.length === 0) {
      alert('エクスポートするデータがありません');
      return;
    }

    setIsExporting(true);
    try {
      // Extract properties from GeoJSON features
      const features = wiData.features;

      // Get all property keys (excluding geometry)
      const allKeys = new Set();
      features.forEach(feature => {
        Object.keys(feature.properties).forEach(key => allKeys.add(key));
      });

      // Convert to array and sort
      const keys = Array.from(allKeys).sort();

      // Create CSV header
      let csv = keys.map(key => `"${key}"`).join(',') + '\n';

      // Add rows
      features.forEach(feature => {
        const row = keys.map(key => {
          const value = feature.properties[key];
          if (value === null || value === undefined) {
            return '';
          }
          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        });
        csv += row.join(',') + '\n';
      });

      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `wi_data_${selectedArea}_${selectedProfile}_${Date.now()}.csv`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      console.log('CSV export completed');
    } catch (error) {
      console.error('CSV export failed:', error);
      alert('CSV エクスポートに失敗しました');
    } finally {
      setIsExporting(false);
    }
  };

  // Don't show buttons if no data
  if (!wiData || !wiData.features || wiData.features.length === 0) {
    return null;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <button
        onClick={handleExportPNG}
        disabled={isExporting}
        style={{
          padding: '10px 15px',
          backgroundColor: isExporting ? '#95a5a6' : '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: isExporting ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
        onMouseOver={(e) => {
          if (!isExporting) {
            e.target.style.backgroundColor = '#2980b9';
          }
        }}
        onMouseOut={(e) => {
          if (!isExporting) {
            e.target.style.backgroundColor = '#3498db';
          }
        }}
      >
        <span style={{ fontSize: '16px' }}>📷</span>
        {isExporting ? 'エクスポート中...' : 'PNG画像をダウンロード'}
      </button>

      <button
        onClick={handleExportCSV}
        disabled={isExporting}
        style={{
          padding: '10px 15px',
          backgroundColor: isExporting ? '#95a5a6' : '#27ae60',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: isExporting ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
        onMouseOver={(e) => {
          if (!isExporting) {
            e.target.style.backgroundColor = '#229954';
          }
        }}
        onMouseOut={(e) => {
          if (!isExporting) {
            e.target.style.backgroundColor = '#27ae60';
          }
        }}
      >
        <span style={{ fontSize: '16px' }}>📊</span>
        {isExporting ? 'エクスポート中...' : 'CSVデータをダウンロード'}
      </button>

      <div style={{
        fontSize: '11px',
        color: '#7f8c8d',
        padding: '5px 0',
        textAlign: 'center'
      }}>
        {wiData.features.length} グリッドセル
      </div>
    </div>
  );
};

export default ExportButtons;
