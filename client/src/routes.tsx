import { Route, Routes } from "react-router";

import { Home } from "./pages/Home";
import { Room } from "./pages/Room";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/room/:room" element={<Room />} />
    </Routes>
  );
}
