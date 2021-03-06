import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Set from './containers/Set';
import FilterPreviewer from './components/FilterPreviewer';

import { generateId } from './utils/genericUtils';
import { buildFilter } from './utils/sqlUtils';
import expressionTemplate from './defaults/expression';

import CalciteThemeProvider, {
  CalciteTheme
} from 'calcite-react/CalciteThemeProvider';

import Panel from 'calcite-react/Panel';
import Button, { ButtonGroup } from 'calcite-react/Button';
import { FormControl, FormControlLabel } from 'calcite-react/Form';
import Tooltip from 'calcite-react/Tooltip';
import PlusIcon from './icons/PlusIcon';

import { isEqual } from 'lodash';

import {
  StyledSetHeaderRow,
  StyledAddSetButton
} from './containers/Set-styled';

class ArcgisFilter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mustMatchAll: true,
      sets: {
        [generateId()]: {
          mustMatchAll: true,
          expressions: {
            [generateId()]: expressionTemplate
          }
        }
      }
    };
  }

  componentDidMount() {
    if (
      this.props &&
      this.props.filterState &&
      !isEqual(this.props.filterState, this.state)
    )
      this.setState({ ...this.props.filterState }, () => {
        this.onChange(this.state);
      });
  }

  componentDidUpdate = (prevProps, prevState) => {
    // check if rehydrating from filterState
    if (
      JSON.stringify(prevProps.filterState) !==
      JSON.stringify(this.props.filterState)
    ) {
      this.setState({ ...this.props.filterState }, () => {
        this.onChange(this.state);
      });
    }
  };

  onChange = state => {
    const filter = buildFilter(state);
    this.props.onChange(filter, state);
  };

  updateSets = sets => {
    this.setState({ sets }, () => {
      this.onChange(this.state);
    });
  };

  handleAddSet = () => {
    const { sets } = this.state;
    sets[generateId()] = {
      mustMatchAll: true,
      expressions: {
        [generateId()]: expressionTemplate
      }
    };
    this.updateSets(sets);
  };

  handleRemoveSet = setId => {
    const { sets } = this.state;
    delete sets[setId];
    this.updateSets(sets);
  };

  handleUpdateSetOperator = (setId, setOperator) => {
    const { sets } = this.state;
    sets[setId].mustMatchAll = setOperator;
    this.updateSets(sets);
  };

  handleAddExpression = setId => {
    const { sets } = this.state;
    sets[setId].expressions[generateId()] = expressionTemplate;
    this.updateSets(sets);
  };

  handleRemoveExpression = (setId, expressionId) => {
    const { sets } = this.state;
    delete sets[setId].expressions[expressionId];
    this.updateSets(sets);
  };

  handleUpdateExpression = (setId, expression) => {
    const { sets } = this.state;
    const currentExpression = sets[setId].expressions[expression.id];
    sets[setId].expressions[expression.id] = {
      ...currentExpression,
      ...expression
    };
    this.updateSets(sets);
  };

  handleUpdateFilterOperator = mustMatchAll => {
    this.setState({ mustMatchAll }, () => {
      this.onChange(this.state);
    });
  };

  getSets = sets => {
    return Object.keys(sets).map(key => {
      const set = sets[key];
      return (
        <Set
          key={key}
          id={key}
          fields={this.props.fields}
          mustMatchAll={set.mustMatchAll}
          expressions={set.expressions}
          disableUnique={this.props.disableUnique}
          updateExpression={this.handleUpdateExpression}
          onFieldChange={this.handleFieldChanged}
          onOperatorChange={this.handleOperatorChanged}
          onValueChange={this.handleValueChanged}
          updateSetOperator={this.handleUpdateSetOperator}
          removeSet={this.handleRemoveSet}
          addExpression={this.handleAddExpression}
          removeExpression={this.handleRemoveExpression}
        />
      );
    });
  };

  render() {
    if (!this.props.fields) {
      return null;
    }

    return (
      <CalciteThemeProvider>
        <Panel white>
          <StyledSetHeaderRow>
            <FormControl horizontal style={{ marginBottom: '5px' }}>
              <FormControlLabel style={{ marginRight: '10px' }}>
                Filter Operator:
              </FormControlLabel>
              <ButtonGroup>
                <Tooltip title="All Expressions Match" enterDelay={400}>
                  <Button
                    extraSmall
                    clear={!this.state.mustMatchAll}
                    onClick={() => this.handleUpdateFilterOperator(true)}
                  >
                    AND
                  </Button>
                </Tooltip>
                <Tooltip title="Any Expressions Match" enterDelay={400}>
                  <Button
                    extraSmall
                    clear={this.state.mustMatchAll}
                    onClick={() => this.handleUpdateFilterOperator(false)}
                  >
                    OR
                  </Button>
                </Tooltip>
              </ButtonGroup>
            </FormControl>
          </StyledSetHeaderRow>
          {this.getSets(this.state.sets)}
          <StyledAddSetButton onClick={this.handleAddSet}>
            <PlusIcon fill={CalciteTheme.palette.gray} /> Add Set
          </StyledAddSetButton>
          <FilterPreviewer
            options={{
              mustMatchAll: this.state.mustMatchAll,
              sets: this.state.sets
            }}
          />
        </Panel>
      </CalciteThemeProvider>
    );
  }
}

ArcgisFilter.propTypes = {
  /** ArcGIS REST API or JSAPI fields definition object. */
  fields: PropTypes.object.isRequired,
  /** Object used to persist/rehydrate the filter */
  filterState: PropTypes.object,
  /** Fired when the filter changes. Receives the filter string as an argument  */
  onChange: PropTypes.func,
  /** Disables the option to pick from unique values. */
  disableUnique: PropTypes.bool
};

ArcgisFilter.defaultProps = {
  disableUnique: false
};

export default ArcgisFilter;
