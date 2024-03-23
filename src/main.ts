import App from './app';
import './style.css'

function main() {
    const app = new App(import.meta.env.VITE_WS_URL ?? 'ws://127.0.0.1:8080/');
    app.init();
}

window.addEventListener('load', main);
