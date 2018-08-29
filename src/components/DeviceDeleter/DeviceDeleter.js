import React from "react";
import agent from "agent"
import history from "hist";

class DeviceDeleter extends React.Component {
  render() {
    return (
      <React.Fragment>
        <div className="region">
          <div className="question">Are you sure you want to delete the device?</div>
          <div className="answers">
            <button onClick={this.onYesClick}>Yes</button>
            <button onClick={this.onNoClick}>No</button>
          </div>
        </div>
      </React.Fragment>
    );
  }

  onYesClick = ev => {
    agent
      .delete("/devices/" + this.props.match.params.deviceId)
      .then(res => {
        history.replace("/devices");
      })
  };
  onNoClick = ev => {
    history.replace("/devices");
  };
}
export default DeviceDeleter;
