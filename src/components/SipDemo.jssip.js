import { Vue, Component, Ref } from 'vue-property-decorator';

import { BButton, BModal } from 'bootstrap-vue';

import { URI, UA, WebSocketInterface } from 'jssip';

import './SipDemo.less';


const uri = new URI('sip', '3914', 'www.onmymemory.com', 9070).toString();

@Component({
  components: { BButton, BModal }
})
class SipDemo extends Vue {
  userAgent = null;
  session = null;
  registerer = null;

  async buildConnect() {
    const socket = new WebSocketInterface('wss://www.onmymemory.com:7443')
    const userAgent = new UA({
      sockets: [socket],
      authorization_user: '3914',
      password: '3914',
      uri,
      register: false
    });

    userAgent.on('connecting', res => {
      console.log('connecting......', res)
    });

    userAgent.on('connected', res => {
      console.log('connected......', res);
      this.userAgent = userAgent;
      userAgent.register();

      this.registerer = userAgent.registrator();
    });
    
    userAgent.on('registered', res=> {
      console.log('registed......', res)
    })

    userAgent.start();

    userAgent.call

  }

  call() {
    debugger;
    const session = this.userAgent.call(new URI('sip', '7777', 'www.onmymemory.com', 9070), {
      mediaStream: new MediaStream(),
      anonymous: true,
      session_timers: true,
      session_timers_refresh_method: 'invite',
      mediaConstraints: {
        audio: true,
        video: false,
      },
      eventHandlers: {
        sending: res => {
          console.log('sending......', res);
        },
        connecting: res => {
          console.log('connecting......', res);
        },
        accepted: res => {
          consoele.log('accept......', res);
        },
        failed: err => {
          console.error('accept error......', err.cause)
        },
        confirmed: res => {
          console.log('confirmed......', res)
        },
        ended: res => {
          console.log('ended......', res)
        }
      }
    });
    this.session = session;
  }

  hangup() {
    this.session.terminate();
  }

  hold() {
    this.session.hold();
  }

  render(h) {
    return (
      <div class="sip-demo-component-container">

        <BButton variant="primary" size="sm" onClick={this.buildConnect}>建立连接</BButton>
        <BButton variant="primary" size="sm" onClick={this.call}>开始通话</BButton>
        <BButton variant="primary" size="sm" onClick={this.hangup}>断开</BButton>
        <BButton variant="primary" size="sm" onClick={this.hold}>挂起</BButton>
        {/* <BModal id="sip-demo-bv-modal">
          <div>hello world</div>
        </BModal> */}
        {/* <audio ref="remoteAudio" class="hide-audio" controls src="" /> */}
      </div>
    );
  }
}

export default SipDemo;
