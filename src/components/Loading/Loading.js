import React from "react";

import PropTypes from "prop-types";

export class Loading extends React.Component {
  render() {
    return (
      <div className="region">
        <div className="content">
          <div className=" loading">Loading</div>
        </div>
      </div>
    );
  }
}
export default Loading;
