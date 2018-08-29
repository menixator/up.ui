import React from "react";
import history from "hist";

class ErrorDisplay extends React.Component {
  onClick = ev => {
    history.replace("/", {});
  };
  render() {
    let text = this.props.body.errors[0].title.trim();

    return (
      <React.Fragment>
        <div className="region">
          <div className="title">Error</div>
          <div className="content">{`${text.slice(0, 1).toUpperCase()}${text.slice(
            1
          )}`}</div>
          <div className="controls">
            <button onClick={this.onClick}>Return to Dashboard</button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default ErrorDisplay;
