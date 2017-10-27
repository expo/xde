import { StyleSheet, css } from 'aphrodite';
import React, { PropTypes } from 'react';
import { XDLState } from 'xdl';

import SharedStyles from './Styles';
import StyleConstants from './StyleConstants';
import Popover from './toolbar/Popover';
import MenuItem from './toolbar/MenuItem';
import StatusItem from './components/StatusItem';

import { PopoverEnum } from './Constants';

const mapStateToProps = (state, props) => {
  return {
    isPackagerSelected: props.projectRoot
      ? state.projects[props.projectRoot].isPackagerSelected
      : true,
    notifications: props.projectRoot ? state.notifications[props.projectRoot] : null,
  };
};

class PackagerNotificationsSwitcher extends React.Component {
  static propTypes = {
    projectRoot: PropTypes.string.isRequired,
    notifications: PropTypes.object,
    isPackagerSelected: PropTypes.bool.isRequired,
    onTogglePopover: PropTypes.func.isRequired,
    openPopover: PropTypes.string,
  };

  render() {
    let { isPackagerSelected } = this.props;
    const icon = (
      <Popover body={this._renderSwitcher()} arrowOffset={15} popoverOffset={-13} isAbove>
        <img
          src="./SelectUpDown.png"
          className={css(SharedStyles.statusBarIcon)}
          onClick={this._toggleSwitcher}
        />
      </Popover>
    );

    const right = (
      <div>
        <span
          className={css(SharedStyles.statusBarText)}
          style={{ cursor: 'pointer' }}
          onClick={this._toggleSwitcher}>
          {isPackagerSelected ? 'React Native Packager' : 'Notifications'}
        </span>
      </div>
    );

    return (
      <div className={css(styles.statuses)}>
        <StatusItem icon={icon} right={right} />
        {this._renderNotificationsCount()}
      </div>
    );
  }

  _renderSwitcher() {
    let { openPopover, isPackagerSelected, projectRoot } = this.props;

    if (openPopover !== PopoverEnum.NOTIFICATION_PACKAGER) {
      return null;
    }

    let menuItems = [];
    /* eslint-disable react/jsx-no-bind */
    menuItems.push(
      <MenuItem
        label="React Native Packager"
        key="packager"
        checkState={isPackagerSelected ? 'checked' : 'unchecked'}
        onClick={() =>
          XDLState.store.dispatch(XDLState.actions.projects.selectPackagerPane(projectRoot))}
      />
    );
    menuItems.push(
      <MenuItem
        label="Notifications"
        key="notifications"
        checkState={isPackagerSelected ? 'unchecked' : 'checked'}
        onClick={() =>
          XDLState.store.dispatch(XDLState.actions.projects.selectNotificationsPane(projectRoot))}
      />
    );
    /* eslint-enable react/jsx-no-bind */

    return <div>{menuItems}</div>;
  }

  _toggleSwitcher = event => {
    event.stopPropagation();
    this.props.onTogglePopover(PopoverEnum.NOTIFICATION_PACKAGER);
  };

  _renderNotificationsCount = () => {
    let { notifications, isPackagerSelected } = this.props;

    if (!notifications || notifications.count === 0) {
      return null;
    }

    const style = {
      color: notifications.color,
    };

    if (isPackagerSelected) {
      style.cursor = 'pointer';
    }

    const icon = (
      <span className={css(styles.badge)} style={{ backgroundColor: notifications.color }}>
        {notifications.count}
      </span>
    );

    const right = (
      <span className={css(SharedStyles.statusBarText)} style={style}>
        Issues
      </span>
    );

    return <StatusItem onClick={this._onClickYourProjectHasIssues} icon={icon} right={right} />;
  };

  _onClickYourProjectHasIssues = () => {
    XDLState.store.dispatch(
      XDLState.actions.projects.selectNotificationsPane(this.props.projectRoot)
    );
  };
}

export default XDLState.connect(mapStateToProps)(PackagerNotificationsSwitcher);

const styles = StyleSheet.create({
  statuses: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  badge: {
    fontSize: StyleConstants.fontSizeSm,
    color: '#ffffff',
    borderRadius: '50%',
    height: 20,
    minWidth: 20,
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 2,
    paddingTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
