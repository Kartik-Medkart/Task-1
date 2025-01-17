import React, { useState, useEffect } from "react";
import CategoryForm from "../../components/CategoryForm";
import { getCategoriesAPI } from "../../services/api"; // Assume this API call is defined

const Category = () => {
  const [showForm, setShowForm] = useState(false);
  const [category, setcategory] = useState([]);

  useEffect(() => {
    const fetchcategory = async () => {
      try {
        const response = await getCategoriesAPI();
        setcategory(response.data);
      } catch (error) {
        console.error("Error fetching category: ", error);
      }
    };

    fetchcategory();
  }, []);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-2 sm:px-6 sm:py-4 lg:max-w-7xl lg:px-8">
        <div className="mb-3 flex justify-between items-center">
          <h2 className="text-2xl font-bold mb-4">Category</h2>
          <button
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-800"
            onClick={() => setShowForm(true)}
          >
            Add Category
          </button>
        </div>

        {showForm && <CategoryForm onClose={() => setShowForm(false)} />}
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {Array.isArray(category) ?
            category.map((category) => (
              <div
                key={category.category_id}
                id={category.category_id}
                className="group p-4 border border-gray-300 rounded-lg"
              >
                <h3 className="text-lg font-medium text-gray-700">
                  {category.name}
                </h3>
              </div>
            )) : (
            <p className="text-lg font-medium text-gray-700">No category Found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;
