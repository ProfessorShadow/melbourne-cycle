import React from 'react';
import './Chart.css';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);


function Chart({ title }) {
    return (
        <div className="chart">
            <h3>{title}</h3>
            <div className="chart-content">
                { }
            </div>
        </div>
    );
}

export default Chart;
