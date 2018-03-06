import React, { Component } from 'react';
import * as PIXI from 'pixi.js';
import { TweenMax, Expo, Power1 } from 'gsap';
import PixiPlugin from 'gsap/PixiPlugin.js';
import ControlKit from 'controlkit';

// Utilities
import { getIndexFromX } from './utils';

// Constants
const Application = PIXI.Application;
const Container = PIXI.Container;
const Text = PIXI.Text;

class Titles extends Component {

  componentDidMount() {
    const {appState, data, containerPerc} = this.props;

    this.width = appState.width;
    this.height = appState.height;

    // Pixi environment
    this.canvasHeight = Math.round(this.height / 6);
    this.app = new Application(this.width, this.canvasHeight, {
      antialias: true,
      legacy: true,
      resolution: 1,
      transparent: true,
    });
    this.appContent.appendChild(this.app.view);
    this.container = new Container();
    this.app.stage.addChild(this.container);

    // Bounds
    const appBounds = this.app.view.getBoundingClientRect();
    this.top = appBounds.top;
    this.bottom = this.top + this.canvasHeight;

    // Snaps
    const distanceX = this.width / data.length;
    this.snaps = data.map((name, index) =>  distanceX * index);

    // Indices
    this.hoverTextIndex = 14; // Starting index
    this.containerPercIndex = getIndexFromX(this.snaps, (this.width / 100) * containerPerc);

    // Flags
    this.isMoving = false;

    // CONTROLKIT SETUP
    this.vars = {
      color: '#fff',
      active: '#002aff',
    }
    const ck = new ControlKit();
    ck.addPanel({align: 'left'})
      .addGroup()
      .addSubGroup()
      .addColor(this.vars, 'color', { onChange: this.changeDefaultColor })
      .addColor(this.vars, 'active', { onChange: this.changeActiveColor });

    // TITLES SETUP
    this.setup();
    this.orderItems(this.hoverTextIndex);

    // Fake app loader
    setTimeout(() => {

      this.appear()
        .then(() => this.loop())
        .then(() => this.setEvents());

    }, 500);

  }

  componentWillUnmount() {
    document.removeEventListener('click', this.clickHandler);
  }

  render() {
    return (
        <div
          className="Titles-intro"
          ref={c => this.appContent = c}
        />
    );
  }

  setup() {
    const { data } = this.props;
    this.items = data
      .map((name, index) => {
          const titleStyle: Object = {
              fontFamily: 'Nobel-ExtraLightItalic',
              fontSize: this.canvasHeight,
              fill: PixiPlugin.parseColor(this.vars.color, 'number'),
          };
          const text = new Text(name.toUpperCase(), titleStyle);
          text.alpha = 0;
          text.anchor.set(0.5, 0.5);
          text.position.set(this.width / 2, this.canvasHeight / 2);
          text.filters = [PIXI.Texture.WHITE];

          return text;
      });

    this.container.addChild(...this.items);
  }

  appear() {
    return new Promise(resolve => {
      const selectedIndex = this.containerPercIndex;

      this.items.forEach((item, index) => {
        TweenMax.to(item, 1, {
          x: index === selectedIndex ? this.snaps[index] + (item.width / 2) : this.snaps[index],
          alpha: index === selectedIndex ? 1 : 0.1,
          pixi: {
            tint: index === selectedIndex ? this.vars.active : this.vars.color,
          },
          ease: Expo.easeInOut,
          onComplete: resolve,
        });
      });

      // Shift element at the end (higher z-index)
      this.container.swapChildren(
        this.items[selectedIndex],
        this.container.children[this.container.children.length - 1]
      );
    });
  }

  setEvents() {
    document.addEventListener('click', this.clickHandler, false);
  };

  orderItems(newTextIndex = this.activeTextIndex) {
    const { appState, containerPerc } = this.props;
    const containerPercIndex = getIndexFromX(
      this.snaps,
      (appState.width / 100) * containerPerc
    );

    // Delta between the current active element and the container position
    const indexDelta = containerPercIndex - newTextIndex;

    // debugger
    // TweenMax.set(this.items[containerPercIndex], { y: 10 });

    if (indexDelta === 0) {
      return;
    } else if (indexDelta < 0) {
      const firstItems = this.items.splice(0, Math.abs(indexDelta));
      this.items = [
        ...this.items,
        ...firstItems,
      ];
    } else {
      const lastItems = this.items.splice(this.items.length - indexDelta);
      this.items = [
        ...lastItems,
        ...this.items,
      ]
    }
  }

  loop = () => {
    const mouseY = global.mouseCoords.y;

    if (!this.isMoving) {
      // if mouse inside bounds
      if (mouseY > this.top && mouseY < this.bottom) {
        this.animationMouseHover();
      } else {
        this.animationMouseOut();
      }
    }

    requestAnimationFrame(this.loop);
  }

  animationMouseHover = () => {
    const mouseX = global.mouseCoords.x;
    const items = this.items;

    const textIndex = getIndexFromX(this.snaps, mouseX);

    // Move
    if (textIndex !== this.hoverTextIndex) {
      const activeText = items[this.containerPercIndex];
      const prevText = items[this.hoverTextIndex];
      const newText = items[textIndex];

      this.hover({
        from: this.isMouseIn ? prevText : activeText,
        to: newText
      });

      // Update hoverTextIndex
      this.hoverTextIndex = textIndex;
    }

    this.isMouseIn = true;
  }

  animationMouseOut = () => {
    if (this.isMouseIn) {
      const items = this.items;
      const activeText = items[this.containerPercIndex];
      const prevText = items[this.hoverTextIndex];

      console.log(
        prevText.text,
        activeText.text,
      );

      this.hover({
        from: prevText,
        to: activeText
      });
    }

    this.isMouseIn = false;
    this.hoverTextIndex = this.containerPercIndex;
  }

  hover({from, to}) {
    // Shift element at the end (higher z-index)
    this.container.swapChildren(to, this.container.children[this.container.children.length - 1]);

    const toIndex = this.items.findIndex(item => item.text === to.text);
    const toX = this.snaps[toIndex];
    let newX = toX;
    const leftMargin = newX - to.width / 2;
    const rightMargin = this.width - (newX + to.width / 2);

    // if "to" is the active item, then add half with (in order to align with the container perc index)
    if (to.text === this.items[this.containerPercIndex].text) {
      newX += to.width / 2;
    } else {
      // Right correction
      if (rightMargin < 0) {
        newX -= Math.abs(rightMargin);
      }
      // Left correction
      if (leftMargin < 0) {
        newX += Math.abs(leftMargin);
      }
    }

    this.items.forEach((item, index) => {
      const isNewHoveredText = item.text === to.text;
      const alpha = isNewHoveredText ? 1 : 0.1;
      const x = isNewHoveredText
        ? newX
        : index < toIndex
          ? this.snaps[index] - (index * ((toIndex - index) / 2))
          : this.snaps[index] + (index * ((index - toIndex) / 2));
      const tint = isNewHoveredText ? this.vars.active : this.vars.color;
      const tintTime = isNewHoveredText ? 0.2 : 0.4;
      TweenMax.to(item, 0.4, {
        alpha,
        x,
        ease: Power1.easeInOut,
      });
      // Changing color is aesthetic, so I speed it up
      TweenMax.to(item, tintTime, {
        pixi: {
          tint,
        },
        ease: Power1.easeInOut,
      })
    });

  }

  move(newTextIndex) {
    this.orderItems(newTextIndex);
    this.isMoving = true;

    this.items.forEach((item, index) => {
      const x = (index === this.containerPercIndex)
        ? this.snaps[index] + (item.width / 2)
        : this.snaps[index];

      TweenMax.to(item, 1, {
        x,
        ease: Expo.easeInOut,
        onComplete: () => {
          if (index === this.items.length - 1) {
            this.isMoving = false;
          }
        }
      });
    });
  }

  clickHandler = e => {
    // if click is on slider and the slider isn't moving
    if (e.clientY > this.top && e.clientY < this.bottom && !this.isMoving) {
      this.move(this.hoverTextIndex);
    }
  }

  changeDefaultColor = (color) => {
    const items = this.items.filter((item, index) => index !== this.containerPercIndex);
    items.forEach(item => {
      TweenMax.set(item, {
        pixi: {
          tint: color,
        }
      });
      TweenMax.set(item.style, {
        fill: color,
      });
    });
  }

  changeActiveColor = (color) => {
    TweenMax.set(this.items[this.containerPercIndex], {
      pixi: {
        tint: color
      },
    });
  }

}

export default Titles;
