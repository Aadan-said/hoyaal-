const url = 'https://ythhciygsvlglratazyo.supabase.co/rest/v1/properties?select=*&limit=1';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0aGhjaXlnc3ZsZ2xyYXRhenlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNjg3NzEsImV4cCI6MjA4NDk0NDc3MX0.7qMInt9U4tpG91sMOREOaaIpx64H6QedjLdpqJRQ7AA';

async function checkColumns() {
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${key}`,
                'apikey': key,
                'Prefer': 'count=exact'
            }
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('Error fetching columns:', response.status, text);
            return;
        }

        const data = await response.json();
        if (data.length > 0) {
            console.log('Columns found:', Object.keys(data[0]).join(', '));
        } else {
            console.log('Table is empty, trying rpc or other method...');
        }
    } catch (error) {
        console.error('Script failed:', error);
    }
}

checkColumns();
