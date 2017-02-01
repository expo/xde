import { StyleSheet } from 'aphrodite/no-important';
import StyleConstants from './StyleConstants';

let styles = StyleSheet.create({
  iconWithMargin: {
    cursor: 'pointer',
    marginTop: StyleConstants.gutterSm,
    marginBottom: StyleConstants.gutterSm,
  },
  statusBarIcon: {
    height: StyleConstants.statusBarIconSize,
    marginLeft: StyleConstants.gutterMd,
    marginRight: -(StyleConstants.gutterMd + StyleConstants.statusBarIconSize),
  },
  statusBarText: {
    fontSize: StyleConstants.fontSizeSm,
    color: StyleConstants.colorText,
    paddingLeft: StyleConstants.statusBarIconSize + (StyleConstants.gutterMd * 2) - StyleConstants.gutterSm,
    marginVertical: StyleConstants.gutterSm,
  },
});

styles = {
  ...styles,
  input: {
    borderColor: StyleConstants.colorBorder,
    borderWidth: 1,
    borderRadius: 5,
    borderStyle: 'solid',
    paddingTop: 8,
    paddingRight: 8,
    paddingBottom: 8,
    paddingLeft: 8,
  },
  hoverBox: { // gray border and box shadow
    backgroundColor: 'white',
    borderColor: StyleConstants.colorBorder,
    borderStyle: 'solid',
    borderWidth: 1,
    boxShadow: `0 5px 10px rgba(0, 0, 0, 0.2)`,
    color: StyleConstants.colorText,
    minWidth: 190,
  },
  errorMessage: {
    color: StyleConstants.colorError,
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
};

export default styles;
