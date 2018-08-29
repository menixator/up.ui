import React from "react";
import agent from "agent";
import _ from "lodash";
import history from "hist";

class DeviceAdd extends React.Component {
  constructor(props) {
    super(props);

    if (this.props.id) {
      if (this.props.data) {
        _.extend(this.state, {
          contentFetchedForEditing: true,
          fetchedContent: this.props.data
        });
      } else {
        _.extend(this.state, { formDisabled: true });
      }
    }
  }

  state = {
    name: "",
    address: "",
    descr: "",
    disabled: false,
    messages: [],
    submittable: false,
    formDisabled: false,
    contentFetchedForEditing: false,
    fetchedContent: null
  };

  componentWillMount() {
    if (!this.contentFetchedForEditing && this.props.id) {
      return agent.get("/devices/" + this.props.id).then(res => {
        this.applyFetchedContentToForm(res.body.data);
      });
    }
    return this.props.id && this.applyFetchedContentToForm(this.state.fetchedContent);
  }

  applyFetchedContentToForm(data) {
    let { name, address, descr, disabled } = data.attributes;
    this.setState({
      name,
      address,
      descr: descr || "",
      disabled: disabled === 1,
      contentFetchedForEditing: true,
      formDisabled: false
    });
  }
  canSubmit() {
    let { name, address } = this.state;

    if (name === null || name.trim().length === 0) {
      return "Name cant be empty";
    }

    if (address === null || address.trim().length === 0) {
      return "Address cant be empty";
    }

    if (!address.match(/^(\d{1,3}\.){3}(\d{1,3})$/)) {
      return "Address doesnt seem to be an IPv4 address";
    }

    let addressSplit = address.split(".").map(v => parseInt(v, 10));

    if (
      addressSplit.filter((octet, idx) => (idx === 0 && octet <= 0) || octet >= 256)
        .length > 0
    ) {
      return "Invalid octets";
    }

    return true;
  }

  updateSubmittableState = () => {
    if (this._debouncer) clearTimeout(this._debouncer);
    this._debouncer = null;

    this._debouncer = setTimeout(this.updateSubmittableStateDebounced, 500);
  };

  updateSubmittableStateDebounced = () => {
    let canSubmit = this.canSubmit();
    if (canSubmit === true) {
      this.setState({ messages: [], submittable: true });
    } else {
      this.setState({ messages: [canSubmit], submittable: false });
    }
    return canSubmit;
  };

  formStateChange(newState) {
    this.setState(newState, this.updateSubmittableState);
  }

  onInputComponentChange = (stateKey, ev) => {
    return ev => {
      this.formStateChange({ [stateKey]: ev.target.value });
    };
  };

  onDisabledChange = ev => {
    this.formStateChange({ disabled: ev.target.checked });
  };

  render() {
    let {
      name,
      address,
      descr,
      disabled,
      submittable,
      messages,
      formDisabled
    } = this.state;
    return (
      <div className="region">
        <div className="title">
          {this.props.id ? "Editing Device #" + this.props.id : "Add A New Device"}
        </div>
        <div className="content form">
          <table className="formTable">
            <tbody>
              <tr>
                <td>
                  <label htmlFor="device_name">Name</label>
                </td>
                <td>
                  <input
                    disabled={formDisabled}
                    id="device_name"
                    type="text"
                    value={name}
                    onChange={this.onInputComponentChange("name")}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <label htmlFor="device_address">IP Address</label>
                </td>
                <td>
                  <input
                    disabled={formDisabled}
                    id="device_address"
                    type="text"
                    value={address}
                    onChange={this.onInputComponentChange("address")}
                  />
                </td>
              </tr>

              <tr>
                <td>
                  <label htmlFor="device_descr">Description</label>
                </td>
                <td>
                  <textarea
                    disabled={formDisabled}
                    id="device_descr"
                    value={descr}
                    onChange={this.onInputComponentChange("descr")}
                  />
                </td>
              </tr>

              <tr>
                <td>
                  <label htmlFor="device_disabled">Disabled</label>
                </td>
                <td>
                  <input
                    disabled={formDisabled}
                    type="checkbox"
                    id="device_disabled"
                    checked={disabled}
                    onChange={this.onDisabledChange}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {messages.length > 0 && (
          <div className="content messages">
            {messages.map((message, key) => (
              <div className="formMessage" key={key}>
                <span className="tag red">ERROR</span>
                {message}
              </div>
            ))}
          </div>
        )}
        <div className="controls">
          <button disabled={formDisabled || !submittable} onClick={this.onSubmit}>
            Okay
          </button>
        </div>
      </div>
    );
  }

  onSubmit = ev => {
    if (this._debouncer !== null) {
      clearTimeout(this._debouncer);
      this._debouncer = null;

      let canSubmit = this.updateSubmittableStateDebounced();

      if (canSubmit !== true) {
        return false;
      }
    }

    let body = this.convertStateToRequestBody();

    this.setState({ formDisabled: true, messages: [] }, function() {
      let method = this.props.id ? "patch" : "put";
      agent[method]("/devices" + (method === "put" ? "" : `/${this.props.id}`))
        .type("json")
        .set("X-Ignore", "yes")
        .send(body)
        .then(res => {
          history.replace("/devices/" + res.body.data.id);
        })
        .catch(err => {
          this.setState({
            messages: err.response.body.errors.map(err => err.title),
            submittable: true,
            formDisabled: false
          });
        });
    });
  };

  convertStateToRequestBody() {
    let { name, address, descr, disabled } = this.state;
    return {
      name: name.trim(),
      address: address
        .trim()
        .split(".")
        .map(v => parseInt(v, 10))
        .join("."),
      descr: descr === null ? descr : descr.trim(),
      disabled: disabled
    };
  }
}

export default DeviceAdd;
