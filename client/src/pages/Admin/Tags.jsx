import React, { useState, useEffect } from "react";
import TagForm from "../../components/TagForm";
import { getTagsAPI } from "../../services/api"; // Assume this API call is defined

const Tags = () => {
  const [showForm, setShowForm] = useState(false);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await getTagsAPI();
        setTags(response.data);
      } catch (error) {
        console.error("Error fetching tags: ", error);
      }
    };

    fetchTags();
  }, [showForm]);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-2 sm:px-6 sm:py-4 lg:max-w-7xl lg:px-8">
        <div className="mb-3 flex justify-between items-center">
          <h2 className="text-2xl font-bold mb-4">Tags</h2>
          <button
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-800"
            onClick={() => setShowForm(true)}
          >
            Add Tag
          </button>
        </div>

        {showForm && <TagForm tag={selectedTag} onClose={() => {setSelectedTag(null); setShowForm(false)}} />}
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {Array.isArray(tags) ?
            tags.map((tag) => (
              <div
                key={tag.tag_id}
                className="group p-4 border border-gray-300 rounded-lg"
                onClick={() => {
                  setShowForm(true)
                  setSelectedTag(tag)
                }}
              >
                <h3 className="text-lg font-medium text-gray-700">
                  {tag.name}
                </h3>
              </div>
            )) : (
            <p className="text-lg font-medium text-gray-700">No Tags Found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tags;
