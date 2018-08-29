import "vanity/main.css";
import React from "react";
import Dash from "components/Dash";
import DeviceEditor from "components/DeviceEditor";
import DeviceList from "components/DeviceList";
import PingList from "components/PingList";
import RoutineList from "components/RoutineList";
import Navbar from "components/Navbar";
import DeviceViewer from "components/DeviceViewer";
import DeviceDeleter from "components/DeviceDeleter";
import RoutineViewer from "components/RoutineViewer";
import ErrorDisplay from "components/ErrorDisplay";
import Table from "components/Table";
import { Route, Switch, Redirect, withRouter } from "react-router-dom";

function App(props) {
  if (props.location.state && props.location.state.error === true) {
    return <ErrorDisplay body={props.location.state.body} />;
  }

  return (
    <React.Fragment>
      <Navbar />
      <div id="viewable">
        <Switch>
          <Route path="/" exact>
            <Dash />
          </Route>
          <Route path="/devices" exact>
            <DeviceList />
          </Route>
          <Route path="/pings" exact route>
            <PingList />
          </Route>
          <Route path="/devices/add" exact>
            <DeviceEditor />
          </Route>
          <Route path="/devices/:deviceId" exact component={DeviceViewer} />
          <Route path="/devices/:deviceId/delete" exact component={DeviceDeleter} />

          <Route
            path="/devices/:deviceId/edit"
            exact
            render={props => {
              return <DeviceEditor id={parseInt(props.match.params.deviceId, 10)} />;
            }}
          />
          <Route path="/routines" exact>
            <RoutineList />
          </Route>
          <Route path="/routines/:routineId" exact component={RoutineViewer} />
          <Route>
            <Redirect to="/" />
          </Route>
        </Switch>
      </div>
    </React.Fragment>
  );
}

export default withRouter(App);
