import React, { useState, useEffect } from 'react';
import { searchAddress } from '../../api/endpoints';
import { getSearchHistory, addSearchHistory, clearSearchHistory } from '../../utils/searchHistory';

/**
 * Address Search Component
 * Provides address search functionality with history
 */
const AddressSearch = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  // Load search history on mount
  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  // Handle search submission
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) {
      setError('住所を入力してください');
      return;
    }

    setIsSearching(true);
    setError(null);
    setShowHistory(false);

    try {
      const searchResults = await searchAddress(query, 5);
      setResults(searchResults);

      if (searchResults.length === 0) {
        setError('検索結果が見つかりませんでした');
      }
    } catch (err) {
      console.error('Address search error:', err);
      setError('検索に失敗しました。もう一度お試しください。');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle result selection
  const handleSelectResult = (result) => {
    // Add to history
    addSearchHistory(result);
    setHistory(getSearchHistory());

    // Notify parent
    if (onSelect) {
      onSelect({
        lat: result.lat,
        lon: result.lon,
        address: result.display_name
      });
    }

    // Clear search
    setQuery('');
    setResults([]);
    setError(null);
  };

  // Handle history item click
  const handleSelectHistory = (item) => {
    handleSelectResult(item);
  };

  // Clear all history
  const handleClearHistory = () => {
    if (window.confirm('検索履歴をすべて削除しますか?')) {
      clearSearchHistory();
      setHistory([]);
    }
  };

  return (
    <div style={{
      padding: '15px',
      backgroundColor: 'white',
      borderRadius: '8px',
    }}>
      <h3 style={{
        fontSize: '14px',
        marginBottom: '10px',
        marginTop: '0',
        color: '#2c3e50',
        fontWeight: 600,
      }}>
        住所検索
      </h3>

      {/* Search Form */}
      <form onSubmit={handleSearch} style={{ marginBottom: '15px' }}>
        <div style={{
          display: 'flex',
          gap: '8px',
        }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="住所を入力 (例: 東京都品川区)"
            style={{
              flex: 1,
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '13px',
            }}
            disabled={isSearching}
          />
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            style={{
              padding: '8px 16px',
              backgroundColor: isSearching || !query.trim() ? '#95a5a6' : '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isSearching || !query.trim() ? 'default' : 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => {
              if (!isSearching && query.trim()) {
                e.target.style.backgroundColor = '#2980b9';
              }
            }}
            onMouseOut={(e) => {
              if (!isSearching && query.trim()) {
                e.target.style.backgroundColor = '#3498db';
              }
            }}
          >
            {isSearching ? '検索中...' : '検索'}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#c00',
          marginBottom: '15px',
        }}>
          {error}
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{
            fontSize: '12px',
            marginBottom: '8px',
            marginTop: '0',
            color: '#555',
            fontWeight: 600,
          }}>
            検索結果 ({results.length}件)
          </h4>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}>
            {results.map((result) => (
              <button
                key={result.place_id}
                onClick={() => handleSelectResult(result)}
                style={{
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '11px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#e8f4f8';
                  e.target.style.borderColor = '#3498db';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa';
                  e.target.style.borderColor = '#e0e0e0';
                }}
              >
                <div style={{
                  color: '#2c3e50',
                  fontWeight: 500,
                  marginBottom: '4px',
                }}>
                  {result.display_name}
                </div>
                <div style={{
                  color: '#7f8c8d',
                  fontSize: '10px',
                }}>
                  {result.lat.toFixed(6)}, {result.lon.toFixed(6)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search History */}
      {history.length > 0 && results.length === 0 && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}>
            <h4 style={{
              fontSize: '12px',
              margin: '0',
              color: '#555',
              fontWeight: 600,
            }}>
              検索履歴
            </h4>
            <button
              onClick={handleClearHistory}
              style={{
                padding: '4px 8px',
                backgroundColor: 'transparent',
                color: '#e74c3c',
                border: 'none',
                borderRadius: '3px',
                fontSize: '10px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#fee';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              履歴削除
            </button>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}>
            {history.map((item) => (
              <button
                key={item.place_id}
                onClick={() => handleSelectHistory(item)}
                style={{
                  padding: '8px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '11px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#e8f4f8';
                  e.target.style.borderColor = '#3498db';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa';
                  e.target.style.borderColor = '#e0e0e0';
                }}
              >
                <div style={{
                  color: '#2c3e50',
                  fontWeight: 500,
                  marginBottom: '2px',
                }}>
                  {item.display_name}
                </div>
                <div style={{
                  color: '#95a5a6',
                  fontSize: '10px',
                }}>
                  {new Date(item.searched_at).toLocaleString('ja-JP', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div style={{
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        fontSize: '10px',
        color: '#7f8c8d',
      }}>
        住所を入力して検索すると、地図が移動しWIスコアを表示します。
      </div>
    </div>
  );
};

export default AddressSearch;
