let React = require('react');

let _ = require('lodash');
let OverlayTrigger = require('react-bootstrap/lib/OverlayTrigger');
let Tooltip = require('react-bootstrap/lib/Tooltip');

let nextId = 0;

class OverlayTooltip extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      defaultTooltipId: nextId++,
    };
  }

  render() {

    let tooltip;
    if (_.isString(this.props.tooltip)) {
      tooltip =
        <Tooltip id={`tooltip-${this.state.id}`}>
          {this.props.tooltip}
        </Tooltip>;
    } else {
      tooltip = this.props.tooltip;
    }

    return (
      <OverlayTrigger
        placement="bottom"
        overlay={tooltip}
        delay={600}
        children={this.props.children}
      />
    );
  }

}

module.exports = OverlayTooltip;
