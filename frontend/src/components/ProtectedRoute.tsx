import type {
  ReactNode,
} from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

import MainLayout
  from "./MainLayout";


type ProtectedRouteProps = {
  children: ReactNode;
};


function ProtectedRoute({
  children,
}: ProtectedRouteProps) {

  const {
    isAuthenticated,
    isLoading,
  } =
    useAuth();


  const location =
    useLocation();


  if (
    isLoading
  ) {

    return (

      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-[#060912]
          text-sm
          text-slate-400
        "
      >

        Loading HireSense AI...

      </div>

    );

  }


  if (
    !isAuthenticated
  ) {

    return (

      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname,
        }}
      />

    );

  }


  return (

    <MainLayout>

      {children}

    </MainLayout>

  );

}


export default ProtectedRoute;