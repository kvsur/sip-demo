import { Vue, Component } from 'vue-property-decorator';

// import HelloWorld from './components/HelloWorld.vue';
import SipDemo from './components/SipDemo.js';
import logo from './assets/logo.jpg';

import './index.less';

@Component
class App extends Vue {
  render(h) {
    return (
      <div id="app">
        <img alt="Vue logo" src={logo} />
        <SipDemo />
      </div>
    )
  }
}

export default App;
