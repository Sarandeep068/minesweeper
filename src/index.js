import React from 'react';
import ReactDOM from 'react-dom';
import Game from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Game height={15} width={15} mines={20}/>, document.getElementById('root'));
registerServiceWorker();
