import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createCategoryAPI } from '../services/api';
import { toast } from 'react-toastify';

const CatgeoryForm = ({ category, onClose }) => {
  const validationSchema = Yup.object({
    name: Yup.string().required('Category name is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if(values.category_id){
        const response = await updateCategoryAPI(values);
        const { data, success, message } = response;
        if(success){
            toast.success(message);
        }
      }
      const response = await createCategoryAPI(values);
      const { data, success, message } = response;
        if(success){
            toast.success(message);
        }
      setSubmitting(false);
      onClose();
    } catch (error) {
      console.error('Error adding Category: ', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Add New Category</h2>
        <Formik
          initialValues={{ name: category?.name || ''}}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting }) => {
            handleSubmit(values, { setSubmitting });
          }}
        >
          {() => (
            <Form>
              <div className="mb-4">
                <label htmlFor="name" className="block text-lg font-medium text-gray-700">Category Name</label>
                <Field name="name" type="text" className="mt-2 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-lg" />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              <div className="flex justify-end">
                <button type="button" className="mr-4 px-6 py-3 bg-gray-300 text-gray-700 rounded hover:bg-gray-400" onClick={onClose}>Cancel</button>
                <button type="submit" className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600">Submit</button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CatgeoryForm;