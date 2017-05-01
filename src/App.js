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

const inventory = {
  lumber: {
    '2x8x8': {
      description: `Fir, 2" x 8" x 8'`,
      price: 12.0,
    },
    '2x12x8': {
      description: `Hardened Fir, 2" x 12" x 8'`,
      price: 26.5,
    },
    '2x10x8': {
      description: `Fir, 2" x 10" x 8'`,
      price: 16.0,
    },
  },
  sheetMetal: {
    '4x8': {
      description: `Galvanized Steel, 4' x 8'`,
      price: 25.0,
    },
    '4x12': {
      description: `Corrugated Steel, 4' x 12'`,
      price: 38.0,
    },
  },
  concrete: {
    standard: {
      description: 'Standard concrete',
      price: 2.4,
    },
  },
  truss: {
    '3/12': {
      description: 'Double Fink, 3/12 pitch',
      price: 15.0,
    },
    '4/12': {
      description: 'Double Fink, 4/12 pitch',
      price: 20.0,
    },
    '5/12': {
      description: 'Double Fink, 5/12 pitch',
      price: 26.0,
    },
    '6/12': {
      description: 'Double Fink, 6/12 pitch',
      price: 34.0,
    },
    '7/12': {
      description: 'Double Fink, 7/12 pitch',
      price: 44.0,
    },
    '8/12': {
      description: 'Double Fink, 8/12 pitch',
      price: 56.0,
    },
  },
  door: {
    'Sliding': {
      description: 'Solid Oak',
      price: 6.0,
    },
    'Overhead-14x10': {
      description: `Aluminum, 14' x 10'`,
      price: 1000.0,
    },
    'Overhead-16x14': {
      description: `Aluminum, 16' x 14'`,
      price: 1800.0,
    },
    'Overhead-20x16': {
      description: `Aluminum, 20' x 16'`,
      price: 2800.0,
    },
    'Overhead-24x16': {
      description: `Aluminum, 24' x 16'`,
      price: 3600.0,
    },
    'Walk-in-3x7': {
      description: `Maple, 3' x 7'`,
      price: 225.0,
    },
    'Walk-in-4x8': {
      description: `Maple, 4' x 8'`,
      price: 325.0,
    },
  },
  hardware: {
    'ws200': {
      description: `Polymer-coated, 2 1/2", 200 count`,
      price: 40.0,
    },
    'ms200': {
      description: `Stainless steel, 1 1/2", 200 count`,
      price: 30.0,
    },
  },
  labor: {
    hourly: {
      description: '',
      price: 100.0,
    },
  },
};

const postDist = 8.0;
const girtDist = 4.0;
const slatDist = 3.0;
const roofPanelWidth = 4.0;
const roofPanelHeight = 12.0;
const sidePanelWidth = 4.0;
const sidePanelHeight = 8.0;
const footingWidth = 2.0;
const footingRatio = 0.4;
const boardLength = 8.0;
const screwsPerBoard = 12;
const screwsPerSheet = 24;
const screwsPerBox = 200;
const hoursPerCubicFoot = 0.01;

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
    default: doorTypes.OVERHEAD,
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
            '14 x 10',
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
            '3 x 7',
            '4 x 8',
          ],
          values: [
            {
              width: 3,
              height: 7,
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
  rendering: {
    default: true,
  },
  submitted: {
    default: false,
  },
};

class App extends Component {
  render () {
    return (
      <div>
        <div className="container-fluid bg-faded mb-4">
          <div className="container py-2">
            <img src={logo}  alt="D Bar D" height="50" />
          </div>
        </div>
        <div className="container pb-4">
          <Quote stateMap={stateMap} inventory={inventory}/>
        </div>
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

    this.doorCount = 0;

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleAddDoor = this.handleAddDoor.bind(this);
    this.handleRemoveDoor = this.handleRemoveDoor.bind(this);
    this.handleCancelDoor = this.handleCancelDoor.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleViewToggle = this.handleViewToggle.bind(this);
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
      if (name === 'doorType') {
        return {
          [name]: value,
          doorSize: doorSizes.SMALL,
        }
      } else {
        return {
          [name]: value,
        };
      }
    });
  }

  handleAddDoor () {
    this.setState(state => {
      const doors = state.doors.map(door => Object.assign({}, door));

      if (state.editingDoor) {
        this.doorCount += 1;
        doors.push(this.createDoor(state));
        return {
          doors,
          editingDoor: false,
        };
      } else {
        return {
          editingDoor: true,
        };
      }
    });
  }

  handleRemoveDoor (event) {
    const id = parseInt(event.target.id);

    this.setState(state => {
      const doors = state.doors
        .filter(door => door.key !== id)
        .map(door => Object.assign({}, door));

      return {doors};
    });
  }

  handleCancelDoor () {
    this.setState({
      editingDoor: false,
    });
  }

  handleViewToggle () {
    this.setState(state => ({
      rendering: !state.rendering,
    }));
  }

  handleSubmit () {
    this.setState({
      submitted: true,
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
      key: this.doorCount,
      type: state.doorType,
      wall: state.doorWall,
      size: state.doorSize,
      width,
      height,
    };
  }

  calculateMaterials (doors) {
    const state = this.state;
    const map = this.props.stateMap;

    if (!(state.length && state.width && state.height)) {
      return {};
    }

    const pitch = map.pitch.values[state.pitch];
    const halfWidth = state.width / 2.0;
    const roofHeight = halfWidth * pitch;
    const roofFaceWidth = Math.sqrt(roofHeight * roofHeight + halfWidth * halfWidth);

    const volume = state.length * state.width * state.height + state.length * state.width * roofHeight / 2.0;

    const numTrusses = Math.ceil(state.length / postDist);
    const numFrontPosts = Math.ceil(state.width / postDist) - 2;
    const numPosts = numTrusses * 2 + numFrontPosts * 2;
    const numGradeBoards = (numTrusses - 1) * 2 + (numFrontPosts + 1) * 2;
    const numTopBoards = numGradeBoards * 2;
    const numGirtBoards = numGradeBoards * Math.floor(state.height / girtDist);

    const numRoofSlats = (numTrusses - 1) * Math.ceil(roofFaceWidth / slatDist) * 2;
    const numRoofPanels = Math.ceil(state.length / roofPanelWidth) * Math.ceil(roofFaceWidth / roofPanelHeight) * 2;
    const numSidePanels = 
      Math.ceil(state.length / sidePanelWidth) * Math.ceil(state.height / sidePanelHeight) * 2 +
      Math.ceil(state.width / sidePanelWidth) * Math.ceil(state.height / sidePanelHeight) * 2;
    
    const footingDepth = state.height * footingRatio;
    const footingVolume = Math.PI * Math.exp(footingWidth / 2.0, 2) * footingDepth;
    const numPostBoards = Math.ceil((state.height + footingDepth) / boardLength) * 2 * numPosts;

    return {
      Roof: [
        {
          name: 'Trusses',
          cat: 'truss',
          id: map.pitch.options[state.pitch].replace(/\s/g, ''),
          size: state.width,
          qty: numTrusses,
        },
        {
          name: 'Slat boards',
          cat: 'lumber',
          id: '2x8x8',
          qty: numRoofSlats,
        },
        {
          name: 'Roof panels',
          cat: 'sheetMetal',
          id: '4x12',
          qty: numRoofPanels,
        },
        {
          name: 'Wood screws',
          cat: 'hardware',
          id: 'ws200',
          qty: Math.ceil(numRoofSlats * screwsPerBoard / screwsPerBox),
        },
        {
          name: 'Sheet metal screws',
          cat: 'hardware',
          id: 'ms200',
          qty: Math.ceil(numRoofPanels * screwsPerSheet / screwsPerBox),
        },
      ],
      Walls: [
        {
          name: 'Post boards',
          cat: 'lumber',
          id: '2x8x8',
          qty: numPostBoards,
        },
        {
          name: 'Grade boards',
          cat: 'lumber',
          id: '2x12x8',
          qty: numGradeBoards,
        },
        {
          name: 'Top boards',
          cat: 'lumber',
          id: '2x10x8',
          qty: numTopBoards,
        },
        {
          name: 'Girt boards',
          cat: 'lumber',
          id: '2x8x8',
          qty: numGirtBoards,
        },
        {
          name: 'Side panels',
          cat: 'sheetMetal',
          id: '4x8',
          qty: numSidePanels,
        },
        {
          name: 'Wood screws',
          cat: 'hardware',
          id: 'ws200',
          qty: Math.ceil((numPostBoards + numGradeBoards + numTopBoards + numGirtBoards) * screwsPerBoard / screwsPerBox),
        },
        {
          name: 'Sheet metal screws',
          cat: 'hardware',
          id: 'ms200',
          qty: Math.ceil(numSidePanels * screwsPerSheet / screwsPerBox),
        },
      ],
      Footings: [
        {
          name: 'Footings',
          cat: 'concrete',
          id: 'standard',
          qty: numPosts,
          volume: footingVolume,
        },
      ],
      Doors: doors.filter(door => door.valid)
        .map(door => Object.assign({}, door))
        .map(door => {
          const id = map.doorType.options[door.type];

          door.qty = 1;
          door.cat = 'door';
          door.name = `${id} door`;

          switch (parseInt(door.type)) {
            case doorTypes.SLIDING:
              door.id = id;
              door.area = door.width * door.height;
              break;
            case doorTypes.OVERHEAD:
            case doorTypes.WALK_IN:
              door.id = `${id}-${door.width}x${door.height}`;
              break;
            default:
              throw new Error(`Unknown door type - ${parseInt(door.type)}`);
          }
          
          return door;
      }),
      Labor: [
        {
          name: 'Man-Hours',
          cat: 'labor',
          id: 'hourly',
          qty: Math.ceil(volume * hoursPerCubicFoot),
        }
      ]
    };
  }

  getQuote (materials) {
    const state = this.state;
    const map = this.props.stateMap;
    const inventory = this.props.inventory;

    return Object.keys(materials).reduce((quote, group) => {

      quote.groups[group] = materials[group].map(item => {

        const record = inventory[item.cat][item.id];
        if (!record) {
          throw new Error(`Inventory record not found - cat: ${item.cat}, id: ${item.id}`);
        }

        switch (item.cat) {
          case 'door':
            item.unitPrice = item.area ? item.area * record.price : record.price;
            item.description = item.area ? 
              `${record.description}, ${item.width}' x ${item.height}'` :
              record.description;
            item.description = `${item.description}, ${map.doorWall.options[item.wall]} wall`;
            break;
          case 'truss':
            item.unitPrice = item.size * record.price;
            item.description = `${record.description}, ${item.size}'`;
            break;
          case 'concrete':
            item.unitPrice = item.volume * record.price;
            item.description = <span>{`${record.description}, ${item.volume.toFixed(1)} ft`}<sup>3</sup></span>;
            break;
          default:
            item.unitPrice = record.price;
            item.description = record.description;
            break;
        }

        item.total = item.unitPrice * item.qty;
        quote.total += item.total;
        return item;
      });

      return quote;
    }, {groups: {}, total: 0});
  }

  validateDoors (doors) {
    const length = this.state.length;
    const width = this.state.width;
    const height = this.state.height;

    if (!(length && width && height)) {
      doors.forEach(door => {
        door.valid = false;
        door.reason = 'Doors need buildings!'
      });
      return;
    }

    const doorsChecked = [];

    doors.forEach(door => {
      const reason = 'The door is too big!';
      door.valid = true;

      switch (parseInt(door.wall)) {
        case doorWalls.FRONT:
        case doorWalls.BACK:
          if (door.width >= width || door.height >= height) {
            door.valid = false;
            door.reason = reason;
          }
          break;
        case doorWalls.LEFT:
        case doorWalls.RIGHT:
          if (door.width >= length || door.height >= height) {
            door.valid = false;
            door.reason = reason;
          }
          break;
      }

      doorsChecked.forEach(checked => {
        if (parseInt(checked.wall) === parseInt(door.wall)) {
          door.valid = false;
          door.reason = 'An existing door conflicts!';
        }
      });

      doorsChecked.push(door);
    });
  }

  render () {
    const state = this.state;
    const map = this.props.stateMap;

    const submitted = state.submitted;
    const rendering = state.rendering;
    const viewMessage = rendering ? 'View details' : 'View rendering';

    const length = state.length;
    const width = state.width;
    const height = state.height;
    const pitch = state.pitch;
    const pitchValue = map.pitch.values[pitch];

    const hasVolume = length && width && height;

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

    this.validateDoors(doorsRendered);
    const doorList = editingDoor ? doorsRendered.slice(0, -1) : doorsRendered.slice();

    const currentDoor = editingDoor ? doorsRendered[doorsRendered.length - 1] : {};
    const valid = currentDoor.valid;
    const reason = currentDoor.reason;

    const materials = this.calculateMaterials(doorsRendered);
    const quote = this.getQuote(materials);
    const total = quote.total.toFixed(0);

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
          {submitted ?
            <div>
              <h1 className="display-4">Thank you!</h1>
              <p className="lead">Your quote review request has been received.</p>
              <p>
                One of our construction experts will review your post frame building plans
                to ensure a smooth and speedy build. A sales representative will contact you
                as soon as the review process is complete.
              </p>
            </div> :
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
                doors={doorList}
                type={doorType}
                wall={doorWall}
                size={doorSize}
                width={doorWidth}
                height={doorHeight}
                valid={valid}
                reason={reason}
                editing={editingDoor}
                onAdd={this.handleAddDoor}
                onRemove={this.handleRemoveDoor}
                onCancel={this.handleCancelDoor}
                onChange={this.handleInputChange}/>
            </form>
          }
        </div>
        <div className="col-md-8">
          {rendering ?
            <div className="row justify-content-center">
              <div className="col-12 col-sm-auto">
                <Rendering length={length} width={width} height={height} pitch={pitchValue} doors={doorsRendered}/>
              </div>
            </div>
            :
            <div className="row">
              <div className="col-12">
                <Details quote={quote}/>
              </div>
            </div>
          }
          <div className="row justify-content-center mt-3">
            <div className="col-12 col-sm-auto">
              <p className="h4 mr-3">Quote: <strong className="text-primary">${commas(total)}.00</strong></p>
            </div>
            <div className="col-12 col-sm-auto">
              <button type="button" className="btn btn-secondary mr-3" onClick={this.handleViewToggle}>{viewMessage}</button>
              {submitted || hasVolume ?
                <button type="button" className="btn btn-outline-primary" onClick={this.handleSubmit}>Submit for review</button> :
                <button type="button" className="btn btn-outline-primary" disabled onClick={this.handleSubmit}>Submit for review</button>
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function commas(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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

    const valid = this.props.valid;
    const reason = this.props.reason;

    const editing = this.props.editing;
    const addMessage = editing ? 'Add Door' : 'New Door';

    const doors = this.props.doors.map(door => {
      const wall = map.wall.options[door.wall];
      const type = map.type.options[door.type];
      const sizes = map.type.values[door.type].sizes;

      let dimensions = `${door.width} x ${door.height}`;

      if (sizes) {
        dimensions = sizes.options[door.size];
      }

      const text = `${wall} wall, ${type}, ${dimensions}`;

      const classes = door.valid ? 'list-group-item' : 'list-group-item list-group-item-danger';
      const message = door.valid ? '' : door.reason;

      return (
        <li className={classes} key={door.key} title={message}>
          <button type="button" id={door.key} className="btn btn-sm btn-outline-danger mr-3" onClick={this.handleRemove}>
            {'\u2715'}
          </button>
          {text}
        </li>
      );
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
          <div className="col-12 text-center">
            {editing && <button type="button" className="btn btn-secondary mr-2" onClick={this.handleCancel}>Cancel</button>}
            {editing && !valid ?
              <button type="button" className="btn btn-danger" disabled onClick={this.handleAdd}>{addMessage}</button> :
              <button type="button" className="btn btn-outline-primary" onClick={this.handleAdd}>{addMessage}</button>
            }
          </div>
          {editing && !valid &&
            <div className="col-12 alert alert-danger mt-3" role="alert">
              {reason}
            </div>
          }
        </div>
      </fieldset>
    );
  }
}

class Details extends Component {
  render () {
    const groups = this.props.quote.groups;

    const rows = [];
    
    Object.keys(groups).forEach(key => {
      const group = groups[key];

      rows.push(
        <tr key={key}>
          <th scope="row" colSpan="5">{key}</th>
        </tr>
      );

      group.forEach((item, index) => {
        rows.push(
          <tr key={`${key}-${item.id}-${index}`}>
            <td>{item.name}</td>
            <td>{item.description}</td>
            <td className="text-right">${commas(item.unitPrice.toFixed(1))}</td>
            <td className="text-right">{item.qty}</td>
            <td className="text-right">${commas(item.total.toFixed(1))}</td>
          </tr>
        );
      });
    });

    return (
      <table className="table table-sm">
        <thead className="thead-default">
          <tr>
            <th>Item</th>
            <th>Description</th>
            <th className="text-right">Unit Price</th>
            <th className="text-right">Qty</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
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
