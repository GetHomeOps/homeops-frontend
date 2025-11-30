import React, {useState, useEffect, useRef} from "react";
import {Link} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../context/AuthContext";
import "../../i18n";

import AuthImage from "../../images/login_house.png";
import Logo from "../../images/logo-no-bg.png";

function Signin() {
  const navigate = useNavigate();
  const {login, currentUser} = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const justLoggedIn = useRef(false);

  const {t, i18n} = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  // Navigate after successful login when currentUser is available
  useEffect(() => {
    if (justLoggedIn.current && currentUser) {
      if (currentUser.databases && currentUser.databases.length > 0) {
        const dbUrl =
          currentUser.databases[0].url?.replace(/^\/+/, "") ||
          currentUser.databases[0].name;
        navigate(`/${dbUrl}/home`, {replace: true});
      } else {
        navigate("/signin", {replace: true});
      }
      justLoggedIn.current = false;
    }
  }, [currentUser, navigate]);

  /** Handle form submit:
   *
   * Calls login func prop and, if not successful, sets errors.
   */
  async function handleSubmit(evt) {
    evt.preventDefault();
    setIsSubmitting(true);
    try {
      await login(formData);
      justLoggedIn.current = true;
    } catch (err) {
      setFormErrors(err);
      justLoggedIn.current = false;
    } finally {
      setIsSubmitting(false);
    }
  }

  /** Update form data field */
  async function handleChange(evt) {
    const {name, value} = evt.target;
    setFormData((data) => ({
      ...data,
      [name]: value,
    }));
  }

  return (
    <main className="bg-white dark:bg-gray-900">
      <div className="relative md:flex">
        {/* Content */}
        <div className="md:w-1/2">
          <div className="min-h-[100dvh] h-full flex flex-col after:flex-1">
            {/* Header */}
            <div className="flex-1">
              <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link className="block" to="/">
                  <img src={Logo} alt="Logo" className="w-15 h-15" />
                </Link>
              </div>
            </div>

            <div className="max-w-sm mx-auto w-full px-4 py-8">
              <h1 className="text-3xl text-gray-800 dark:text-gray-100 font-bold mb-6">
                {t("welcome")}
              </h1>
              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="email"
                    >
                      {t("emailAddress")}
                    </label>
                    <input
                      id="email"
                      className="form-input w-full"
                      type="email"
                      name="email"
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="password"
                    >
                      {t("password")}
                    </label>
                    <input
                      id="password"
                      className="form-input w-full"
                      type="password"
                      autoComplete="on"
                      name="password"
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <div className="mr-1">
                    <Link
                      className="text-sm underline hover:no-underline"
                      to="/reset-password"
                    >
                      {t("forgotPassword")}
                    </Link>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white ml-3"
                  >
                    {isSubmitting ? t("signingIn") : t("signIn")}
                  </button>
                </div>
              </form>
              {/* Footer */}
              <div className="pt-5 mt-6 border-t border-gray-100 dark:border-gray-700/60">
                <div className="text-sm">
                  {t("noAccount")}{" "}
                  <Link
                    className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
                    to="/signup"
                  >
                    {t("signUp")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image */}
        <div
          className="hidden md:block absolute top-0 bottom-0 right-0 md:w-1/2"
          aria-hidden="true"
        >
          <img
            className="object-cover object-center w-full h-full"
            src={AuthImage}
            width="760"
            height="1024"
            alt="Authentication"
          />
        </div>
      </div>
    </main>
  );
}

export default Signin;
