import http from 'k6/http';
import { check, sleep } from 'k6';

// --- CONFIGURATION ---
// 1. Replace with your actual Event ID from the database
const EVENT_ID = 'YOUR_EVENT_ID_HERE';

// 2. Supabase Config (from src/lib/supabase.ts)
const SUPABASE_URL = 'https://rqzdgearcsqoxikkbfeo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxemRnZWFyY3Nxb3hpa2tiZmVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjI1NzUsImV4cCI6MjA4MzMzODU3NX0.OcBZUOue5YpeEMieG1c8ORoMKe-9HiH8uqTO6QFTWF0';

export const options = {
    stages: [
        { duration: '1m', target: 100 }, // Ramp up to 100 users over 1 minute
        { duration: '3m', target: 300 }, // Ramp up to 300 users over 3 minutes
        { duration: '1m', target: 500 }, // Peak at 500 users
        { duration: '2m', target: 500 }, // Stay at 500 users
        { duration: '1m', target: 0 },   // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
        http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
    },
};

const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
};

export default function () {
    // Simulate a check-in flow:

    // 1. Fetch attendant by a random code (simulating QR scan)
    // In a real test, you'd want to use a list of valid codes.
    // For this demo, we use a placeholder or random number.
    const randomCode = `TEST-${Math.floor(Math.random() * 1000)}`;

    const resLookup = http.get(
        `${SUPABASE_URL}/rest/v1/attendants?event_id=eq.${EVENT_ID}&code=eq.${randomCode}&select=*`,
        { headers }
    );

    check(resLookup, {
        'lookup status is 200': (r) => r.status === 200,
    });

    // 2. Simulate user thinking/processing (0.5s - 2s)
    sleep(Math.random() * 1.5 + 0.5);

    // 3. Update check-in status (Only if you have a valid ID to test write performance)
    /*
    const payload = JSON.stringify({
      checked_in_at: new Date().toISOString(),
    });
    
    const resUpdate = http.patch(
      `${SUPABASE_URL}/rest/v1/attendants?id=eq.SOME_ATTENDANT_ID`,
      payload,
      { headers }
    );
  
    check(resUpdate, {
      'update status is 204': (r) => r.status === 204,
    });
    */

    sleep(1);
}
