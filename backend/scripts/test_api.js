const API_URL = 'http://localhost:5001/api';

async function testClassesAPI() {
    try {
        console.log('Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@gyan.edu',
                password: 'admin123'
            })
        });

        if (!loginRes.ok) {
            const errorText = await loginRes.text();
            throw new Error(`Login failed with status ${loginRes.status}: ${errorText}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login successful. Token obtained.');

        console.log('Fetching classes...');
        const classesRes = await fetch(`${API_URL}/classes`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!classesRes.ok) {
            const errorText = await classesRes.text();
            throw new Error(`Classes fetch failed with status ${classesRes.status}: ${errorText}`);
        }

        const classesData = await classesRes.json();
        console.log('Success:', classesData.success);
        console.log('Count:', classesData.count);
        console.log('Data Length:', classesData.data ? classesData.data.length : 'N/A');

    } catch (error) {
        console.error('API Test Failed:', error.message);
    }
}

testClassesAPI();
