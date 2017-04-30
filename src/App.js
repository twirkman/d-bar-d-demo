import React, { Component } from 'react';
import logo from './logo.png';
import './App.css';
import Rendering from './Rendering';

const roofPitches = {
  THREE: 0,
  FOUR: 1,
  FIVE: 2,
  SIX: 3,
  SEVEN: 4,
  EIGHT: 5,
};

const doorTypes = {
  SLIDING: 0,
  OVERHEAD: 1,
  WALK_IN: 2,
};

const doorWalls = {
  FRONT: 0,
  BACK: 1,
  RIGHT: 2,
  LEFT: 3,
};

const doorSizes = {
  SMALL: 0,
  MEDIUM: 1,
  LARGE: 2,
  EXTRA_LARGE: 3,
};

const stateMap = {
  length: {
    label: 'Length',
    default: 100,
  },
  width: {
    label: 'Width',
    default: 50,
  },
  height: {
    label: 'Height',
    default: 20,
  },
  pitch: {
    label: 'Roof pitch',
    default: roofPitches.THREE,
    options: [
      '3 / 12',
      '4 / 12',
      '5 / 12',
      '6 / 12',
      '7 / 12',
      '8 / 12',
    ],
    values: [
      3.0 / 12.0,
      4.0 / 12.0,
      5.0 / 12.0,
      6.0 / 12.0,
      7.0 / 12.0,
      8.0 / 12.0,
    ],
  },
  doorType: {
    label: 'Type',
    default: doorTypes.SLIDING,
    options: [
      'Sliding',
      'Overhead',
      'Walk-in',
    ],
    values: [
      {
        colors: {},
      },
      {
        sizes: {
          options: [
            '14 x 14',
            '16 x 14',
            '20 x 16',
            '24 x 16',
          ],
          values: [
            {
              width: 14,
              height: 10,
            },
            {
              width: 16,
              height: 14,
            },
            {
              width: 20,
              height: 16,
            },
            {
              width: 24,
              height: 16,
            },
          ],
        },
        colors: {},
      },
      {
        sizes: {
          options: [
            '3 x 8',
            '4 x 8',
          ],
          values: [
            {
              width: 3,
              height: 8,
            },
            {
              width: 4,
              height: 8,
            },
          ],
        },
        colors: {},
      },
    ],
  },
  doorWall: {
    label: 'Wall',
    default: doorWalls.FRONT,
    options: [
      'Front',
      'Back',
      'Right',
      'Left',
    ],
  },
  doorSize: {
    label: 'Size',
    default: doorSizes.LARGE,
  },
  doorWidth: {
    label: 'Width',
    default: 28,
  },
  doorHeight: {
    label: 'Height',
    default: 18,
  },
  doors: {
    default: [],
  },
  editingDoor: {
    default: true,
  },
};

class App extends Component {
  render () {
    return (
      <div className="container">
        <div className="row pt-2 mb-3 bg-faded">
          <div className="col">
            <img src={logo}  alt="D Bar D" height="50" />
          </div>
          <div className="col text-right">
            <p className="pt-3">
              Quality post frame buildings, guaranteed
            </p>
          </div>
        </div>
        <Quote stateMap={stateMap}/>
      </div>
    );
  }
}

class Quote extends Component {
  constructor (props) {
    super(props);

    const stateMap = props.stateMap;

    this.state = Object.keys(stateMap)
      .reduce((result, key) => {
        result[key] = stateMap[key].default;
        return result;
      }, {});

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleAddDoor = this.handleAddDoor.bind(this);
    this.handleRemoveDoor = this.handleRemoveDoor.bind(this);
    this.handleCancelDoor = this.handleCancelDoor.bind(this);
  }

  handleInputChange (event) {
    const map = this.props.stateMap;
    const name = event.target.name;
    let value = event.target.value;

    switch (event.target.type) {
      case 'number':
        value = parseFloat(value);
        value = isNaN(value) ? 0.0 : value;
        break;
    }

    this.setState((state, props) => {
      const map = props.stateMap;
      state[name] = value;
      const sizes = map.doorType.values[state.doorType].sizes;
      if (sizes && state.doorSize >= sizes.values.length) {
        return {
          [name]: value,
          doorSize: sizes.values.length - 1,
        };
      } else {
        return {
          [name]: value,
        };
      }
    });
  }

  handleAddDoor () {
    this.setState(state => {
      if (state.editingDoor) {
        state.doors.push(this.createDoor(state));
        return {
          doors: state.doors,
          editingDoor: false,
        };
      } else {
        return {
          editingDoor: true,
        };
      }
    });
  }

  handleRemoveDoor () {
    // TODO
  }

  handleCancelDoor () {
    this.setState({
      editingDoor: false,
    });
  }

  createDoor (state) {
    const map = this.props.stateMap;
    const sizes = map.doorType.values[state.doorType].sizes;

    let width = state.doorWidth;
    let height = state.doorHeight;
    
    if (sizes) {
      const size = sizes.values[state.doorSize];
      width = size.width;
      height = size.height;
    }

    return {
      type: state.doorType,
      wall: state.doorWall,
      size: state.doorSize,
      width,
      height,
    };
  }

  getQuote () {
    const state = this.state;
    const map = this.props.stateMap;

    const pitch = map.pitch.values[state.pitch];
    const roof = (state.width / 2.0) * pitch * state.width * state.length / 2.0;

    return parseInt(state.length * state.width * state.height + roof);
  }

  render () {
    const state = this.state;
    const map = this.props.stateMap;

    const quote = this.getQuote();
    const length = state.length;
    const width = state.width;
    const height = state.height;
    const pitch = state.pitch;
    const pitchValue = map.pitch.values[pitch];

    const doors = state.doors;
    const doorType = state.doorType;
    const doorWall = state.doorWall;
    const doorSize = state.doorSize;
    const doorWidth = state.doorWidth;
    const doorHeight = state.doorHeight;
    const editingDoor = state.editingDoor;
    const doorsRendered = doors.slice();

    if (editingDoor) {
      doorsRendered.push(this.createDoor(state));
    }

    const doorMap = {
      type: map.doorType,
      wall: map.doorWall,
      size: map.doorSize,
      width: map.doorWidth,
      height: map.doorHeight,
    };

    return (
      <div className="row">
        <div className="col-md-4">
          <form>
            <fieldset>
              <legend>Dimensions</legend>
              <Inputor name="length" label={map.length.label} value={length} onChange={this.handleInputChange}/>
              <Inputor name="width" label={map.width.label} value={width} onChange={this.handleInputChange}/>
              <Inputor name="height" label={map.height.label} value={height} onChange={this.handleInputChange}/>
              <Selector name="pitch" label={map.pitch.label} value={pitch} options={map.pitch.options} onChange={this.handleInputChange}/>
            </fieldset>
            <DoorBuilder
              map={doorMap}
              doors={doors}
              type={doorType}
              wall={doorWall}
              size={doorSize}
              width={doorWidth}
              height={doorHeight}
              editing={editingDoor}
              onAdd={this.handleAddDoor}
              onRemove={this.handleRemoveDoor}
              onCancel={this.handleCancelDoor}
              onChange={this.handleInputChange}/>
          </form>
        </div>
        <div className="col-md-8">
          <Rendering length={length} width={width} height={height} pitch={pitchValue} doors={doorsRendered}/>
          <div className="mt-3 text-center">
            <span className="lead mr-3 pt-4">Your real-time custom quote: <strong>${quote}.00</strong></span>
            <button type="button" className="btn btn-primary">Submit for review</button>
          </div>
        </div>
      </div>
    );
  }
}

class DoorBuilder extends Component {
  constructor (props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  handleChange (event) {
    this.props.onChange(event);
  }

  handleAdd () {
    this.props.onAdd();
  }

  handleRemove (event) {
    this.props.onRemove(event);
  }

  handleCancel () {
    this.props.onCancel();
  }

  render() {
    const map = this.props.map;
    const type = this.props.type;
    const wall = this.props.wall;
    const width = this.props.width;
    const height = this.props.height;
    const size = this.props.size;
    const sizes = map.type.values[type].sizes;

    const editing = this.props.editing;
    const addMessage = editing ? 'Add Door' : 'New Door';

    const doors = this.props.doors.map((door, index) => {
      const wall = map.wall.options[door.wall];
      const type = map.type.options[door.type];
      const sizes = map.type.values[door.type].sizes;

      let dimensions = `${door.width} x ${door.height}`;

      if (sizes) {
        dimensions = sizes.options[size];
      }
      const text = `${wall} wall, ${type}, ${dimensions}`;

      return <li className="list-group-item" key={index}>{text}</li>
    });

    const doorList = doors.length ? <ul className="list-group mb-3">{doors}</ul> : null;

    return (
      <fieldset>
        <legend>Doors</legend>
        {doorList}
        {!doorList && !editing && <p className="lead text-warning">Buildings need doors!</p>}
        {editing &&
          <div>
            <Selector name="doorType" label={map.type.label} value={type} options={map.type.options} onChange={this.handleChange}/>
            <Selector name="doorWall" label={map.wall.label} value={wall} options={map.wall.options} onChange={this.handleChange}/>
            {sizes && <Selector name="doorSize" label={map.size.label} value={size} options={sizes.options} onChange={this.handleChange}/>}
            {!sizes && <Inputor name="doorWidth" label={map.width.label} value={width} onChange={this.handleChange}/>}
            {!sizes && <Inputor name="doorHeight" label={map.height.label} value={height} onChange={this.handleChange}/>}
          </div>
        }
        <div className="form-group row">
          <div className="col-12 text-right">
            {editing && <button type="button" className="btn btn-secondary mr-2" onClick={this.handleCancel}>Cancel</button>}
            <button type="button" className="btn btn-outline-primary" onClick={this.handleAdd}>{addMessage}</button>
          </div>
        </div>
      </fieldset>
    );
  }
}


class Inputor extends Component {
  constructor (props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange (event) {
    this.props.onChange(event);
  }

  render() {
    const name = this.props.name;
    const label = this.props.label;
    const value = this.props.value || '';

    return (
      <div className="form-group row">
        <label className="col-sm-5 col-form-label" htmlFor={name}>
          {label}:
        </label>
        <div className="col-sm-7"> 
          <input type="number" className="form-control" name={name} id={name} value={value} onChange={this.handleChange}/>
        </div>
      </div>
    );
  }
}

class Selector extends Component {
  constructor (props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange (event) {
    this.props.onChange(event);
  }

  render() {
    const options = this.props.options || [];
    const name = this.props.name;
    const label = this.props.label;
    const value = this.props.value;

    return (
      <div className="form-group row">
        <label className="col-sm-5 col-form-label" htmlFor={name}>
          {label}:
        </label>
        <div className="col-sm-7"> 
          <select className="form-control" value={value} name={name} id={name} onChange={this.handleChange}>
            {options.map((op, index) => 
              <option key={index} value={index}>
                {op}
              </option>
            )}
          </select>
        </div>
      </div>
    );
  }
}

export default App;
