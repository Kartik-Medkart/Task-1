import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTagsAPI, getCategoriesAPI } from '../services/api'; // Assume these API calls are defined

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
      try {
        const [tagsResponse, categoriesResponse] = await Promise.all([
          getTagsAPI(),
          getCategoriesAPI(),
        ]);
        setTags(tagsResponse.data);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Error fetching data: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  

  return (
    <DataContext.Provider value={{ tags, categories, loading }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  return useContext(DataContext);
};