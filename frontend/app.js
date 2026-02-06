const map = L.map('map').setView([36.86, 31.06], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
}).addTo(map);

const featureLayers = {
    school: L.layerGroup(),
    buffer: L.layerGroup(),
    closed_road: L.layerGroup(),
    road: L.layerGroup(),
    osm: L.layerGroup()
};

Object.values(featureLayers).forEach(layer => layer.addTo(map));

let currentHour = 8;
let schoolCount = 0;
let closedRoadCount = 0;
let openRoadCount = 0;
let isSchoolHours = false;

document.addEventListener('DOMContentLoaded', function () {
    const timeSlider = document.getElementById('time-slider');
    if (timeSlider) {
        timeSlider.addEventListener('input', function (e) {
            currentHour = parseFloat(e.target.value);
            updateTimeDisplay();
            updateTrafficStatus();
            updateAirQuality();
        });
    }
});

function updateTimeDisplay() {
    const hours = Math.floor(currentHour);
    const minutes = (currentHour % 1) * 60;
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    const timeDisplay = document.getElementById('current-time');
    if (timeDisplay) {
        timeDisplay.textContent = timeString;
    }
}

function updateTrafficStatus() {
    const entryBadge = document.getElementById('entry-badge');
    const exitBadge = document.getElementById('exit-badge');
    const statusIndicator = document.getElementById('traffic-status');
    const statusText = document.getElementById('status-text');

    const isEntryTime = currentHour >= 8 && currentHour < 9;
    const isExitTime = currentHour >= 15 && currentHour < 16;

    isSchoolHours = isEntryTime || isExitTime;

    if (entryBadge) {
        if (isEntryTime) {
            entryBadge.classList.add('active');
        } else {
            entryBadge.classList.remove('active');
        }
    }

    if (exitBadge) {
        if (isExitTime) {
            exitBadge.classList.add('active');
        } else {
            exitBadge.classList.remove('active');
        }
    }

    if (statusIndicator && statusText) {
        if (isSchoolHours) {
            statusIndicator.className = 'status-indicator restricted';
            if (isEntryTime) {
                statusText.textContent = 'Okul Giriş Saati - Yollar Kısıtlı';
            } else {
                statusText.textContent = 'Okul Çıkış Saati - Yollar Kısıtlı';
            }
        } else {
            statusIndicator.className = 'status-indicator normal';
            statusText.textContent = 'Normal Trafik - Tüm Yollar Açık';
        }
    }

    updateClosedRoadsVisibility();
    updateStatistics();
}

function updateClosedRoadsVisibility() {
    const closedRoadCheckbox = document.getElementById('filter-closed_road');
    const closedRoadItem = document.getElementById('item-closed_road');

    if (isSchoolHours) {
        featureLayers.closed_road.eachLayer(function (layer) {
            if (layer.setStyle) {
                layer.setStyle({
                    color: '#CC0000',
                    weight: 6,
                    opacity: 1,
                    dashArray: '10, 5'
                });
            }
        });
    } else {
        featureLayers.closed_road.eachLayer(function (layer) {
            if (layer.setStyle) {
                layer.setStyle({
                    color: '#CC0000',
                    weight: 4,
                    opacity: 0.6,
                    dashArray: '10, 5'
                });
            }
        });
    }
}

function updateAirQuality() {
    const aqiValue = document.getElementById('aqi-value');
    const aqiLabel = document.getElementById('aqi-label');
    const airQualityDiv = document.querySelector('.air-quality');

    let aqi, label, bgColor, borderColor, textColor;

    if (isSchoolHours) {
        aqi = Math.floor(25 + Math.random() * 15);
        label = 'Mükemmel - Çok Temiz Hava';
        bgColor = 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)';
        borderColor = '#6ee7b7';
        textColor = '#065f46';
    } else {
        aqi = Math.floor(45 + Math.random() * 20);
        label = 'İyi - Temiz Hava';
        bgColor = 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)';
        borderColor = '#86efac';
        textColor = '#166534';
    }

    if (aqiValue) {
        aqiValue.textContent = aqi;
        aqiValue.style.color = textColor;
    }
    if (aqiLabel) {
        aqiLabel.textContent = label;
        aqiLabel.style.color = textColor;
    }
    if (airQualityDiv) {
        airQualityDiv.style.background = bgColor;
        airQualityDiv.style.borderColor = borderColor;
    }
}

function toggleLayer(layerType) {
    const checkbox = document.getElementById(`filter-${layerType}`);
    const item = document.getElementById(`item-${layerType}`);

    checkbox.checked = !checkbox.checked;

    if (checkbox.checked) {
        featureLayers[layerType].addTo(map);
        item.classList.add('active');
    } else {
        map.removeLayer(featureLayers[layerType]);
        item.classList.remove('active');
    }

    updateStats();
}

function updateStats() {
    const activeLayers = document.querySelectorAll('.filter-item.active').length;
    document.getElementById('active-layers').textContent = activeLayers;
}

async function loadOSMData() {
    try {
        const response = await fetch('../belek_osm_verisi.geojson');
        const data = await response.json();

        L.geoJSON(data, {
            style: function (feature) {
                return {
                    color: '#3388ff',
                    weight: 2,
                    opacity: 0.6
                }
            }
        }).addTo(featureLayers.osm);

        console.log('OSM verileri yüklendi');
    } catch (error) {
        console.error('OSM verisi yükleme hatası:', error);
    }
}

async function loadLowEmissionData() {
    try {
        const response = await fetch('../data/processed/low_emission_simulation.geojson');
        const data = await response.json();

        schoolCount = 0;
        closedRoadCount = 0;
        openRoadCount = 0;

        data.features.forEach(feature => {
            const layerType = feature.properties.layer_type;

            if (layerType === 'school') schoolCount++;
            if (layerType === 'closed_road') closedRoadCount++;
            if (layerType === 'open_road') openRoadCount++;

            let targetLayer;
            if (layerType === 'school') {
                targetLayer = featureLayers.school;
            } else if (layerType === 'buffer') {
                targetLayer = featureLayers.buffer;
            } else if (layerType === 'closed_road') {
                targetLayer = featureLayers.closed_road;
            } else if (layerType === 'road' || layerType === 'highway' || layerType === 'open_road') {
                targetLayer = featureLayers.road;
            } else {
                return;
            }

            L.geoJSON(feature, {
                style: function (f) {
                    const lt = f.properties.layer_type;

                    if (lt === 'school') {
                        return {
                            color: '#FF4444',
                            weight: 2,
                            fillOpacity: 0.6,
                            fillColor: '#FF8888'
                        };
                    } else if (lt === 'buffer') {
                        return {
                            color: '#FFAA00',
                            weight: 2,
                            fillOpacity: 0.4,
                            fillColor: '#FFD700',
                            dashArray: '5, 5'
                        };
                    } else if (lt === 'closed_road') {
                        return {
                            color: '#CC0000',
                            weight: 4,
                            opacity: 0.9,
                            dashArray: '10, 5'
                        };
                    } else if (lt === 'road' || lt === 'highway' || lt === 'open_road') {
                        return {
                            color: '#00AA00',
                            weight: 3,
                            opacity: 0.7
                        };
                    }

                    return { color: '#00AA00', weight: 2, opacity: 0.6 };
                },
                onEachFeature: function (f, layer) {
                    if (f.properties) {
                        let popupContent = `
                            <div style="
                                font-family: 'Inter', sans-serif;
                                min-width: 260px;
                                max-width: 320px;
                            ">`;

                        if (f.properties.name) {
                            popupContent += `
                                <div style="
                                    font-size: 1.2rem;
                                    font-weight: 800;
                                    margin-bottom: 12px;
                                    color: #0f172a;
                                    letter-spacing: -0.5px;
                                    padding-bottom: 10px;
                                    border-bottom: 2px solid #e2e8f0;
                                ">${f.properties.name}</div>`;
                        }

                        if (f.properties.layer_type) {
                            const typeLabels = {
                                'school': 'Okul',
                                'buffer': 'Güvenlik Tamponu',
                                'closed_road': 'Kapalı Yol (Okul Saatlerinde)',
                                'open_road': 'Açık Yol',
                                'road': 'Yol',
                                'highway': 'Anayol'
                            };

                            const typeColors = {
                                'school': 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                                'buffer': 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                'closed_road': 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                                'open_road': 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                                'road': 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                                'highway': 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
                            };

                            popupContent += `
                                <div style="
                                    margin: 10px 0;
                                    padding: 10px 14px;
                                    background: ${typeColors[f.properties.layer_type] || '#f8fafc'};
                                    border-radius: 10px;
                                    font-weight: 600;
                                    font-size: 0.9rem;
                                    border-left: 4px solid #667eea;
                                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                                ">
                                    <span style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Tip</span>
                                    <span style="color: #1e293b;">${typeLabels[f.properties.layer_type] || f.properties.layer_type}</span>
                                </div>`;
                        }

                        if (f.properties.length) {
                            popupContent += `
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    padding: 8px 12px;
                                    margin: 6px 0;
                                    background: white;
                                    border-radius: 8px;
                                    border: 1px solid #e2e8f0;
                                ">
                                    <span style="color: #64748b; font-weight: 500; font-size: 0.85rem;">Uzunluk</span>
                                    <span style="color: #0f172a; font-weight: 700; font-size: 0.95rem;">${Math.round(f.properties.length).toLocaleString('tr-TR')} m</span>
                                </div>`;
                        }

                        if (f.properties.area) {
                            popupContent += `
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    padding: 8px 12px;
                                    margin: 6px 0;
                                    background: white;
                                    border-radius: 8px;
                                    border: 1px solid #e2e8f0;
                                ">
                                    <span style="color: #64748b; font-weight: 500; font-size: 0.85rem;">Alan</span>
                                    <span style="color: #0f172a; font-weight: 700; font-size: 0.95rem;">${Math.round(f.properties.area).toLocaleString('tr-TR')} m²</span>
                                </div>`;
                        }

                        if (f.properties.layer_type === 'closed_road') {
                            popupContent += `
                                <div style="
                                    margin-top: 14px;
                                    padding: 12px 14px;
                                    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
                                    border-left: 4px solid #ef4444;
                                    border-radius: 10px;
                                    font-size: 0.85rem;
                                    box-shadow: 0 2px 6px rgba(239, 68, 68, 0.1);
                                ">
                                    <div style="font-weight: 700; color: #991b1b; margin-bottom: 6px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">⚠ Kısıtlama Saatleri</div>
                                    <div style="color: #7f1d1d; font-weight: 500; line-height: 1.6;">
                                        <div>→ Giriş: <strong>08:00-09:00</strong></div>
                                        <div>→ Çıkış: <strong>15:00-16:00</strong></div>
                                    </div>
                                </div>`;
                        }

                        if (f.properties.layer_type === 'buffer') {
                            popupContent += `
                                <div style="
                                    margin-top: 14px;
                                    padding: 12px 14px;
                                    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                                    border-left: 4px solid #f59e0b;
                                    border-radius: 10px;
                                    font-size: 0.85rem;
                                    color: #78350f;
                                    font-weight: 600;
                                    box-shadow: 0 2px 6px rgba(245, 158, 11, 0.1);
                                ">
                                    🛡️ Okul çevresinde 200m güvenlik bölgesi
                                </div>`;
                        }

                        popupContent += '</div>';
                        layer.bindPopup(popupContent, {
                            maxWidth: 320,
                            className: 'custom-popup'
                        });
                    }
                }
            }).addTo(targetLayer);
        });

        console.log('Düşük emisyon verileri yüklendi');
        console.log(`İstatistikler - Okul: ${schoolCount}, Kapalı Yol: ${closedRoadCount}, Açık Yol: ${openRoadCount}`);

        updateStatistics();
        updateTimeDisplay();
        updateTrafficStatus();
        updateAirQuality();
    } catch (error) {
        console.error('Düşük emisyon verisi yükleme hatası:', error);
    }
}

function updateStatistics() {
    const schoolCountEl = document.getElementById('school-count');
    const closedRoadCountEl = document.getElementById('closed-road-count');
    const openRoadCountEl = document.getElementById('open-road-count');

    if (schoolCountEl) schoolCountEl.textContent = schoolCount;

    if (isSchoolHours) {
        if (closedRoadCountEl) closedRoadCountEl.textContent = closedRoadCount;
        if (openRoadCountEl) openRoadCountEl.textContent = (openRoadCount - closedRoadCount).toLocaleString('tr-TR');
    } else {
        if (closedRoadCountEl) closedRoadCountEl.textContent = '0';
        if (openRoadCountEl) openRoadCountEl.textContent = openRoadCount.toLocaleString('tr-TR');
    }
}

loadOSMData();
loadLowEmissionData();
