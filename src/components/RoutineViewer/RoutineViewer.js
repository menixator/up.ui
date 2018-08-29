import React from "react";
import PingList from "components/PingList";
import Loading from "components/Loading";
import agent from "agent";

class RoutineViewer extends React.Component {
  state = { body: null };
  fetch() {
    let routineId = this.props.match.params.routineId;
    agent.get("/routines/" + routineId).then(res => {
      this.setState({ body: res.body });
    });
  }

  componentWillMount() {
    this.fetch();
  }

  render() {
    let routineId = this.props.match.params.routineId;

    if (!this.state.body) {
      return <Loading/>;
    }

    let { body } = this.state;
    let { data } = body;

    return (
      <React.Fragment>
        <div className="row">
          <div className="region routinestats">
            <div className="title">Routine Information</div>
            <div className="content">
              <table className="prop-table">
                <tbody>
                  <tr>
                    <td className="name">ID</td>
                    <td className="value">
                      <span className="tag blue">#{data.id}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="name">Timestamp</td>
                    <td className="value">
                      {new Date(data.attributes.timestamp).toString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="name">Finished</td>
                    <td className="value">
                      {data.attributes.finishedTimestamp !== null ? "Yes" : "No"}
                    </td>
                  </tr>

                  <tr>
                    <td className="name">Failed Pings</td>
                    <td className="value">{data.meta.failed}</td>
                  </tr>

                  <tr>
                    <td className="name">Total Pings</td>
                    <td className="value">{data.meta.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <PingList
            filter={{ routine: routineId }}
            title={"Pings for the Routine#" + routineId}
            limit={15}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default RoutineViewer;
