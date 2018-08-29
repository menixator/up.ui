import agent from "agent";
import PingList from "components/PingList";
import React, { Component } from "react";

class Dash extends Component {
  state = {
    latestRoutine: null,
    recentRoutines: null,
    doneLoading: false,
    noDevices: false
  };

  async componentWillMount() {
    try {
      let [latestRoutine, recentRoutines] = (await Promise.all(
        [
          "/routines/latest/relationships/pings",
          "/routines?sort=desc&limit=3&offset=1"
        ].map(route =>
          agent
            .get(route)
            .type("json")
            .set("X-Ignore", "yes")
        )
      )).map(res => res.body);

      this.setState({
        latestRoutine,
        recentRoutines,
        doneLoading: true
      });
    } catch (err) {
      let { response: { body } } = err;
      if (body.errors.length === 1 && body.errors[0].status === 404) {
        this.setState({ doneLoading: true, noDevices: true });
      }
    }
  }

  render() {
    let { state } = this;
    let { latestRoutine, recentRoutines } = this.state;

    if (!state.doneLoading) return "Loading";

    if (state.noDevices) {
      return (
        <React.Fragment>
          <div className="region">
            <div className="title">Error: No Devices</div>
            <div className="content">Go add some devices</div>
          </div>
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
        <div className="column right">
          <div className="region">
            <div className="title">Latest Routine</div>
            <div className="content">
              <QuickStats routine={latestRoutine.data} />
            </div>
          </div>

          <PingList mini limit={5} filter={{ routine: latestRoutine.data.id }} />
        </div>

        <div className="column">
          <div className="region">
            <div className="title">Recent Routines</div>

            {recentRoutines.data.map(routine => (
              <div key={routine.id} className="content">
                <QuickStats key={routine.id} routine={routine} />
              </div>
            ))}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

function QuickStats({ routine, title }) {
  return (
    <div className="routine-quickstats">
      {title && <div className="header">{title}</div>}
      <table className="prop-table">
        <tbody>
          <Prop name="id" value={<span className="tag blue">#{routine.id}</span>} />
          <Prop name="Ran at" value={new Date(routine.attributes.timestamp).toString()} />
          <Prop name="Failed Pings" value={routine.meta.failed} />
          <Prop name="Total Pings" value={routine.meta.total} />
          <Prop name="Running" value={(!routine.meta.finished).toString()} />
        </tbody>
      </table>
    </div>
  );
}

function Prop(props) {
  return (
    <tr>
      <td className="name">{props.name}</td>
      <td className="value">{props.value}</td>
    </tr>
  );
}

export default Dash;
