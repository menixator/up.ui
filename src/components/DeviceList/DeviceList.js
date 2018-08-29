import React from "react";
import agent from "agent";

import _ from "lodash";
import { Link } from "react-router-dom";

class Lister extends React.Component {
  state = {
    body: null
  };

  componentWillMount() {
    agent
      .get("/devices")
      .query({ sort: "asc" })
      .then(res => this.setState({ body: res.body }));
  }

  hasPagination() {
    return !(
      !this.paginationLinkFetchable("next") && !this.paginationLinkFetchable("prev")
    );
  }

  fetchNewData(linkKey) {
    let link = this.state.body.links[linkKey];
    this.setState(
      {
        body: null
      },
      function() {
        agent
          .get(link)
          .query({ sort: "asc" })
          .then(res => {
            this.setState({ body: res.body });
          });
      }
    );
  }

  paginationLinkFetchable(key) {
    return _.has(this.state.body.links, key) && this.state.body.links[key] !== null;
  }

  render() {
    let { body } = this.state;
    if (body === null) return "Loading";

    let { data } = body;
    return (
      <React.Fragment>
        <div className="region">
          <div className="title">Devices</div>
          <table className="content gridded">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Address</th>
                <th>Description</th>
                <th>Disabled</th>
              </tr>
            </thead>
            <tbody>
              {data.map(device => (
                <tr key={device.id}>
                  <td>
                    <Link to={"/devices/" + device.id}>#{device.id}</Link>
                  </td>
                  <td> {device.attributes.name}</td>
                  <td> {device.attributes.address}</td>
                  <td> {device.attributes.descr}</td>
                  <td> {device.attributes.disabled ? "YES" : "NO"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {this.hasPagination() && (
            <div className="content pagination">
              <button
                title="Navigate to First Page"
                disabled={!this.paginationLinkFetchable("first")}
                onClick={this.fetchNewData.bind(this, "first")}
              >
                «
              </button>
              <button
                title="Navigate to Previous Page"
                disabled={!this.paginationLinkFetchable("prev")}
                onClick={this.fetchNewData.bind(this, "prev")}
              >
                ‹
              </button>
              <button
                title="Navigate to Next Page"
                disabled={!this.paginationLinkFetchable("next")}
                onClick={this.fetchNewData.bind(this, "next")}
              >
                ›
              </button>
              <button
                title="Navigate to Last Page"
                disabled={!this.paginationLinkFetchable("last")}
                onClick={this.fetchNewData.bind(this, "last")}
              >
                »
              </button>
            </div>
          )}
        </div>
      </React.Fragment>
    );
  }
}

export default Lister;
