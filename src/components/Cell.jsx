import React from 'react';
import PropTypes from 'prop-types';

const Cell = props => {
  const getValue = () => {
    const {value} = props;
    
    if (!value.isRevealed) {
      return props.value.isFlagged ?  "⛳" : null;
    }
    if (value.hasMine) {
      return "💣";
    }
    if (value.neighboursCount === 0) {
      return null;
    }
    return value.neighboursCount;
  }

  const {value, clickHandler, contextMenuCickHandler} = props;
  let className =
    "box" +
    (value.isRevealed ? "" : " unChanged") +
    (value.hasMine ? " hasMine" : "") +
    (value.isFlagged ? " flagged" : "");

  return (
    <div
      onClick={clickHandler}
      className={className}
      onContextMenu={contextMenuCickHandler}
    >
      {getValue()}
    </div>
  );
}

Cell.propTypes = {
    value: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
      hasMine: PropTypes.bool,
      neighboursCount: PropTypes.number,
      isRevealed: PropTypes.bool,
      isEmpty: PropTypes.bool,
      isFlagged: PropTypes.bool,
    }).isRequired
}

export default Cell;
