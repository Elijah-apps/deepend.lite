// supabase/config.js
// This file will hold your Supabase configuration.
// Replace with your actual Supabase URL and Anon Key.

const SUPABASE_URL = 'https://lskxvqpvjfkakyxandao.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxza3h2cXB2amZrYWt5eGFuZGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjgzMzgsImV4cCI6MjA3MjA0NDMzOH0.cBsjbldCMunuQ5xLsjTlepjWEaGXZ1brvGz4kEXbOFo';

export { SUPABASE_URL, SUPABASE_ANON_KEY };

// Example of how to use axios with Supabase:
/*
import axios from 'axios';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const supabase = axios.create({
  baseURL: `${SUPABASE_URL}/rest/v1`,
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal' // Or 'return=representation' for data back
  }
});

// Example usage:
async function fetchData() {
  try {
    const { data, error } = await supabase.get('/your_table_name');
    if (error) throw error;
    console.log(data);
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
}

// fetchData();
*/
