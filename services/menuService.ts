
import { type MenuItem } from '../types';
import { CSV_URL } from '../constants';

const parseCSV = (csvText: string): MenuItem[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(header => header.trim());
    const data: MenuItem[] = [];

    const nameIndex = headers.indexOf('name');
    const descriptionIndex = headers.indexOf('description');
    const priceIndex = headers.indexOf('price');
    const categoryIndex = headers.indexOf('category');
    const imageUrlIndex = headers.indexOf('image_url');
    let idIndex = headers.indexOf('id');
    
    // Fallback if 'id' column doesn't exist
    if (idIndex === -1) {
      headers.push('id');
      idIndex = headers.length - 1;
    }


    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(value => value.trim());
        if (values.length < headers.length - 1 && values.length !== headers.length) continue;

        const id = values[idIndex] || crypto.randomUUID();
        const name = values[nameIndex] || 'No Name';
        const description = values[descriptionIndex] || '';
        const price = parseFloat(values[priceIndex]) || 0;
        const category = values[categoryIndex] || 'Uncategorized';
        const image_url = values[imageUrlIndex] || '';

        data.push({ id, name, description, price, category, image_url });
    }
    return data;
};

export const fetchMenuData = async (): Promise<{ menu: MenuItem[]; categories: string[] }> => {
    try {
        const response = await fetch(CSV_URL);
        if (!response.ok) {
            throw new Error(`Error loading data: ${response.statusText || 'Network response was not ok'}`);
        }
        const csvText = await response.text();
        const menu = parseCSV(csvText);
        
        if(menu.length === 0){
             throw new Error('Menu data is empty or could not be parsed. Please check the Google Sheet format.');
        }

        const categories = [...new Set(menu.map(item => item.category))].filter(Boolean).sort();
        
        return { menu, categories };
    } catch (error) {
        console.error("Failed to fetch menu data:", error);
        throw error;
    }
};
