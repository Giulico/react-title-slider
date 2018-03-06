import React, { Component } from 'react';

// Styles
import './App.css';

// Components
import Titles from './Titles.js';

// Utilities
import { debounce } from './utils';

// Constatnts
const data = ["lultima-risalita", "tag", "watch", "peekabeat", "linealight", "ventura", "claraluna", "pal-zileri", "piero-milano", "sharp", "aquardens", "tods", "cecchi", "lidl-italia", "feudi", "qc-terme", "copego", "fornasetti", "muller", "forno-bonomi", "campo-alle-comete", "oxydo", "fitri", "airoh", "creazioni", "fisg"];

global.mouseCoords = {};
document.addEventListener('mousemove', e => {
  global.mouseCoords.x = e.clientX;
  global.mouseCoords.y = e.clientY;
}, false);

class App extends Component {

  state = {
    loaded: false,
    width: window.innerWidth,
    height: window.innerHeight,
  }

  constructor(props) {
    super(props);
    this.containerPerc = 20;
  }

  componentDidMount() {
    this.setEvents();

    setTimeout(() => {
      this.setState({
        loaded: true,
      })
    }, 500);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeHandler);
  }

  render() {
    return (
      <React.Fragment>
        <div className="App">
          <Titles
            loaded={this.state.loaded}
            appState={{
              width: this.state.width,
              height: this.state.height
            }}
            containerPerc={this.containerPerc}
            data={data}
          />
        </div>
        <span className="App-container" />
      </React.Fragment>
    );
  }

  setEvents() {
    window.addEventListener('resize', this.resizeHandler, false);
  }

  resizeHandler = debounce(e => {
    this.setState({
      width: e.target.innerWidth,
      height: e.target.innerHeight,
    });
  }, 500);

}

export default App;
