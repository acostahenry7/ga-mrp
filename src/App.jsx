import Home from "./screens/Home";
import Login from "./screens/Login";
import Nav from "./components/Nav";
import useAuth from "./hooks/useAuth";
import { getCompanyNameBySchema } from "./helpers/uiFormat";
import { BrowserRouter, Routes, Route } from "react-router";
import "./App.css";
import Configuration from "./screens/Configuration";
import Brands from "./screens/Brands";

function App() {
  const { session } = useAuth();

  if (!session) {
    return <Login />;
  }

  return (
    <div className="padding-wide overflow-hidden" style={{ zoom: "95%" }}>
      <BrowserRouter>
        <Nav
          companyName={getCompanyNameBySchema(session.userData.companyDB)}
          userName={session.userData.UserName}
        />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Configuration />} />
          <Route path="/settings/brands" element={<Brands />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
