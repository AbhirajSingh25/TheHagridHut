import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";


type User = {
  id?: string | number | null;
  user_id?: string | number | null;
  username?: string;
  name?: string;
  email?: string;
};


type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (
    user: User,
    token: string
  ) => void;

  logout: () => void;
};


const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );


export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [
    user,
    setUser,
  ] =
    useState<User | null>(
      null
    );


  const [
    token,
    setToken,
  ] =
    useState<string | null>(
      null
    );


  const [
    isLoading,
    setIsLoading,
  ] =
    useState(
      true
    );


  useEffect(() => {

    try {

      const savedToken =
        localStorage.getItem(
          "token"
        );


      const savedUser =
        localStorage.getItem(
          "user"
        );


      if (
        savedToken &&
        savedToken.trim().length > 0
      ) {

        setToken(
          savedToken
        );

      }


      if (
        savedUser
      ) {

        try {

          const parsedUser =
            JSON.parse(
              savedUser
            );


          setUser(
            parsedUser
          );

        }

        catch (
          error
        ) {

          console.error(
            "Invalid stored user data:",
            error
          );


          localStorage.removeItem(
            "user"
          );

        }

      }

    }

    catch (
      error
    ) {

      console.error(
        "Unable to restore authentication:",
        error
      );

    }

    finally {

      setIsLoading(
        false
      );

    }

  }, []);


  function login(
    userData: User,
    authToken: string
  ) {

    const cleanToken =
      authToken.trim();


    if (
      !cleanToken
    ) {

      throw new Error(
        "Authentication token is missing."
      );

    }


    localStorage.setItem(
      "token",
      cleanToken
    );


    localStorage.setItem(
      "user",
      JSON.stringify(
        userData
      )
    );


    setToken(
      cleanToken
    );


    setUser(
      userData
    );

  }


  function logout() {

    localStorage.removeItem(
      "token"
    );


    localStorage.removeItem(
      "user"
    );


    localStorage.removeItem(
      "access_token"
    );


    localStorage.removeItem(
      "auth_token"
    );


    setToken(
      null
    );


    setUser(
      null
    );

  }


  return (

    <AuthContext.Provider
      value={{

        user,

        token,

        isAuthenticated:
          Boolean(
            token &&
            token.trim().length > 0
          ),

        isLoading,

        login,

        logout,

      }}
    >

      {children}

    </AuthContext.Provider>

  );

}


export function useAuth() {

  const context =
    useContext(
      AuthContext
    );


  if (
    !context
  ) {

    throw new Error(
      "useAuth must be used inside AuthProvider."
    );

  }


  return context;

}