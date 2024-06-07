<script setup>
import { Button, Alert, Card, Row, Col, message, Input } from 'ant-design-vue';
import { SipClient } from '../../sip/sip-sdk';
import { onMounted } from 'vue';
import { ref } from 'vue';

const registered = ref(false);

/** @type {{ value: SipClient }} */
const sipClient = ref(null);

const callNumber = ref('');

const currentStatus = ref('waiting_call'); // calling， ringing

// 表示通话方向是打出去的还是呼进来
const callDirection = ref('callin'); // callout

onMounted(() => {
  // 这里需要前置坐下获取系统麦克风权限的逻辑，不然sip软电话无法使用，自行处理
  const client = new SipClient({
    remoteAudio: new Audio(), // 也可以是 通过 document.querySelector 或者 getElementById 查询的 audio dom节点
    userAuthNumber: '3088', // 需要找平台查询获取
    userAuthPassword: 'gp51l8vtz', // 需要找平台查询获取
    iceGatheringTimeout: 1000,
    delegate: {
      onServerConnect: () => {
        client.register(
          {
            onAccept: () => {
              message.success('分机注册成功');
              registered.value = true;
            },
            onReject: () => {
              message.error('分机注册失败');
            },
          }
        );
      },
      onServerDisconnect: (error) => {
        console.error(error);
      },
      onCallAnswered: () => {
        // 表示被接听了，不管是打出去的还是呼进来都一样会触发
        currentStatus.value = 'calling';
      },
      onCallCreated: () => {
        // 表示通话被创建了，这时候可以振铃了（如果拨打的用户没有彩铃的话）
        currentStatus.value = 'ringing';
      },
      onCallHangup: () => {
        // 表示通话被挂断了，不管是这边我方挂断还是对方挂断都是触发
        currentStatus.value = 'waiting_call';
      },
      onCallReceived: () => {
        callDirection.value = 'callin';
        currentStatus.value = 'ringing';
      },
    },
    sipConfig: {
        host: '10.10.0.124',
        port: 5080,
    },
    wsConfig: {
        path: 'wss://znkfdemo.wewecall.com:20080/cc_ws_path',
    },
  });

  sipClient.value = client;
  client.connect();
});
function call() {
  // 。。。 其实这里应该有一个前置的步骤是获取真实号码，需要调用平台的接口，后续自行处理
  sipClient.value.call(callNumber.value);
  callDirection.value = 'callout';
  // currentStatus.value = 'ringing';
}

function answer() {
  sipClient.value.answer();
}

function hangup() {
  sipClient.value.hangup();
}

/**
 * @param { Event & { target: { value: string }} } e 
 */
function numberInputHandle(e) {
  callNumber.value = e.target.value;
}

const rightMessage = currentStatus.value === 'ringing' ? '振铃中。。。' : (currentStatus.value === 'calling' ? '正在通话' : '等待通话。。。');
</script>
<template>
  <Card>
    <Row>
      <Col :span="12">
        <Alert type="warning" :message="'分机号注册状态:' + (registered ? '已注册' : '未注册')" />
        <Input :value="callNumber" @change="numberInputHandle" :placeholder="'输入需要呼叫📞的号码'" :disabled="!registered" />
        <Button type="primary" :disabled="!registered || currentStatus !== 'waiting_call'" @click="call()">呼叫</Button>
      </Col>
      <Col>
        <Alert type="success" :message="rightMessage" />
        <Button @click="answer()" type="default" v-if="currentStatus.value === 'ringing' && callDirection.value === 'callin'">接听电话</Button>
        <Button @click="hangup()" danger v-if="currentStatus.value === 'calling' && callDirection.value === 'callin'">挂断电话</Button>
      </Col>
    </Row>
  </Card>
</template>