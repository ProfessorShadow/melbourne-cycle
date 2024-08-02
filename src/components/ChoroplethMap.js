import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import './ChoroplethMap.css';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ChoroplethMap = () => {
    const mapRef = useRef(null);
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [severityData, setSeverityData] = useState(null);
    const [selectedLga, setSelectedLga] = useState('');

    useEffect(() => {
        // Fetch GeoJSON data
        axios.get('http://localhost:5003/api/geojson')
            .then(response => {
                console.log('Fetched GeoJSON data:', response.data);
                setGeoJsonData(response.data);
            })
            .catch(error => {
                console.error('Error fetching GeoJSON data:', error);
            });
    }, []);

    useEffect(() => {
        if (!geoJsonData) return;

        const map = L.map(mapRef.current).setView([-37.8136, 144.9631], 12);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        const getColor = (d) => {
            return d > 100 ? '#800026' :
                d > 200 ? '#BD0026' :
                    d > 150 ? '#E31A1C' :
                        d > 100 ? '#FC4E2A' :
                            d > 50 ? '#FD8D3C' :
                                d > 0 ? '#FEB24C' :
                                    '#FFEDA0';
        };

        const style = (feature) => {
            return {
                fillColor: getColor(feature.properties.Count),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        };

        const onEachFeature = (feature, layer) => {
            const { LGA_NAME, Count } = feature.properties;
            layer.bindPopup(`<strong>LGA Name:</strong> ${LGA_NAME}<br><strong>Number of Accidents:</strong> ${Count}`);
            layer.on({
                click: () => handleLgaClick(LGA_NAME),
                mouseover: (e) => {
                    const layer = e.target;
                    layer.setStyle({
                        weight: 3,
                        color: '#666',
                        dashArray: '',
                        fillOpacity: 0.7
                    });
                },
                mouseout: (e) => {
                    geoJson.resetStyle(e.target);
                }
            });
        };

        const geoJson = L.geoJson(geoJsonData, {
            style,
            onEachFeature
        }).addTo(map);

        // Clean up on unmount
        return () => {
            map.remove();
        };
    }, [geoJsonData]);

    const handleLgaClick = (lgaName) => {
        setSelectedLga(lgaName);
        axios.get(`http://localhost:5003/api/cycling/${lgaName}`)
            .then(response => {
                console.log('Fetched accident severity data:', response.data);
                setSeverityData(response.data);
            })
            .catch(error => {
                console.error('Error fetching accident severity data:', error);
            });
    };

    const getBarChartData = () => {
        if (!severityData) return { labels: [], datasets: [] };

        const labels = Object.keys(severityData);
        const data = Object.values(severityData);

        return {
            labels,
            datasets: [
                {
                    label: 'Number of Accidents',
                    data,
                    backgroundColor: labels.map(label => {
                        switch (label) {
                            case 'Serious injury accident':
                                return 'darkred';
                            case 'Other injury accident':
                                return 'orange';
                            case 'Non-injury accident':
                                return 'lightbrown';
                            default:
                                return 'blue';
                        }
                    })
                }
            ]
        };
    };

    return (
        <div className="accident-data-page">

            <div className="content-section">
                <div className="map-container">
                    <div ref={mapRef} style={{ height: '600px' }}></div>
                </div>
                <div className="charts-container">
                    <div className="chart risk-assessment-chart">
                        <h3>Risk Assessment Of Bicycle Routes</h3>
                        {selectedLga && severityData && (
                            <Bar
                                data={getBarChartData()}
                                options={{
                                    responsive: true,
                                    scales: {
                                        y: {
                                            beginAtZero: true
                                        }
                                    }
                                }}
                            />
                        )}
                    </div>
                    <div className="chart pie-chart">
                        <h3>Description</h3>
                        <img src="/path/to/pie-chart.png" alt="Pie Chart" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChoroplethMap;
