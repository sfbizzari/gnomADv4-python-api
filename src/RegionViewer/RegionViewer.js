import React, { PropTypes, Component } from 'react'
import injectTapEventPlugin from 'react-tap-event-plugin'
import Slider from 'material-ui/Slider'

import {
  calculateOffsetRegions,
  calculatePositionOffset,
  calculateXScale,
} from 'utilities/calculateOffsets'  // eslint-disable-line

injectTapEventPlugin()

class RegionViewer extends Component {

  static propTypes = {
    css: PropTypes.object.isRequired,
    regions: PropTypes.array.isRequired,
    regionAttributes: PropTypes.object,
  }

  state = {
    leftPanelWidth: 150,
    rightPanelWidth: 50,
    featuresToDisplay: ['CDS'],
    padding: 150,
    ready: false,
  }

  setWidth = (event, newValue) => {
    const newWidth = 800 * newValue
    this.setState({ width: newWidth })
  }

  setPadding = (event, newValue) => {
    const padding = Math.floor(2000 * newValue)
    this.setState({ padding })
  }
  setLeftPanelWidth = (event, newValue) => {
    const leftPanelWidth = Math.floor(400 * newValue)
    this.setState({ leftPanelWidth })
  }

  renderChildren = (childProps) => {
    return React.Children.map(this.props.children, (child) => {
      return React.cloneElement(child, childProps)
    })
  }

  render() {
    const { css } = this.props
    const { featuresToDisplay, padding, leftPanelWidth } = this.state
    const { regions, regionAttributes, width } = this.props
    const offsetRegions = calculateOffsetRegions(
      featuresToDisplay,
      regionAttributes,
      padding,
      regions,
    )
    const positionOffset = calculatePositionOffset(offsetRegions)
    const xScale = calculateXScale(width, offsetRegions)
    const childProps = {
      leftPanelWidth,
      positionOffset,
      xScale,
      width,
      offsetRegions,
    }
    return (
      <div className={css.regionViewer}>
        <p>Exon padding {this.state.padding.toPrecision(3)} bp</p>
        <Slider
          style={{
            width: 800,
          }}
          onChange={this.setPadding}
        />
      <p>Left Panel {this.state.leftPanelWidth} bp</p>
        <Slider
          style={{
            width: 800,
          }}
          onChange={this.setLeftPanelWidth}
        />
        <div style={{ width: width + leftPanelWidth }} className={css.regionArea}>
          {this.renderChildren(childProps)}
        </div>
      </div>
    )
  }
}
export default RegionViewer
