const API_BASE = 'http://localhost:8080/api/municipalities';

export default async function getMunicipalities() {
  const response = await fetch(API_BASE);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
