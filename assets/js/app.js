import { Application } from "@hotwired/stimulus";
// Stimulus controllers
import Hello from './controllers/hello_controller';

// SCSS
import './../scss/app.scss';

// Start Stimulus
const application = Application.start();

// Declaration Stimulus controllers
application.register('hello', Hello);
