const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Create a connection pool
const pool = new Pool({
  user: 'postgres',
  host: 'database-1.cdm6uyc6ggru.us-east-1.rds.amazonaws.com',
  database: 'postgres',
  password: 'password', // Use your PostgreSQL password
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  },
});

// Lambda handler
exports.handler = async (event) => {
  const path = event.path;
  const httpMethod = event.httpMethod;
  const lgaName = event.pathParameters && event.pathParameters.lgaName;

  if (path === '/api/geojson' && httpMethod === 'GET') {
    return getGeoJsonData();
  } else if (path.startsWith('/api/postgres/') && httpMethod === 'GET' && lgaName) {
    return getSeverityData(lgaName);
  } else {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Not Found' }),
    };
  }
};

const getGeoJsonData = async () => {
  const url = 'https://melbournecyclingd5c933e62dbe4f748dd4f4b6f33d8b1d6a90-dev.s3.amazonaws.com/lga_acc_count.geojson';
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('GeoJSON data sent successfully');
    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (err) {
    console.error('Error fetching GeoJSON file:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' }),
    };
  }
};

const getSeverityData = async (lgaName) => {
  console.log(`Received request for LGA: ${lgaName}`);
  try {
    const result = await pool.query(`
      SELECT severity, "count" as count 
      FROM lga_accidents 
      WHERE lga_name = $1`, [lgaName]);

    console.log('Query result:', result.rows);

    if (result.rows.length === 0) {
      console.log(`No data found for LGA: ${lgaName}`);
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `No data found for LGA: ${lgaName}` }),
      };
    }

    const severityCounts = {
      'Serious injury accident': 0,
      'Other injury accident': 0,
      'Non-injury accident': 0
    };

    result.rows.forEach(row => {
      if (row.severity == 3) {
        severityCounts['Serious injury accident'] += parseInt(row.count, 10);
      } else if (row.severity == 2) {
        severityCounts['Other injury accident'] += parseInt(row.count, 10);
      } else if (row.severity == 1) {
        severityCounts['Non-injury accident'] += parseInt(row.count, 10);
      }
    });

    console.log(`Data for LGA ${lgaName}:`, severityCounts);
    return {
      statusCode: 200,
      body: JSON.stringify(severityCounts),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (error) {
    console.error('Error querying database:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
