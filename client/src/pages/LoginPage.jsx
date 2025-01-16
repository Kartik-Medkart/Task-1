import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUserAPI } from "../services/api"; // Import the loginUserAPI function

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  // Validation Schema using Yup
  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email address").required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await loginUserAPI(values);
      const {data} = response.data;
      login(data.user);
      navigate(from, { replace: true });
    } catch (error) {
      console.error(error);
      setErrors({ submit: "Invalid credentials" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center py-10 bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <Field
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="w-full p-2 border rounded"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <Field
                  name="password"
                  type="password"
                  placeholder="Password"
                  className="w-full p-2 border rounded"
                />
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
              </div>
              <button
                type="submit"
                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
              <ErrorMessage name="submit" component="div" className="text-red-500 text-sm mt-2" />
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default LoginPage;