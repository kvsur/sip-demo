import { Vue, Component, Ref } from 'vue-property-decorator';

import { BButton, BFormInput } from 'bootstrap-vue';
import { Web, URI } from 'sip.js';

import './SipDemo.less';

import SIP_CONFIG from '../sip_config/config.js';

import Elli from './Ellipsis.js';

import { Audio2Wave } from 'audio2wave';

const { USER_AGENT, SIP_CONNECT_DOMAIN, SIP_CONNECT_PORT, SIP_WS_DOMAIN, SIP_WS_PORT, SIP_WS_PROTOCOL } = SIP_CONFIG;

const { SimpleUser } = Web;

const uri = new URI('sip', USER_AGENT, SIP_CONNECT_DOMAIN, SIP_CONNECT_PORT);

@Component
class SipDemo extends Vue {

  userAgent = null; // sipClient
  registed = false; // 用户是否已经注册成功
  connected = false; // sip是否已经连接
  incoming = false; // 当前是否有新的来电
  calling = false; // 是否正在通话中
  number = ''; // number for call
  callingUser = false; // 正在呼叫中

  audio2wave = null;

  @Ref('remoteAudio') audio;
  @Ref('audio2wavetest') audio2wavetest;

  mounted() {
    this.buildConnect();
    
  }

  async initAgent() {
    const userAgent = new SimpleUser(`${SIP_WS_PROTOCOL}://${SIP_WS_DOMAIN}:${SIP_WS_PORT}`, {
      aor: uri,
      delegate: {
        onCallAnswered: (res) => {
          console.warn('callAnswered...');
          this.audio2wave = new Audio2Wave({
            audio: res,
            container: this.audio2wavetest,
            drawerConfig: {
              canvasWH: {
                width: 200,
                height: 80
              }
            }
          })
          queueMicrotask(() => {
            this.audio2wave.start();
          })
          this.callingUser = false;
          this.calling = true;
          this.incoming = false;
        },
        onCallReceived: (res) => {
          console.warn('callReceived...', res);
          this.incoming = true;
        },
        onCallHangup: () => {
          this.audio2wave.destroy();
          this.calling = false;
          this.callingUser = false;
          this.incoming = false;
          console.warn('callHangup...');
        },
        onCallCreated: (res) => {
          console.warn('callCreated...', res);
        },
        onRegistered: (res) => {
          console.warn('userRegisted...', res);
          this.registed = true;
        },
        onServerConnect: (res) => {
          console.warn('serverConnected...', res)
          this.connected = true;
          setTimeout(() => {
            this.userAgent.register();
          }, 1000);
        },
      },
      media: {
        constraints: {
          audio: true,
          vedio: false,
        },
        remote: {
          audio: this.audio
        }
      },
      userAgentOptions: {
        authorizationUsername: USER_AGENT,
        authorizationPassword: '1234',
        uri,
        transportOptions: {
          server: `${SIP_WS_PROTOCOL}://${SIP_WS_DOMAIN}:${SIP_WS_PORT}`
        }
      }
    });

    try {
      this.userAgent = userAgent;
      await userAgent.connect();
    } catch (e) {
      console.error('connecting or registing failed...');
    }

    return Promise.resolve();
  }

  async buildConnect() {
    await this.initAgent();
  }
  async call() {
    const { number } = this;
    try {
      this.callingUser = true;
      await this.userAgent.call(`sip:${number}@${SIP_CONNECT_DOMAIN}:${SIP_CONNECT_PORT}`);
    } catch (e) {
     console.error('call failed...'); 
    }
  }
  hangup() {
    this.userAgent.hangup();
  }
  hold() {
    this.userAgent.hold();
  }
  unhold() {
    this.userAgent.unhold();
  }
  numberInput(v) {
    this.number = v;
  }
  answer() {
    this.userAgent.answer();
  }
  render() {
    const { connected, registed, calling, incoming, number, callingUser } = this;
    return (
      <div class="sip-demo-component-container">
        <div>sip {!connected ? '未连接' : '已连接'}</div>
        <div>{USER_AGENT} {!registed ? '未注册' : '已注册'}</div>
        {calling ? <div>正在通话中<Elli /><BButton variant='danger' size='sm' style={{width: '60px'}} onClick={this.hangup}>挂断</BButton></div>
          : null}
        {
          (callingUser || calling || incoming) ? null : (
            <div>
              <div>暂无通话</div>
              <div style={{display: 'flex'}}>
                <BFormInput value={number} onInput={this.numberInput} size='sm'/>
                <BButton size='sm' style={{width: '60px'}} onClick={this.call} disabled={!number}>呼叫</BButton>
              </div>
            </div>
          )
        }
        { incoming ? <div>
          <span>来电提示中<Elli /></span><BButton variant='success' size='sm' onClick={this.answer}>接听</BButton>
        </div> : null}
        {
          callingUser ? <div>正在拨号中<Elli /></div> : null
        }
        {

        }
        <audio ref="remoteAudio" class="hide-audio" controls src="" />
        <div ref="audio2wavetest" style="height: 80px; width: 500px"/>
      </div>
    );
  }
}

export default SipDemo;
