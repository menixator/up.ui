import React from "react";
import agent from "agent";
import { stringifyTimestamp } from "utils";
import { Link } from "react-router-dom";

import _ from "lodash";

class Lister extends React.Component {
  state = {
    body: null
  };

  componentWillMount() {
    agent
      .get("/routines")
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
          <div className="title">Routines</div>
          <table className="content gridded">
            <thead>
              <tr>
                <th>ID</th>
                <th>Start Timestamp</th>
                <th>End Timestamp</th>
                <th>Finished?</th>
              </tr>
            </thead>
            <tbody>
              {data.map(routine => (
                <tr key={routine.id}>
                  <td>
                    <Link to={"/routines/" + routine.id}>#{routine.id}</Link>
                  </td>
                  <td> {stringifyTimestamp(routine.attributes.timestamp)}</td>
                  <td>
                    {routine.attributes.finishedTimestamp &&
                      stringifyTimestamp(routine.attributes.finishedTimestamp)}
                  </td>
                  <td>{routine.attributes.finishedTimestamp !== null ? "Yes" : "No"}</td>
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
