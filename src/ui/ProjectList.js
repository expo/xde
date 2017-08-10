import React, { PropTypes } from 'react';
import { StyleSheet, css } from 'aphrodite';

import ProjectIcon from './ProjectIcon';
import StyleConstants from './StyleConstants';

const projectPropType = PropTypes.shape({
  root: PropTypes.string,
  name: PropTypes.string,
  readableRoot: PropTypes.string,
  icon: PropTypes.string,
});

class Project extends React.Component {
  static propTypes = {
    project: projectPropType.isRequired,
    onSelect: PropTypes.func.isRequired,
  };

  _onClick = () => {
    this.props.onSelect(this.props.project);
  };

  render() {
    const { name, readableRoot, icon } = this.props.project;

    const trimName =
      name.length > 32
        ? `${name.substring(0, 14)}...${name.substring(name.length - 15)}`
        : name;

    const trimRoot =
      readableRoot.length > 44
        ? `${readableRoot.substring(0, 20)}...${readableRoot.substring(
            readableRoot.length - 21
          )}`
        : readableRoot;

    return (
      <div className={css(styles.projectContainer)}>
        <div className={css(styles.project)} onClick={this._onClick}>
          <ProjectIcon size={48} iconUrl={icon} />
          <div className={css(styles.projectDetails)}>
            <div className={css(styles.projectName)} title={name}>
              {trimName}
            </div>
            <div className={css(styles.projectRoot)} title={readableRoot}>
              {trimRoot}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default class ProjectList extends React.Component {
  static propTypes = {
    projects: PropTypes.arrayOf(projectPropType).isRequired,
    onSelect: PropTypes.func.isRequired,
    onNewProjectClick: PropTypes.func.isRequired,
    onOpenProjectClick: PropTypes.func.isRequired,
  };

  _renderProject = (project, index) => {
    return (
      <Project key={index} project={project} onSelect={this.props.onSelect} />
    );
  };

  render() {
    const listWrapperAlign =
      this.props.projects.length < 3
        ? styles.listWrapperCenter
        : styles.listWrapperLeft;

    return (
      <div className={css(styles.container)}>
        <div className={css(styles.listWrapper, listWrapperAlign)}>
          <div className={css(styles.heading)}>Get Started</div>
          <div className={css(styles.cardList)}>
            <div className={css(styles.projectContainer)}>
              <div
                className={css(styles.project, styles.getStartedCard)}
                onClick={this.props.onNewProjectClick}>
                Create new project...
              </div>
            </div>
            <div className={css(styles.projectContainer)}>
              <div
                className={css(styles.project, styles.getStartedCard)}
                onClick={this.props.onOpenProjectClick}>
                Open existing project...
              </div>
            </div>
          </div>
        </div>
        {this.props.projects.length > 0
          ? <div className={css(styles.listWrapper, listWrapperAlign)}>
              <div className={css(styles.heading)}>My Projects</div>
              <div className={css(styles.cardList)}>
                {this.props.projects.map(this._renderProject)}
              </div>
            </div>
          : <div className={css(styles.listWrapper, styles.help)}>
              Not sure? Check out our{' '}
              <a href="https://docs.expo.io/versions/latest/guides/up-and-running.html">
                Up and Running
              </a>{' '}
              guide.
            </div>}
      </div>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    borderTop: `1px solid ${StyleConstants.colorBorder}`,
    backgroundColor: StyleConstants.colorLighterBackground,
    height: '100%',
    padding: StyleConstants.gutterMd,
    overflowY: 'auto',
  },
  heading: {
    margin: StyleConstants.gutterMd,
    marginBottom: 0,
    color: StyleConstants.colorText,
    fontSize: StyleConstants.fontSizeLg,
  },
  listWrapper: {
    margin: '0 auto',
    marginBottom: StyleConstants.gutterLg,
    '@media (max-width: 1280px)': {
      width: 840,
    },
    '@media (max-width: 860px)': {
      width: 420,
    },
  },
  listWrapperCenter: {
    width: 840,
  },
  listWrapperLeft: {
    width: 1280,
  },
  cardList: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  projectContainer: {
    padding: StyleConstants.gutterMd,
    width: 420,
  },
  project: {
    cursor: 'pointer',
    padding: StyleConstants.gutterLg,
    backgroundColor: 'white',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: StyleConstants.colorBorderLight,
    borderRadius: 6,
    height: 90,

    display: 'flex',
    alignItems: 'flex-start',

    boxShadow: '0 0 0 0 rgba(0, 0, 0, 0.07)',
    transition: '200ms linear all',
    transitionProperty: 'box-shadow',
    ':hover': {
      boxShadow: '0 0 16px 0 rgba(0, 0, 0, 0.08)',
    },
  },
  projectDetails: {
    flex: 1,
    paddingLeft: StyleConstants.gutterMd,
    overflow: 'hidden',
  },
  projectName: {
    color: StyleConstants.colorText,
    fontSize: StyleConstants.fontSizeLg,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  projectRoot: {
    color: StyleConstants.colorSubtitle,
    fontSize: StyleConstants.fontSizeMd,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  getStartedCard: {
    alignItems: 'center',
    justifyContent: 'center',
    color: StyleConstants.colorPrimary,
  },
  help: {
    padding: StyleConstants.gutterMd,
    justifyContent: 'center',
    textAlign: 'center',
  },
});
