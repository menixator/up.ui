import React from "react";
import agent from "agent";
import history from "hist";
import PingList from "components/PingList";

class DeviceViewer extends React.Component {
  state = { body: null };
  componentWillMount() {
    this.loadInformation();
  }

  loadInformation() {
    let deviceId = this.props.match.params.deviceId;
    this.setState({ body: null }, function() {
      agent.get("/devices/" + deviceId).then(res => {
        this.setState({ body: res.body });
      });
    });
  }

  render() {
    let { body } = this.state;

    if (body === null) return "Loading";

    let { data } = body;

    return (
      <React.Fragment>
        <div className="row">
          <div className="region deviceinfo">
            <div className="title">Device Information</div>
            <div className="content">
              <table className="prop-table">
                <tbody>
                  <tr>
                    <td className="name">ID</td>
                    <td className="value">
                      <span className="tag purple">#{data.id}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="name">Name</td>
                    <td className="value">{data.attributes.name}</td>
                  </tr>
                  <tr>
                    <td className="name">Address</td>
                    <td className="value">
                      <span className="ip-address">{data.attributes.address}</span>
                    </td>
                  </tr>

                  <tr>
                    <td className="name">Disabled</td>
                    <td className="value">
                      {data.attributes.disabled ? (
                        <span className="tag red">YES</span>
                      ) : (
                        <span className="tag green">NO</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="actions">
              <button onClick={this.onDeleteClick}>Delete This Device</button>
              <button onClick={this.onEditClick}>Edit This Device</button>
            </div>
          </div>
          <PingList
            title={"Pings to " + data.attributes.name}
            limit={10}
            deviceId={this.props.match.params.deviceId}
          />
        </div>
      </React.Fragment>
    );
  }

  onDeleteClick = ev => {
    history.push("/devices/" + this.props.match.params.deviceId + "/delete");
  };

  onEditClick = ev => {
    history.push("/devices/" + this.props.match.params.deviceId + "/edit");
  };
}

export default DeviceViewer;
