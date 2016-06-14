import React, {PropTypes} from 'react';

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
    return (
      <div style={Styles.project}
        onClick={this._onClick}>
        <ProjectIcon iconUrl={this.props.project.icon} />
        <div style={Styles.projectName}>{this.props.project.name}</div>
        <div style={Styles.projectRoot}>{this.props.project.readableRoot}</div>
      </div>
    );
  }
}

export default class ProjectList extends React.Component {
  static propTypes = {
    projects: PropTypes.arrayOf(projectPropType).isRequired,
    onSelect: PropTypes.func.isRequired,
  };

  _renderProject = (project, index) => {
    return (
      <Project key={index} project={project} onSelect={this.props.onSelect} />
    );
  };

  render() {
    if (this.props.projects.length === 0) {
      return (
        <div style={Styles.container}>
          <div style={Styles.placeholder}>
            No recent projects to show. Use the Project button to get started.
          </div>
        </div>
      );
    }
    return (
      <div style={Styles.container}>
        <div style={Styles.projectList}>
          {this.props.projects.map(this._renderProject)}
        </div>
      </div>
    );
  }
}

const Styles = {
  container: {
    borderTop: `1px solid ${StyleConstants.colorBorder}`,
    height: '100%',
    margin: StyleConstants.gutterLg,
    marginTop: 0,
    overflowY: 'auto',
    padding: StyleConstants.gutterLg,
    textAlign: 'center',

    display: 'flex',
    justifyContent: 'center',
  },
  placeholder: {
    alignSelf: 'center',
    color: StyleConstants.colorSubtitle,
    fontSize: StyleConstants.fontSizeLg,
    maxWidth: 460,
  },
  project: {
    cursor: 'pointer',
    margin: StyleConstants.gutterLg,
  },
  projectName: {
    color: StyleConstants.colorText,
    fontSize: StyleConstants.fontSizeLg,
  },
  projectRoot: {
    color: StyleConstants.colorSubtitle,
    fontSize: StyleConstants.fontSizeMd,
  },
};
