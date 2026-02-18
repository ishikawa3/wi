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

// Shared button style helpers
const btnPrimary = {
  width: '100%',
  padding: '10px 14px',
  backgroundColor: 'var(--accent)',
  color: 'white',
  border: 'none',
  borderRadius: '30px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'var(--transition)',
  boxShadow: 'var(--shadow-btn)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
};

const btnSecondary = {
  width: '100%',
  padding: '9px 14px',
  backgroundColor: 'rgba(0,0,0,0.06)',
  color: 'var(--text-primary)',
  border: '1px solid var(--glass-border)',
  borderRadius: '20px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'var(--transition)',
};

const btnDanger = {
  width: '100%',
  padding: '9px 14px',
  backgroundColor: 'transparent',
  color: 'var(--accent-danger)',
  border: '1px solid var(--accent-danger)',
  borderRadius: '20px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'var(--transition)',
};

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.4px',
};

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

  // Hydrate state from URL on mount
  useEffect(() => {
    const { area, profile, scoreMin, scoreMax, dark } = decodeStateFromURL();
    if (area) setArea(area);
    if (profile) setProfile(profile);
    setWIScoreFilter({ min: scoreMin, max: scoreMax });
    setDarkMode(dark);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync URL when key state changes
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
    queryFn: () => fetchWIGrid({ area: selectedArea, profile: selectedProfile }),
    enabled: Boolean(selectedArea && selectedProfile),
  });

  // Fetch WI grid data for profile 2 (comparison mode)
  const { data: wiGridData2, isLoading: wiData2Loading } = useQuery({
    queryKey: ['wiGrid2', selectedArea, selectedProfile2],
    queryFn: () => fetchWIGrid({ area: selectedArea, profile: selectedProfile2 }),
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
    queryFn: () => fetchAmenities({ area: selectedArea, amenityTypes: selectedAmenityTypes }),
    enabled: Boolean(selectedArea && selectedAmenityTypes.length > 0),
  });

  // Update store when WI data changes
  useEffect(() => {
    if (wiGridData) setWIData(wiGridData);
  }, [wiGridData, setWIData]);

  useEffect(() => {
    if (wiGridData2) setWIData2(wiGridData2);
  }, [wiGridData2, setWIData2]);

  useEffect(() => {
    if (pointData) setPointQueryResult(pointData);
  }, [pointData]);

  const handleMapClick = (lat, lon) => {
    if (selectedArea && selectedProfile) {
      setPointQueryParams({ lat, lon });
    } else {
      alert('エリアとプロファイルを選択してください');
    }
  };

  const customWIMutation = useMutation({
    mutationFn: calculateCustomWI,
    onSuccess: (data) => {
      setWIData(data);
      toggleEditorMode();
    },
    onError: () => {
      alert('カスタムWI計算に失敗しました');
    }
  });

  const handleOpenEditor = async () => {
    if (!selectedProfile) { alert('プロファイルを選択してください'); return; }
    try {
      const defaults = await fetchProfileDefaults(selectedProfile);
      setProfileDefaults(defaults);
      toggleEditorMode();
    } catch {
      alert('プロファイル設定の読み込みに失敗しました');
    }
  };

  const handleApplyCustomProfile = (customProfile) => {
    if (!selectedArea) { alert('エリアを選択してください'); return; }
    customWIMutation.mutate({ area: selectedArea, profileName: customProfile.name, weights: customProfile.weights });
  };

  const handleCancelEditor = () => {
    setProfileDefaults(null);
    toggleEditorMode();
  };

  const handleAddressSelect = ({ lat, lon }) => {
    if (selectedArea && selectedProfile) {
      setPointQueryParams({ lat, lon });
    } else {
      alert('エリアとプロファイルを選択してからもう一度お試しください');
    }
  };

  // Score filter
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

  // Spatial filter
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

      <div className="main-content" style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        <Sidebar darkMode={darkMode}>

          {/* Data selection */}
          <SidebarSection title="データ選択" darkMode={darkMode}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <ComparisonToggle enabled={comparisonMode} onToggle={toggleComparisonMode} />

              <div>
                <label style={labelStyle}>エリア</label>
                <AreaSelector areas={areas || []} selected={selectedArea} onChange={setArea} disabled={areasLoading} />
              </div>

              <div>
                <label style={{ ...labelStyle, color: comparisonMode ? 'var(--accent)' : 'var(--text-secondary)' }}>
                  {comparisonMode ? 'プロファイル 1' : 'プロファイル'}
                </label>
                <ProfileSelector profiles={profiles || []} selected={selectedProfile} onChange={setProfile} disabled={profilesLoading} />
              </div>

              {comparisonMode && (
                <div>
                  <label style={{ ...labelStyle, color: 'var(--accent-danger)' }}>プロファイル 2</label>
                  <ProfileSelector profiles={profiles || []} selected={selectedProfile2} onChange={setProfile2} disabled={profilesLoading} />
                </div>
              )}

              {(wiDataLoading || (comparisonMode && wiData2Loading)) && (
                <div style={{
                  padding: '10px',
                  backgroundColor: 'rgba(0,122,255,0.08)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  color: 'var(--accent)',
                  textAlign: 'center',
                }}>
                  データ読み込み中...
                </div>
              )}

              {!comparisonMode && selectedProfile && !editorMode && (
                <button
                  onClick={handleOpenEditor}
                  style={{ ...btnPrimary, backgroundColor: 'var(--accent-purple)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  <span>✏</span>
                  プロファイルをカスタマイズ
                </button>
              )}
            </div>
          </SidebarSection>

          {/* Profile Editor */}
          {editorMode && !comparisonMode && (
            <SidebarSection title="プロファイルエディタ" darkMode={darkMode}>
              {customWIMutation.isLoading ? (
                <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--accent)' }}>
                  カスタムWIを計算中...
                </div>
              ) : (
                <ProfileEditor baseProfile={profileDefaults} onApply={handleApplyCustomProfile} onCancel={handleCancelEditor} />
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
              <WIScoreFilter min={wiScoreFilter.min} max={wiScoreFilter.max} onChange={setWIScoreFilter} />
            </SidebarSection>
          )}

          {/* Custom Area Clear */}
          {customAreaBounds && !comparisonMode && !editorMode && (
            <SidebarSection darkMode={darkMode}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>カスタムエリア選択中</span>
                <span style={{
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: 600,
                }}>アクティブ</span>
              </div>
              <button onClick={() => setCustomAreaBounds(null)} style={btnDanger}>
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
                <ComparisonModeSelector mode={comparisonDisplayMode} onModeChange={setComparisonDisplayMode} />
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

          {/* Export */}
          {wiData && selectedArea && selectedProfile && !comparisonMode && !editorMode && (
            <>
              <SidebarSection title="エクスポート" darkMode={darkMode}>
                <ExportButtons wiData={wiData} selectedArea={selectedArea} selectedProfile={selectedProfile} />
                <button
                  onClick={handleCopyURL}
                  style={{
                    ...btnSecondary,
                    marginTop: '10px',
                    backgroundColor: urlCopied ? 'var(--accent-success)' : 'var(--accent-purple)',
                    color: 'white',
                    border: 'none',
                    boxShadow: 'var(--shadow-btn)',
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

          {/* Point Query loading */}
          {!comparisonMode && !editorMode && pointDataLoading && (
            <SidebarSection title="地点詳細" darkMode={darkMode}>
              <div style={{
                padding: '12px',
                backgroundColor: 'rgba(0,122,255,0.08)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                color: 'var(--accent)',
                textAlign: 'center',
              }}>
                最寄りグリッド検索中...
              </div>
            </SidebarSection>
          )}

          {/* Point Query Result */}
          {!comparisonMode && !editorMode && pointQueryResult && !pointDataLoading && (
            <SidebarSection title="地点詳細" darkMode={darkMode}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* WI Score display */}
                <div style={{
                  textAlign: 'center',
                  padding: '16px',
                  backgroundColor: 'var(--glass-bg)',
                  backdropFilter: 'var(--glass-blur)',
                  WebkitBackdropFilter: 'var(--glass-blur)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--glass-border)',
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    WI スコア
                  </div>
                  <div style={{ fontSize: '40px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                    {pointQueryResult.wi_score.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>/ 100</div>
                </div>

                {/* Favorite button */}
                {(() => {
                  const isFav = !!findFavoriteByLocation(pointQueryResult.lat, pointQueryResult.lon);
                  return (
                    <button
                      onClick={handleAddFavorite}
                      style={{
                        ...btnSecondary,
                        backgroundColor: isFav ? 'var(--accent-warning)' : 'transparent',
                        color: isFav ? 'white' : 'var(--accent-warning)',
                        border: `1px solid var(--accent-warning)`,
                      }}
                    >
                      {isFav ? '★ お気に入り解除' : '☆ お気に入り登録'}
                    </button>
                  );
                })()}

                {/* Grid ID */}
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>グリッドID</div>
                  <div style={{
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    fontFamily: 'monospace',
                    padding: '8px 10px',
                    backgroundColor: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-xs)',
                    wordBreak: 'break-all',
                  }}>
                    {pointQueryResult.grid_id}
                  </div>
                </div>

                {/* Coordinates */}
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>クリック位置</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
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
                      color: 'var(--text-primary)',
                      marginBottom: '10px',
                      paddingBottom: '8px',
                      borderBottom: '1.5px solid var(--accent)',
                    }}>
                      アメニティ別スコア
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {Object.entries(pointQueryResult.amenity_scores)
                        .sort((a, b) => b[1] - a[1])
                        .map(([name, score]) => {
                          const pct = (score * 100).toFixed(0);
                          return (
                            <div key={name}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{name}</span>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{pct}%</span>
                              </div>
                              <div style={{ height: '6px', backgroundColor: 'var(--glass-border)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                  height: '100%',
                                  width: `${pct}%`,
                                  backgroundColor: 'var(--accent)',
                                  borderRadius: '3px',
                                  transition: 'width 0.4s ease',
                                }} />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Radar Chart */}
                {pointQueryResult.amenity_scores && (
                  <AmenityRadarChart amenityScores={pointQueryResult.amenity_scores} darkMode={darkMode} />
                )}

                {/* Close button */}
                <button
                  onClick={() => { setPointQueryResult(null); setPointQueryParams(null); }}
                  style={btnSecondary}
                >
                  閉じる
                </button>
              </div>
            </SidebarSection>
          )}

          {/* Favorites List */}
          {!comparisonMode && !editorMode && (
            <SidebarSection title="お気に入り" darkMode={darkMode}>
              <FavoritesList favorites={favorites} onRemove={handleRemoveFavorite} onFlyTo={handleFlyToFavorite} darkMode={darkMode} />
            </SidebarSection>
          )}

        </Sidebar>

        {/* Map area */}
        <div className="map-area" style={{ position: 'absolute', inset: 0, isolation: 'isolate' }}>
          {comparisonMode ? (
            selectedArea && selectedProfile && selectedProfile2 ? (
              comparisonDisplayMode === 'difference' ? (
                <DifferenceMapView
                  wiData1={wiData} wiData2={wiData2}
                  profile1Name={profiles?.find(p => p.id === selectedProfile)?.name}
                  profile2Name={profiles?.find(p => p.id === selectedProfile2)?.name}
                  onMapClick={handleMapClick}
                />
              ) : (
                <ComparisonMapView
                  wiData1={wiData} wiData2={wiData2}
                  profile1Name={profiles?.find(p => p.id === selectedProfile)?.name}
                  profile2Name={profiles?.find(p => p.id === selectedProfile2)?.name}
                  onMapClick={handleMapClick}
                />
              )
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100%', backgroundColor: 'var(--page-bg)',
                color: 'var(--text-muted)', fontSize: '16px', fontWeight: 500,
              }}>
                エリアと2つのプロファイルを選択してください
              </div>
            )
          ) : (
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
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100%', backgroundColor: 'var(--page-bg)',
                color: 'var(--text-muted)', fontSize: '16px', fontWeight: 500,
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
