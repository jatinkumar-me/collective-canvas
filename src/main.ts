import App from './app';
import './style.css'

function main() {
    const app = new App();
    app.init();
}

window.addEventListener('load', main);
