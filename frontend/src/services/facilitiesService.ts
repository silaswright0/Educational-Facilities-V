const API_BASE = 'http://localhost:8080/api/facilities';

export default async function getAllFacilities() {
  const response = await fetch(API_BASE);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
