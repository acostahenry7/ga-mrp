import { createContext, useState } from "react";

const AuthContext = createContext({
  session: {},
  signin: () => {},
  signout: () => {},
});

const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(
    JSON.parse(sessionStorage.getItem("SESSION"))
  );
  const signin = (sessionData) => {
    sessionStorage.setItem("SESSION", JSON.stringify(sessionData));
    setSession(sessionData);
  };

  const signout = () => {
    sessionStorage.removeItem("SESSION");
    setSession(undefined);
  };

  return (
    <AuthContext.Provider value={{ session, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
