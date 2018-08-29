import React from "react";
import { NavLink, Switch, Route } from "react-router-dom";

function Navbar(props) {
  return (
    <nav>
      <ul>
        <li>
          <NavLink exact to="/">
            Home
          </NavLink>
        </li>
        <li>
          <NavLink exact to="/routines">
            Routines
          </NavLink>
        </li>
        <li>
          <NavLink exact to="/pings">
            Pings
          </NavLink>
        </li>
        <li>
          <NavLink exact to="/devices">
            Devices
          </NavLink>
        </li>
      </ul>

      <ul>
        <Switch>
          <Route path="/devices">
            <li>
              <NavLink exact to="/devices/add">
                Add new device
              </NavLink>
            </li>
          </Route>
        </Switch>
      </ul>
    </nav>
  );
}

export default Navbar;
