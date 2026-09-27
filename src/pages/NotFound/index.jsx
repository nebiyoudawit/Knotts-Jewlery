import React from "react";
import { Link } from "react-router-dom";
import useSeo from "../../hooks/useSeo";
import { notFoundSeo } from "../../seo/pages";

const NotFound = () => {
  useSeo(notFoundSeo());

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <p className="text-sm font-semibold text-[#05B171] mb-2">404</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Page not found</h1>
        <p className="text-gray-600 mb-8">
          We couldn't find that page. It may have moved, or the link may be wrong.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-lg bg-[#05B171] text-white font-medium hover:bg-[#048a5b] transition-colors"
          >
            Go home
          </Link>
          <Link
            to="/products"
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-800 font-medium hover:bg-gray-50 transition-colors"
          >
            Shop jewelry
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
