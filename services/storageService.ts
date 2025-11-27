import { NewsItem, StoredCategoryData } from '../types';

const DB_KEY = 'crisis_watch_db_v1';

export const getStoredNews = (categoryId: string): NewsItem[] | null => {
  try {
    const dbStr = localStorage.getItem(DB_KEY);
    if (!dbStr) return null;

    const db: Record<string, StoredCategoryData> = JSON.parse(dbStr);
    const categoryData = db[categoryId];

    if (!categoryData) return null;

    // Optional: expire data after 24 hours if needed, but for now we keep it until refresh
    // const now = Date.now();
    // if (now - categoryData.lastUpdated > 24 * 60 * 60 * 1000) return null;

    return categoryData.items;
  } catch (e) {
    console.error("Database read error", e);
    return null;
  }
};

export const saveNewsToDb = (categoryId: string, items: NewsItem[]) => {
  try {
    const dbStr = localStorage.getItem(DB_KEY);
    const db: Record<string, StoredCategoryData> = dbStr ? JSON.parse(dbStr) : {};

    db[categoryId] = {
      lastUpdated: Date.now(),
      items: items
    };

    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("Database write error", e);
  }
};

export const getLastUpdatedTime = (categoryId: string): string | null => {
    try {
        const dbStr = localStorage.getItem(DB_KEY);
        if (!dbStr) return null;
        const db: Record<string, StoredCategoryData> = JSON.parse(dbStr);
        if (db[categoryId]) {
            return new Date(db[categoryId].lastUpdated).toLocaleString();
        }
        return null;
    } catch (e) {
        return null;
    }
}
