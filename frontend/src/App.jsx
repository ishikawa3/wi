import React, { useEffect, useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import useAppStore from './stores/appStore';
import { fetchProfiles, fetchAreas, fetchWIGrid, fetchWIPoint, fetchAmenities, fetchAmenityTypes, fetchProfileDefaults, calculateCustomWI } from './api/endpoints';

// Layout components
import Header from './components/Layout/Header';
import Sidebar, { SidebarSection } from './components/Layout/Sidebar';

// Control components
import ProfileSelector from './components/Controls/ProfileSelector';
import AreaSelector from './components/Controls/AreaSelector';
import AmenityControl from './components/Controls/AmenityControl';
import ComparisonToggle from './components/Controls/ComparisonToggle';
import ComparisonModeSelector from './components/Controls/ComparisonModeSelector';
import ProfileEditor from './components/Controls/ProfileEditor';
import WIScoreFilter from './components/Controls/WIScoreFilter';

// Map components
import MapView from './components/Map/MapView';
import ComparisonMapView from './components/Map/ComparisonMapView';
import DifferenceMapView from './components/Map/DifferenceMapView';

// Info components
import Legend from './components/InfoPanel/Legend';
import Statistics from './components/InfoPanel/Statistics';
import ComparisonStatistics from './components/InfoPanel/ComparisonStatistics';
import DifferenceStatistics from './components/InfoPanel/DifferenceStatistics';

// Chart components
import WIHistogram from './components/Charts/WIHistogram';
import WIBoxPlot from './components/Charts/WIBoxPlot';
import AmenityRadarChart from './components/Charts/AmenityRadarChart';

// Search components
import AddressSearch from './components/Search/AddressSearch';

// Report components
import PDFReportGenerator from './components/Report/PDFReportGenerator';

// Export components
import ExportButtons from './components/Export/ExportButtons';

// Info panel components
import FavoritesList from './components/InfoPanel/FavoritesList';

// Utils
import { getFavorites, addFavorite, removeFavorite, findFavoriteByLocation } from './utils/favorites';
import { encodeStateToURL, decodeStateFromURL } from './utils/urlState';

// Styles
import './styles/index.css';

function App() {
  const {
    selectedArea,
    selectedProfile,
    selectedProfile2,
    wiData,
    wiData2,
    comparisonMode,
    comparisonDisplayMode,
    editorMode,
    darkMode,
    wiScoreFilter,
    customAreaBounds,
    setArea,
    setProfile,
    setProfile2,
    setWIData,
    setWIData2,
    toggleComparisonMode,
    setComparisonDisplayMode,
    toggleEditorMode,
    toggleDarkMode,
    setDarkMode,
    setWIScoreFilter,
    setCustomAreaBounds,
  } = useAppStore();

  // State for point query
  const [pointQueryParams, setPointQueryParams] = useState(null);
  const [pointQueryResult, setPointQueryResult] = useState(null);

  // Favorites state
  const [favorites, setFavorites] = useState(() => getFavorites());
  const [flyToTarget, setFlyToTarget] = useState(null);
  const refreshFavorites = () => setFavorites(getFavorites());

  const handleAddFavorite = () => {
    if (!pointQueryResult) return;
    const existing = findFavoriteByLocation(pointQueryResult.lat, pointQueryResult.lon);
    if (existing) {
      removeFavorite(existing.id);
    } else {
      addFavorite({
        lat: pointQueryResult.lat,
        lon: pointQueryResult.lon,
        wi_score: pointQueryResult.wi_score,
      });
    }
    refreshFavorites();
  };

  const handleRemoveFavorite = (id) => {
    removeFavorite(id);
    refreshFavorites();
  };

  const handleFlyToFavorite = (fav) => {
    setFlyToTarget({ lat: fav.lat, lon: fav.lon });
    setTimeout(() => setFlyToTarget(null), 500);
  };

  // URL share state
  const [urlCopied, setUrlCopied] = useState(false);
  const handleCopyURL = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    }
  };

  // Hydrate state from URL on mount (Feature 5)
  useEffect(() => {
    const { area, profile, scoreMin, scoreMax, dark } = decodeStateFromURL();
    if (area) setArea(area);
    if (profile) setProfile(profile);
    setWIScoreFilter({ min: scoreMin, max: scoreMax });
    setDarkMode(dark);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync URL when key state changes (Feature 5)
  useEffect(() => {
    const url = encodeStateToURL({ selectedArea, selectedProfile, wiScoreFilter, darkMode });
    window.history.replaceState(null, '', url);
  }, [selectedArea, selectedProfile, wiScoreFilter, darkMode]);

  // Apply dark mode to body
  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // State for amenities
  const [selectedAmenityTypes, setSelectedAmenityTypes] = useState([]);

  // State for profile editor
  const [profileDefaults, setProfileDefaults] = useState(null);

  // Fetch profiles on mount
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: fetchProfiles,
  });

  // Fetch areas on mount
  const { data: areas, isLoading: areasLoading } = useQuery({
    queryKey: ['areas'],
    queryFn: fetchAreas,
  });

  // Fetch WI grid data when area and profile are selected
  const { data: wiGridData, isLoading: wiDataLoading } = useQuery({
    queryKey: ['wiGrid', selectedArea, selectedProfile],
    queryFn: () => fetchWIGrid({
      area: selectedArea,
      profile: selectedProfile,
    }),
    enabled: Boolean(selectedArea && selectedProfile),
  });

  // Fetch WI grid data for profile 2 (comparison mode)
  const { data: wiGridData2, isLoading: wiData2Loading } = useQuery({
    queryKey: ['wiGrid2', selectedArea, selectedProfile2],
    queryFn: () => fetchWIGrid({
      area: selectedArea,
      profile: selectedProfile2,
    }),
    enabled: Boolean(comparisonMode && selectedArea && selectedProfile2),
  });

  // Fetch WI point data when point is clicked
  const { data: pointData, isLoading: pointDataLoading } = useQuery({
    queryKey: ['wiPoint', pointQueryParams?.lat, pointQueryParams?.lon, selectedArea, selectedProfile],
    queryFn: () => fetchWIPoint({
      lat: pointQueryParams.lat,
      lon: pointQueryParams.lon,
      area: selectedArea,
      profile: selectedProfile,
    }),
    enabled: Boolean(pointQueryParams && selectedArea && selectedProfile),
  });

  // Fetch amenity types when area is selected
  const { data: amenityTypesData } = useQuery({
    queryKey: ['amenityTypes', selectedArea],
    queryFn: () => fetchAmenityTypes(selectedArea),
    enabled: Boolean(selectedArea),
  });

  // Fetch amenities data when types are selected
  const { data: amenitiesData } = useQuery({
    queryKey: ['amenities', selectedArea, selectedAmenityTypes],
    queryFn: () => fetchAmenities({
      area: selectedArea,
      amenityTypes: selectedAmenityTypes
    }),
    enabled: Boolean(selectedArea && selectedAmenityTypes.length > 0),
  });

  // Update store when WI data changes
  useEffect(() => {
    if (wiGridData) {
      setWIData(wiGridData);
    }
  }, [wiGridData, setWIData]);

  // Update store when WI data 2 changes (comparison mode)
  useEffect(() => {
    if (wiGridData2) {
      setWIData2(wiGridData2);
    }
  }, [wiGridData2, setWIData2]);

  // Update point query result
  useEffect(() => {
    if (pointData) {
      setPointQueryResult(pointData);
    }
  }, [pointData]);

  // Handler for map click
  const handleMapClick = (lat, lon) => {
    console.log('Map clicked:', { lat, lon });

    if (selectedArea && selectedProfile) {
      setPointQueryParams({ lat, lon });
    } else {
      alert('エリアとプロファイルを選択してください');
    }
  };

  // Custom WI calculation mutation
  const customWIMutation = useMutation({
    mutationFn: calculateCustomWI,
    onSuccess: (data) => {
      console.log('Custom WI calculated:', data);
      setWIData(data);
      toggleEditorMode(); // Close editor after applying
    },
    onError: (error) => {
      console.error('Failed to calculate custom WI:', error);
      alert('カスタムWI計算に失敗しました');
    }
  });

  // Handler for opening profile editor
  const handleOpenEditor = async () => {
    if (!selectedProfile) {
      alert('プロファイルを選択してください');
      return;
    }

    try {
      // Fetch profile defaults
      const defaults = await fetchProfileDefaults(selectedProfile);
      setProfileDefaults(defaults);
      toggleEditorMode();
    } catch (error) {
      console.error('Failed to fetch profile defaults:', error);
      alert('プロファイル設定の読み込みに失敗しました');
    }
  };

  // Handler for applying custom profile
  const handleApplyCustomProfile = (customProfile) => {
    if (!selectedArea) {
      alert('エリアを選択してください');
      return;
    }

    customWIMutation.mutate({
      area: selectedArea,
      profileName: customProfile.name,
      weights: customProfile.weights
    });
  };

  // Handler for canceling editor
  const handleCancelEditor = () => {
    setProfileDefaults(null);
    toggleEditorMode();
  };

  // Handler for address selection
  const handleAddressSelect = ({ lat, lon, address }) => {
    console.log('Address selected:', { lat, lon, address });

    if (selectedArea && selectedProfile) {
      setPointQueryParams({ lat, lon });
    } else {
      alert('エリアとプロファイルを選択してからもう一度お試しください');
    }
  };

  // Filtered WI data by score range (Feature 2)
  const filteredWIData = useMemo(() => {
    if (!wiData) return null;
    const { min, max } = wiScoreFilter;
    if (min === 0 && max === 100) return wiData;
    return {
      ...wiData,
      features: wiData.features.filter(f => {
        const s = f.properties.wi_score ?? 0;
        return s >= min && s <= max;
      }),
    };
  }, [wiData, wiScoreFilter]);

  // Spatially filtered WI data by custom drawn area (Feature 6)
  const spatiallyFilteredWIData = useMemo(() => {
    if (!customAreaBounds || !filteredWIData) return filteredWIData;
    const { minLat, maxLat, minLon, maxLon } = customAreaBounds;
    return {
      ...filteredWIData,
      features: filteredWIData.features.filter(f => {
        const coords = f.geometry?.coordinates?.[0];
        if (!coords) return false;
        const lats = coords.map(c => c[1]);
        const lons = coords.map(c => c[0]);
        const cLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        const cLon = (Math.min(...lons) + Math.max(...lons)) / 2;
        return cLat >= minLat && cLat <= maxLat && cLon >= minLon && cLon <= maxLon;
      }),
    };
  }, [filteredWIData, customAreaBounds]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Header darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

      {/* Main content area */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden'
      }}>
        {/* Sidebar with controls */}
        <Sidebar darkMode={darkMode}>
          {/* Area and Profile Selectors */}
          <SidebarSection title="データ選択" darkMode={darkMode}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* Comparison Mode Toggle */}
              <ComparisonToggle
                enabled={comparisonMode}
                onToggle={toggleComparisonMode}
              />

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#555'
                }}>
                  エリア
                </label>
                <AreaSelector
                  areas={areas || []}
                  selected={selectedArea}
                  onChange={setArea}
                  disabled={areasLoading}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: comparisonMode ? '#3498db' : '#555'
                }}>
                  {comparisonMode ? 'プロファイル 1' : 'プロファイル'}
                </label>
                <ProfileSelector
                  profiles={profiles || []}
                  selected={selectedProfile}
                  onChange={setProfile}
                  disabled={profilesLoading}
                />
              </div>

              {/* Profile 2 selector (comparison mode only) */}
              {comparisonMode && (
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#e74c3c'
                  }}>
                    プロファイル 2
                  </label>
                  <ProfileSelector
                    profiles={profiles || []}
                    selected={selectedProfile2}
                    onChange={setProfile2}
                    disabled={profilesLoading}
                  />
                </div>
              )}

              {(wiDataLoading || (comparisonMode && wiData2Loading)) && (
                <div style={{
                  padding: '10px',
                  backgroundColor: '#e8f4f8',
                  borderRadius: '4px',
                  fontSize: '13px',
                  color: '#2980b9',
                  textAlign: 'center'
                }}>
                  データ読み込み中...
                </div>
              )}

              {/* Customize Button */}
              {!comparisonMode && selectedProfile && !editorMode && (
                <button
                  onClick={handleOpenEditor}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#9b59b6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#8e44ad'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#9b59b6'}
                >
                  <span style={{ fontSize: '16px' }}>✏️</span>
                  プロファイルをカスタマイズ
                </button>
              )}
            </div>
          </SidebarSection>

          {/* Profile Editor */}
          {editorMode && !comparisonMode && (
            <SidebarSection title="プロファイルエディタ" darkMode={darkMode}>
              {customWIMutation.isLoading ? (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  fontSize: '13px',
                  color: '#2980b9'
                }}>
                  カスタムWIを計算中...
                </div>
              ) : (
                <ProfileEditor
                  baseProfile={profileDefaults}
                  onApply={handleApplyCustomProfile}
                  onCancel={handleCancelEditor}
                />
              )}
            </SidebarSection>
          )}

          {/* Address Search */}
          {!editorMode && !comparisonMode && (
            <SidebarSection darkMode={darkMode}>
              <AddressSearch onSelect={handleAddressSelect} />
            </SidebarSection>
          )}

          {/* Score Filter */}
          {wiData && !comparisonMode && !editorMode && (
            <SidebarSection title="スコアフィルター" darkMode={darkMode}>
              <WIScoreFilter
                min={wiScoreFilter.min}
                max={wiScoreFilter.max}
                onChange={setWIScoreFilter}
              />
            </SidebarSection>
          )}

          {/* Custom Area Clear Button */}
          {customAreaBounds && !comparisonMode && !editorMode && (
            <SidebarSection darkMode={darkMode}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
                fontSize: '12px',
                color: darkMode ? '#bdc3c7' : '#555',
              }}>
                <span>カスタムエリア選択中</span>
                <span style={{
                  backgroundColor: '#3498db',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '10px',
                }}>
                  アクティブ
                </span>
              </div>
              <button
                onClick={() => setCustomAreaBounds(null)}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: 'transparent',
                  color: '#e74c3c',
                  border: '1px solid #e74c3c',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                カスタムエリアをクリア
              </button>
            </SidebarSection>
          )}

          {/* Legend */}
          {wiData && !comparisonMode && !editorMode && (
            <SidebarSection title="凡例" darkMode={darkMode}>
              <Legend />
            </SidebarSection>
          )}

          {/* Statistics */}
          {!comparisonMode && !editorMode && wiData?.metadata?.statistics && (
            <SidebarSection title="統計" darkMode={darkMode}>
              <Statistics statistics={wiData.metadata.statistics} />
            </SidebarSection>
          )}

          {/* Charts */}
          {!comparisonMode && !editorMode && wiData && (
            <>
              <SidebarSection title="分布チャート" darkMode={darkMode}>
                <WIHistogram wiData={spatiallyFilteredWIData} />
              </SidebarSection>

              <SidebarSection title="箱ひげ図" darkMode={darkMode}>
                <WIBoxPlot wiData={spatiallyFilteredWIData} width={280} height={200} />
              </SidebarSection>
            </>
          )}

          {/* Comparison Statistics */}
          {comparisonMode && wiData?.metadata?.statistics && wiData2?.metadata?.statistics && (
            <>
              <SidebarSection title="表示モード" darkMode={darkMode}>
                <ComparisonModeSelector
                  mode={comparisonDisplayMode}
                  onModeChange={setComparisonDisplayMode}
                />
              </SidebarSection>

              <SidebarSection title="比較統計" darkMode={darkMode}>
                <ComparisonStatistics
                  stats1={wiData.metadata.statistics}
                  stats2={wiData2.metadata.statistics}
                  profile1Name={profiles?.find(p => p.id === selectedProfile)?.name}
                  profile2Name={profiles?.find(p => p.id === selectedProfile2)?.name}
                />
              </SidebarSection>

              {comparisonDisplayMode === 'difference' && (
                <SidebarSection title="差分統計" darkMode={darkMode}>
                  <DifferenceStatistics
                    wiData1={wiData}
                    wiData2={wiData2}
                    profile1Name={profiles?.find(p => p.id === selectedProfile)?.name}
                    profile2Name={profiles?.find(p => p.id === selectedProfile2)?.name}
                  />
                </SidebarSection>
              )}
            </>
          )}

          {/* Export Buttons */}
          {wiData && selectedArea && selectedProfile && !comparisonMode && !editorMode && (
            <>
              <SidebarSection title="エクスポート" darkMode={darkMode}>
                <ExportButtons
                  wiData={wiData}
                  selectedArea={selectedArea}
                  selectedProfile={selectedProfile}
                />
                {/* URL Share Button */}
                <button
                  onClick={handleCopyURL}
                  style={{
                    marginTop: '10px',
                    width: '100%',
                    padding: '8px',
                    backgroundColor: urlCopied ? '#27ae60' : '#8e44ad',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background-color 0.3s',
                  }}
                >
                  {urlCopied ? 'コピーしました！' : 'URLをコピー (共有)'}
                </button>
              </SidebarSection>

              <SidebarSection title="PDFレポート" darkMode={darkMode}>
                <PDFReportGenerator
                  wiData={wiData}
                  areaName={areas?.find(a => a.id === selectedArea)?.name || selectedArea}
                  profileName={profiles?.find(p => p.id === selectedProfile)?.name || selectedProfile}
                />
              </SidebarSection>
            </>
          )}

          {/* Amenity Control */}
          {!comparisonMode && !editorMode && selectedArea && amenityTypesData?.types && (
            <SidebarSection title="アメニティ表示" darkMode={darkMode}>
              <AmenityControl
                availableTypes={amenityTypesData.types}
                selectedTypes={selectedAmenityTypes}
                onToggle={setSelectedAmenityTypes}
              />
            </SidebarSection>
          )}

          {/* Point Query Result */}
          {!comparisonMode && !editorMode && pointDataLoading && (
            <SidebarSection title="地点詳細" darkMode={darkMode}>
              <div style={{
                padding: '10px',
                backgroundColor: '#e8f4f8',
                borderRadius: '4px',
                fontSize: '13px',
                color: '#2980b9',
                textAlign: 'center'
              }}>
                最寄りグリッド検索中...
              </div>
            </SidebarSection>
          )}

          {!comparisonMode && !editorMode && pointQueryResult && !pointDataLoading && (
            <SidebarSection title="地点詳細" darkMode={darkMode}>
              <div style={{
                padding: '15px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                {/* WI Score - Large display */}
                <div style={{
                  textAlign: 'center',
                  marginBottom: '15px',
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#7f8c8d',
                    marginBottom: '5px'
                  }}>
                    WI スコア
                  </div>
                  <div style={{
                    fontSize: '36px',
                    fontWeight: 700,
                    color: '#2c3e50'
                  }}>
                    {pointQueryResult.wi_score.toFixed(1)}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#95a5a6',
                    marginTop: '5px'
                  }}>
                    / 100
                  </div>
                </div>

                {/* Favorite toggle button */}
                {(() => {
                  const isFav = !!findFavoriteByLocation(pointQueryResult.lat, pointQueryResult.lon);
                  return (
                    <button
                      onClick={handleAddFavorite}
                      style={{
                        width: '100%',
                        padding: '8px',
                        marginBottom: '15px',
                        backgroundColor: isFav ? '#f39c12' : 'transparent',
                        color: isFav ? 'white' : '#f39c12',
                        border: `1px solid #f39c12`,
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {isFav ? '★ お気に入り解除' : '☆ お気に入り登録'}
                    </button>
                  );
                })()}

                {/* Grid Info */}
                <div style={{ marginBottom: '15px' }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#7f8c8d',
                    marginBottom: '5px'
                  }}>
                    グリッドID
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#2c3e50',
                    fontFamily: 'monospace',
                    padding: '8px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    wordBreak: 'break-all'
                  }}>
                    {pointQueryResult.grid_id}
                  </div>
                </div>

                {/* Coordinates */}
                <div style={{ marginBottom: '15px' }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#7f8c8d',
                    marginBottom: '5px'
                  }}>
                    クリック位置
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#2c3e50',
                    fontFamily: 'monospace'
                  }}>
                    緯度: {pointQueryResult.lat.toFixed(6)}<br />
                    経度: {pointQueryResult.lon.toFixed(6)}
                  </div>
                </div>

                {/* Amenity Scores */}
                {pointQueryResult.amenity_scores && (
                  <div>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#2c3e50',
                      marginBottom: '10px',
                      paddingBottom: '8px',
                      borderBottom: '2px solid #3498db'
                    }}>
                      アメニティ別スコア
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {Object.entries(pointQueryResult.amenity_scores)
                        .sort((a, b) => b[1] - a[1])
                        .map(([name, score]) => {
                          const percentage = (score * 100).toFixed(0);
                          return (
                            <div key={name} style={{ marginBottom: '5px' }}>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '4px',
                                fontSize: '12px'
                              }}>
                                <span style={{ color: '#555' }}>{name}</span>
                                <span style={{ fontWeight: 600, color: '#2c3e50' }}>
                                  {percentage}%
                                </span>
                              </div>
                              <div style={{
                                height: '8px',
                                backgroundColor: '#e0e0e0',
                                borderRadius: '4px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  height: '100%',
                                  width: `${percentage}%`,
                                  backgroundColor: '#3498db',
                                  transition: 'width 0.3s ease'
                                }} />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Amenity Radar Chart */}
                {pointQueryResult.amenity_scores && (
                  <AmenityRadarChart amenityScores={pointQueryResult.amenity_scores} />
                )}

                {/* Close button */}
                <button
                  onClick={() => {
                    setPointQueryResult(null);
                    setPointQueryParams(null);
                  }}
                  style={{
                    marginTop: '15px',
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#7f8c8d'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#95a5a6'}
                >
                  閉じる
                </button>
              </div>
            </SidebarSection>
          )}

          {/* Favorites List */}
          {!comparisonMode && !editorMode && (
            <SidebarSection title="お気に入り" darkMode={darkMode}>
              <FavoritesList
                favorites={favorites}
                onRemove={handleRemoveFavorite}
                onFlyTo={handleFlyToFavorite}
                darkMode={darkMode}
              />
            </SidebarSection>
          )}
        </Sidebar>

        {/* Map area */}
        <div style={{ flex: 1, position: 'relative' }}>
          {comparisonMode ? (
            // Comparison mode - show side by side or difference view
            selectedArea && selectedProfile && selectedProfile2 ? (
              comparisonDisplayMode === 'difference' ? (
                <DifferenceMapView
                  wiData1={wiData}
                  wiData2={wiData2}
                  profile1Name={profiles?.find(p => p.id === selectedProfile)?.name}
                  profile2Name={profiles?.find(p => p.id === selectedProfile2)?.name}
                  onMapClick={handleMapClick}
                />
              ) : (
                <ComparisonMapView
                  wiData1={wiData}
                  wiData2={wiData2}
                  profile1Name={profiles?.find(p => p.id === selectedProfile)?.name}
                  profile2Name={profiles?.find(p => p.id === selectedProfile2)?.name}
                  onMapClick={handleMapClick}
                />
              )
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                backgroundColor: '#ecf0f1',
                color: '#7f8c8d',
                fontSize: '18px',
                fontWeight: 500
              }}>
                エリアと2つのプロファイルを選択してください
              </div>
            )
          ) : (
            // Single mode - show one map
            selectedArea && selectedProfile ? (
              <MapView
                wiData={spatiallyFilteredWIData}
                amenitiesData={amenitiesData}
                onMapClick={handleMapClick}
                darkMode={darkMode}
                favorites={favorites}
                flyToTarget={flyToTarget}
                onRemoveFavorite={handleRemoveFavorite}
                customAreaBounds={customAreaBounds}
                onDrawComplete={setCustomAreaBounds}
              />
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                backgroundColor: '#ecf0f1',
                color: '#7f8c8d',
                fontSize: '18px',
                fontWeight: 500
              }}>
                エリアとプロファイルを選択してください
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
