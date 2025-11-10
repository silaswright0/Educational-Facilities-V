const API_BASE = process.env.REACT_APP_API_URL || '/api/facilities';

export default async function getAllFacilities() {
  const response = await fetch(API_BASE);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
