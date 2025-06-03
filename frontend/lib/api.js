// lib/api.js
export async function fetchScrapeData(payload) {
console.log(payload);
  try {
    const response = await fetch('http://localhost:8000/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Fetch error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching from backend:', error);
    throw error;
  }
}
