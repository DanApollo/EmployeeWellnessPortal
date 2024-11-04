export async function fetchNutritionData(query) {
  const options = {
    method: 'POST',
    url: 'https://trackapi.nutritionix.com/v2/natural/nutrients',
    headers: {
      'Content-Type': 'application/json',
      'x-remote-user-id': 0,
      'x-app-id': '9da94bc2',
      'x-app-key': 'e3157d2d6166db042923db5bbefae141'
    },
    body: JSON.stringify({
      "query": query
    })
  }

  try {
    const response = await fetch(options.url, options);
    if (response.ok) {
      return await response.json()
    } else {
      throw new Error(`Nutritionix API request failed with status ${response.status}`)
    }
  } catch (error) {
    console.error("Error fetching Nutritionix data:", error);
  }
}
