import React from 'react';
import Cell from './Cell';
import PropTypes from 'prop-types';

class Board extends React.Component {
    state = {
        boardData: this.initializeBoardGame(this.props.height, this.props.width, this.props.mines),
        gameStatus: "Currently Playing",
        mineCount: this.props.mines,
    };

    componentDidMount() {
        const gameState =localStorage.getItem("gameState");
        if(gameState) {
            this.setState(JSON.parse(gameState));
            localStorage.removeItem("gameState");
        }

        window.onbeforeunload = () => {
            if(this.state.gameStatus === "Currently Playing") {
                localStorage.setItem("gameState", JSON.stringify(this.state));
            }
        }
    }

    componentWillUnmount() {
        localStorage.setItem("gameState", JSON.stringify(this.state));
    }

    getCellMines(data) {
        let mineArray = [];
        data.forEach(datarow => {
            datarow.forEach((dataitem) => {
                if (dataitem.hasMine) {
                    mineArray.push(dataitem);
                }
            });
        });

        return mineArray;
    }

    getFlags(data) {
        let mineArray = [];

        data.forEach(datarow => {
            datarow.forEach((dataitem) => {
                if (dataitem.isFlagged) {
                    mineArray.push(dataitem);
                }
            });
        });

        return mineArray;
    }

    getHidden(data) {
        let mineArray = [];

        data.forEach(datarow => {
            datarow.forEach((dataitem) => {
                if (!dataitem.isRevealed) {
                    mineArray.push(dataitem);
                }
            });
        });

        return mineArray;
    }


    getRandomNumber(dimension) {
        return Math.floor((Math.random() * 1000) + 1) % dimension;
    }


    initializeBoardGame(height, width, mines) {
        let data = this.createEmptyArray(height, width);
        data = this.plantMines(data, height, width, mines);
        data = this.getNeighbours(data, height, width);
        return data;
    }

    createEmptyArray(height, width) {
        let data = [];

        for (let i = 0; i < height; i++) {
            data.push([]);
            for (let j = 0; j < width; j++) {
                data[i][j] = {
                    x: i,
                    y: j,
                    hasMine: false,
                    neighboursCount: 0,
                    isRevealed: false,
                    isEmpty: false,
                    isFlagged: false,
                };
            }
        }
        return data;
    }

    plantMines(data, height, width, mines) {
        let randomx = 0;
        let randomy = 0
        let minesPlanted = 0;

        while (minesPlanted < mines) {
            randomx = this.getRandomNumber(width);
            randomy = this.getRandomNumber(height);
            if (!(data[randomx][randomy].hasMine)) {
                data[randomx][randomy].hasMine = true;
                minesPlanted++;
            }
        }

        return (data);
    }

    getNeighbours(data, height, width) {
        let updatedData = data;

        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                if (data[i][j].hasMine !== true) {
                    let mine = 0;
                    const area = this.getAllNeighbours(data[i][j].x, data[i][j].y, data);
                    area.forEach(value => {
                        if (value.hasMine) {
                            mine++;
                        }
                    });
                    if (mine === 0) {
                        updatedData[i][j].isEmpty = true;
                    }
                    updatedData[i][j].neighboursCount = mine;
                }
            }
        }

        return (updatedData);
    };

    getAllNeighbours(x, y, data) {
        const neighbours = [];

        if (x > 0) {
            neighbours.push(data[x - 1][y]);
        }

        if (x < this.props.height - 1) {
            neighbours.push(data[x + 1][y]);
        }

        if (y > 0) {
            neighbours.push(data[x][y - 1]);
        }

        if (y < this.props.width - 1) {
            neighbours.push(data[x][y + 1]);
        }

        if (x > 0 && y > 0) {
            neighbours.push(data[x - 1][y - 1]);
        }

        if (x > 0 && y < this.props.width - 1) {
            neighbours.push(data[x - 1][y + 1]);
        }

        if (x < this.props.height - 1 && y < this.props.width - 1) {
            neighbours.push(data[x + 1][y + 1]);
        }

        if (x < this.props.height - 1 && y > 0) {
            neighbours.push(data[x + 1][y - 1]);
        }

        return neighbours;
    }

    revealBoard() {
        let updatedData = this.state.boardData;
        updatedData.forEach((datarow) => {
            datarow.forEach((dataitem) => {
                dataitem.isRevealed = true;
            });
        });
        this.setState({
            boardData: updatedData
        })
    }

    revealEmpty(x, y, data) {
        let area = this.getAllNeighbours(x, y, data);
        area.forEach(value => {
            if (!value.isFlagged && !value.isRevealed && (value.isEmpty || !value.hasMine)) {
                data[value.x][value.y].isRevealed = true;
                if (value.isEmpty) {
                    this.revealEmpty(value.x, value.y, data);
                }
            }
        });
        return data;

    }

    boxClickHandler(x, y) {
        if (this.state.boardData[x][y].isRevealed || this.state.boardData[x][y].isFlagged) return null;

        if (this.state.boardData[x][y].hasMine) {
            this.setState({gameStatus: "Game Over."});
            this.revealBoard();
            alert("Game Over");
            localStorage.removeItem("gameState");
        }

        let updatedData = this.state.boardData;
        updatedData[x][y].isFlagged = false;
        updatedData[x][y].isRevealed = true;

        if (updatedData[x][y].isEmpty) {
            updatedData = this.revealEmpty(x, y, updatedData);
        }

        if (this.getHidden(updatedData).length === this.props.mines) {
            this.setState({mineCount: 0, gameStatus: "You have Won"});
            this.revealBoard();
            alert("You have Won");
            localStorage.removeItem("gameState");
        }

        this.setState({
            boardData: updatedData,
            mineCount: this.props.mines - this.getFlags(updatedData).length,
        });
    }

    boxContextClickHandler(e, x, y) {
        e.preventDefault();
        let updatedData = this.state.boardData;
        let mines = this.state.mineCount;

        // check if already revealed
        if (updatedData[x][y].isRevealed) return;

        if (updatedData[x][y].isFlagged) {
            updatedData[x][y].isFlagged = false;
            mines++;
        } else {
            updatedData[x][y].isFlagged = true;
            mines--;
        }

        if (mines === 0) {
            const mineArray = this.getCellMines(updatedData);
            const FlagArray = this.getFlags(updatedData);
            if (JSON.stringify(mineArray) === JSON.stringify(FlagArray)) {
                this.setState({mineCount: 0, gameStatus: "You have Won"});
                this.revealBoard();
                alert("You have Won");
                localStorage.removeItem("gameState");
            }
        }

        this.setState({
            boardData: updatedData,
            mineCount: mines,
        });
    }

    renderBoard(data) {
        return data.map((datarow, index) => {
            return (
                <div key={index}>
                    {
                        datarow.map((dataitem) => {
                            return (
                                <div key={dataitem.x * datarow.length + dataitem.y}>
                                    <Cell
                                        clickHandler={() => this.boxClickHandler(dataitem.x, dataitem.y)}
                                        contextMenuCickHandler={(e) => this.boxContextClickHandler(e, dataitem.x, dataitem.y)}
                                        value={dataitem}
                                    />
                                </div>
                            );
                        })
                    }
                </div>
            )
        });
    }
  
    render() {
        return (
            <div className="minesweeperContainer">
                <div className="detailsContainer">
                    <h1 className="status">{this.state.gameStatus}</h1>
                    <span className="minesCount">Mines Left To Be Found: {this.state.mineCount}</span>
                </div>
            <div className="boxsContainer">
                {
                    this.renderBoard(this.state.boardData)
                }
            </div>
            </div>
        );
    }
}

Board.propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    mines: PropTypes.number.isRequired
}


export default Board;