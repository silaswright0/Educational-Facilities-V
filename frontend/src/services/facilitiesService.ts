// FIRST API_BASE IS FOR DEPLOYMENT
// SECOND API_BASE IS FOR LOCAL TESTING

const API_BASE = process.env.REACT_APP_API_URL || '/api/facilities';
// const API_BASE = 'http://localhost:8080/api/facilities';

export default async function getAllFacilities() {
  const response = await fetch(API_BASE);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function getFacilitiesByProvince(province: string) {
  const url = `${API_BASE}/province/${province}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
