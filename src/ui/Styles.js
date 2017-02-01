import StyleConstants from './StyleConstants';

export default {
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
  badge: {
    color: '#ffffff',
    borderRadius: '50%',
    height: 20,
    minWidth: 20,
    paddingLeft: 5,
    paddingRight: 5,

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
