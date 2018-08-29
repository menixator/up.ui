import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";

const BasicColumn = PropTypes.shape({
  label: PropTypes.string.isRequired,
  src: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  key: PropTypes.string,
  skip: PropTypes.bool
});

const ComplexColumn = PropTypes.shape({
  label: PropTypes.string.isRequired,
  src: PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string])
    .isRequired,
  as: PropTypes.string,
  component: PropTypes.node.isRequired,
  skip: PropTypes.bool
});

class Table extends React.Component {
  static propTypes = {
    columns: PropTypes.arrayOf(PropTypes.oneOfType([BasicColumn, ComplexColumn]))
      .isRequired
  };

  static normalizeSource(src) {
    // src can be a function
    if (_.isFunction(src)) {
      return { type: "dynamic", payload: src };
    }

    if (_.isPlainObject(src)) {
      let pojo = {};

      for (let parameterName of src) {
        let parameterSource = src[parameterName];
        pojo[parameterName] = Table.normalizeSource(parameterName);

        if (pojo[parameterName].type === "pojo") {
          throw new Error("nesting inside pojos not allowed");
        }
      }
      return { type: "pojo", payload: pojo };
    }
    let originalSource = src;
    let firstChar = src.slice(0, 1);
    let namespace = src.match(/^([\w\d_-]+)\:/);

    namespace = namespace ? namespace[1] : null;

    src = src.slice(namespace ? namespace.length + 1 : 1);

    switch (true) {
      case firstChar === ":":
      case _.includes(["rel", "relationship", "related"], namespace):
        let [relationship, ...properties] = src.split(".");
        return { type: "resolve", payload: { relationship, properties } };

      case _.includes(["prop", "property"], namespace):
      case firstChar === ".":
        return { type: "property", payload: src };

      case firstChar === "@" || _.includes(["attr", "attribute"], namespace):
        return { type: "attribute", payload: src };
      default:
        if (namespace) {
          throw new Error("illegal namespacing of the source " + namespace);
        }

        return { type: "attribute", payload: originalSource };
    }
  }

  static validateColumns(columns) {
    return []
      .concat(columns)
      .filter(_.isPlainObject)
      .map(column => {
        let { src, label, key, component = null, skip, as = null } = column;
        if (!!skip) return null;

        let reconstructed = { label };

        let newSauce = Table.normalizeSource(src);
        let { sourceType, source } = newSauce;

        // if a component isnt provided, then it is assumed that the
        // source leads to a renderable property.
        // however ,if the source is a pojo, then a a component should
        // be present.
        if (sourceType === "pojo" && component === null) {
          throw new Error("A component is required if the source data is in a POJO");
        }

        reconstructed.src = newSauce;
        reconstructed.key = key || reconstructed.label;
        reconstructed.as = as;

        reconstructed.component = component;
        return reconstructed;
      })
      .filter(v => v !== null);
  }

  static NOT_FOUND = Symbol("not_found");

  static resolveValue(column, row, included) {
    switch (column.src.type) {
      case "attribute":
        if (column.src.payload === "id") {
          return _.get(row, "id", Table.NOT_FOUND);
        }

        return _.get(row, ["attributes", column.src.payload].join("."), Table.NOT_FOUND);

      case "property":
        return _.get(row, column.src.payload, Table.NOT_FOUND);

      case "dynamic":
        return column.src.payload(row, included);

      case "pojo":
        return _.mapValues(column.src.payload, value => Table.resolveValue(value));

      case "resolve":
        let relationship = _.get(
          row,
          ["relationships", column.src.payload.relationship].join("."),
          Table.NOT_FOUND
        );

        if (relationship === Table.NOT_FOUND) return Table.NOT_FOUND;

        if (_.isArray(relationship.data)) {
          let results = _.filter(
            included,
            resource =>
              _.filter(
                relationship.data,
                relationship =>
                  relationship.type === resource.type && resource.id === relationship.id
              ).length > 0
          );

          if (column.src.payload.properties.length === 0) {
            return results;
          }

          return _.map(results, result => {
            return _.get(
              result,
              column.src.payload.properties.join("."),
              Table.NOT_FOUND
            );
          }).filter(v => v !== Table.NOT_FOUND);
        }

        let result = _.find(included, {
          type: relationship.data.type,
          id: relationship.data.id
        });

        if (result) {
          if (column.src.payload.properties.length > 0) {
            return _.get(
              result,
              column.src.payload.properties.join("."),
              Table.NOT_FOUND
            );
          } else {
            return result;
          }
        }
        return Table.NOT_FOUND;
    }
  }

  static generateRow(columns, row, included) {
    return columns.map(column => {
      let value = Table.resolveValue(column, row, included);

      if (value === Table.NOT_FOUND) return <td key={column.key} />;

      if ((_.isArray(value) || _.isPlainObject(value)) && column.component === null) {
        throw new Error("object values require components");
      }

      if (column.component) {
        value = React.createElement(column.component, {
          [column.as ? column.as : "data"]: value
        });
      }

      return <td key={column.key}>{value}</td>;
    });
  }

  render() {
    let { body, columns: passedColumns } = this.props;
    let { data, included = [] } = body;

    // verifiying that `data` is indeed an array
    if (!_.isArray(data)) {
      throw new TypeError("data should be an array");
    }

    let columns = Table.validateColumns(passedColumns);

    let headers = (
      <thead>
        <tr>{columns.map(column => <th key={column.key}>{column.label}</th>)}</tr>
      </thead>
    );

    let tableBody = (
      <tbody>
        {data.map(row => {
          return <tr key={row.id}>{Table.generateRow(columns, row, included)}</tr>;
        })}
      </tbody>
    );
    return (
      <table className={this.props.className}>
        {headers}
        {tableBody}
      </table>
    );
  }
}

export default Table;
