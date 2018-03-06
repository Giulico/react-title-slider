import React, { Component } from 'react';
import './App.css';
import Titles from './Titles.js';

const data = ["lultima-risalita", "tag", "watch", "peekabeat", "linealight", "ventura", "claraluna", "pal-zileri", "piero-milano", "sharp", "aquardens", "tods", "cecchi", "lidl-italia", "feudi", "qc-terme", "copego", "fornasetti", "muller", "forno-bonomi", "campo-alle-comete", "oxydo", "fitri", "airoh", "creazioni", "fisg"];

global.mouseCoords = {};
document.addEventListener('mousemove', e => {
  global.mouseCoords.x = e.clientX;
  global.mouseCoords.y = e.clientY;
}, false);

class App extends Component {

  state = {
    loaded: false,
  }

  constructor(props) {
    super(props);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.containerPerc = 20;
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        loaded: true,
      })
    }, 500);
  }

  render() {
    return (
      <React.Fragment>
        <div className="App">
          <Titles
            loaded={this.state.loaded}
            appState={{
              width: this.width,
              height: this.height
            }}
            containerPerc={this.containerPerc}
            data={data}
          />
        </div>
        <span className="App-container" />
      </React.Fragment>
    );
  }

}

export default App;
