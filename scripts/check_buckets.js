const url = 'https://ythhciygsvlglratazyo.supabase.co/storage/v1/bucket';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0aGhjaXlnc3ZsZ2xyYXRhenlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNjg3NzEsImV4cCI6MjA4NDk0NDc3MX0.7qMInt9U4tpG91sMOREOaaIpx64H6QedjLdpqJRQ7AA';

async function listBuckets() {
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${key}`,
                'apikey': key
            }
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('Error fetching buckets:', response.status, text);
            return;
        }

        const data = await response.json();
        console.log('Buckets:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Script failed:', error);
    }
}

listBuckets();
