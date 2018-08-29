import _ from "lodash";
import React from "react";
import agent from "agent";
import Loading from "components/Loading";
import PropTypes from "prop-types";
import Table from "components/Table";
import { stringifyTimestamp } from "utils";

class Lister extends React.Component {
  static defaultProps = {
    mini: false,
    filter: {},
    limit: 20
  };

  static propTypes = {
    mini: PropTypes.bool,
    filter: PropTypes.shape({
      device: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      routine: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    })
  };

  state = {
    body: null
  };

  hasPagination() {
    return !(
      !this.paginationLinkFetchable("next") && !this.paginationLinkFetchable("prev")
    );
  }

  componentWillMount() {
    this.fetch();
  }

  fetch(url) {
    let { props } = this;
    let { filter } = props;

    agent
      .get(url || "/pings")
      .query({
        sort: "desc",
        limit: props.limit
      })
      .use(req => {
        // if we are filtering,
        if (_.has(filter, "device")) {
          req.query({ filter: { deviceId: filter.device } });
        } else {
          req.query({ include: "device" });
        }

        if (_.has(filter, "routine")) {
          req.query({ filter: { routineId: filter.routineId } });
        } else {
          req.query({ include: "routine" });
        }
      })
      .then(res => this.setState({ body: res.body }));
  }

  paginate = linkKey => {
    let link = this.state.body.links[linkKey];
    this.fetch(link);
  };

  paginationLinkFetchable(key) {
    return _.has(this.state.body.links, key) && this.state.body.links[key] !== null;
  }

  render() {
    let { device: filteredDeviceId, routine: filteredRoutineId } = this.props.filter;
    let { body } = this.state;
    let isMini = !!this.props.mini;

    if (body === null) return <Loading />;

    let { data } = body;

    let columns = [
      { label: "ID", src: "@id" },
      {
        label: "RTT",
        src: "@rtt",
        component({ data }) {
          return data === null ? -1 : 1;
        }
      },
      {
        label: "Timestamp",
        src: "@timestamp",
        as: "timestamp",
        component({ timestamp }) {
          return stringifyTimestamp(timestamp);
        },
        skip: isMini
      },
      {
        label: "Status",
        src: "@failed",
        component: ({ data: failed }) =>
          failed ? (
            <span className="tag red">FAIL</span>
          ) : (
            <span className="tag green">SUCCESS</span>
          )
      },
      {
        label: "Device",
        src: ":device",
        component: ({ data: device }) => (
          <React.Fragment>
            <span className="tag purple">
              Device#{device.id}:{device.attributes.name}
            </span>
            <span className="ip-address">{device.attributes.address}</span>
          </React.Fragment>
        ),
        skip: !!filteredDeviceId
      },
      {
        label: "Routine",
        src: ":routine",
        component: ({ data: routine }) => (
          <span className="tag blue">Routine#{routine.id}</span>
        ),
        skip: !!filteredRoutineId
      }
    ];
    return (
      <React.Fragment>
        <div className="region">
          <div className="title">{this.props.title || "Pings"}</div>
          <Table className="content gridded pingtable" columns={columns} body={body} />

          {this.hasPagination() && (
            <div className={"content pagination" + (isMini ? " mini" : "")}>
              <button
                title="Navigate to First Page"
                disabled={!this.paginationLinkFetchable("first")}
                onClick={this.paginate.bind(this, "first")}
              >
                «
              </button>
              <button
                title="Navigate to Previous Page"
                disabled={!this.paginationLinkFetchable("prev")}
                onClick={this.paginate.bind(this, "prev")}
              >
                ‹
              </button>
              <button
                title="Navigate to Next Page"
                disabled={!this.paginationLinkFetchable("next")}
                onClick={this.paginate.bind(this, "next")}
              >
                ›
              </button>
              <button
                title="Navigate to Last Page"
                disabled={!this.paginationLinkFetchable("last")}
                onClick={this.paginate.bind(this, "last")}
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
