import React, { Component } from 'react';
import logo from './logo.png';
import './App.css';
import Rendering from './Rendering';

class App extends Component {
  render () {
    return (
      <div className="container">
        <div className="row py-2 bg-faded">
          <div className="col">
            <img src={logo}  alt="D Bar D" height="50" />
          </div>
          <div className="col text-right">
            <p className="pt-3">
              Quality post frame buildings, guaranteed
            </p>
          </div>
        </div>
        <Quote l="120" w="40" h="20"/>
      </div>
    );
  }
}

class Quote extends Component {
  constructor (props) {
    super(props);


    this.state = {
      l: props.l,
      w: props.w,
      h: props.h,
      quote: this.getQuote(props.l, props.w, props.h),
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange (name, value) {
    this.setState(prev => {
      const s = {
        l: prev.l,
        w: prev.w,
        h: prev.h,
      };
      s[name] = value;

      return {
        [name]: value,
        quote: this.getQuote(s.l, s.w, s.h),
      };
    })
  }

  getQuote (l, w, h) {
    return l * w * h;
  }

  render () {
    return (
      <div className="row">
        <div className="col-12">
          <h3 className="text-center my-4">
            Customize your building for a real-time quote.
          </h3>
        </div>
        <div className="col-md-4">
          <form>
            <Dimension name="l" value={this.state.l} onChange={this.handleInputChange}/>
            <Dimension name="w" value={this.state.w} onChange={this.handleInputChange}/>
            <Dimension name="h" value={this.state.h} onChange={this.handleInputChange}/>
            <div className="form-group row">
              <label className="col-sm-2 col-form-label">
                <strong>Quote:</strong>
              </label>
              <div className="col-sm-10">
                <p className="form-control-static">
                  <strong>${this.state.quote}.00</strong>
                </p>
              </div>
            </div>
          </form>
        </div>
        <div className="col-md-8">
          <Rendering />
        </div>
      </div>
    );
  }
}

const dimensionLabels = {
  l: 'length',
  w: 'width',
  h: 'height',
};

class Dimension extends Component {
  constructor (props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange (e) {
    this.props.onChange(e.target.name, e.target.value);
  }

  render() {
    const name = this.props.name;
    const value = this.props.value;
    const id = `dimension-${name}`;

    return (
      <div className="form-group row">
        <label className="col-sm-2 col-form-label" htmlFor={id}>
          {dimensionLabels[name]}:
        </label>
        <div className="col-sm-10"> 
          <input type="number" className="form-control" name={name} id={id} value={value} onChange={this.handleChange} />
        </div>
      </div>
    );
  }
}

export default App;
