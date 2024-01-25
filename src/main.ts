import App from './app';
import './style.css'

function main() {
    const app = new App('ws://127.0.0.1:8080/');
    app.init();
}

window.addEventListener('load', main);
