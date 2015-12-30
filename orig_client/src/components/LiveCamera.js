// 'use strict';

// var React = require('react-native');
// var {
//   AppRegistry,
//   StyleSheet,
//   Text,
//   TouchableHighlight,
//   View,
//   TextInput,
//   Component,
// } = React;

// window.navigator.userAgent = "react-native";
// var io = require('socket.io-client/socket.io');
// var socket = io.connect('http://react-native-webrtc.herokuapp.com');
// var configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
// var WebRTC = require('react-native-webrtc');
// var {
//   RTCPeerConnection,
//   RTCMediaStream,
//   RTCIceCandidate,
//   RTCSessionDescription,
//   RTCView,
//   RTCSetting,
// } = WebRTC;

// function refreshPackages() {

//   window.navigator.userAgent = "react-native";
//   io = require('socket.io-client/socket.io');
//   socket = io.connect('http://react-native-webrtc.herokuapp.com');
//   configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
//   WebRTC = require('react-native-webrtc');
//   RTCPeerConnection = WebRTC.RTCPeerConnection;
//   RTCMediaStream = WebRTC.RTCMediaStream;
//   RTCIceCandidate = WebRTC.RTCIceCandidate;
//   RTCSessionDescription = WebRTC.RTCSessionDescription;
//   RTCView = WebRTC.RTCView;
//   RTCSetting = WebRTC.RTCSetting;

// }

// function mapHash(hash, func) {
//   var array = [];
//   for (var key in hash) {
//     var obj = hash[key];
//     array.push(func(obj, key));
//   }
//   return array;
// }

// function logError(error) {
//   console.log("logError", error);
// }

// function peerConnected() {
//   RTCSetting.setAudioOutput('speaker');
//   RTCSetting.setKeepScreenOn(true);
//   RTCSetting.setProximityScreenOff(true);
// }


// class LiveCamera extends Component{

//   initStream() {
//     let { initCameraState, currentWormhole, updateCameraState } = this.props;

//     updateCameraState('roomID', `wormhole${currentWormhole.id}`);

//     socket.on('exchange', (data) => {
//       this.exchange(data);
//     });
//     socket.on('leave', (socketId) => {
//       this.leave(socketId);
//     });
//   }
//   componentWillMount() {
//     this.initStream();
//   }
//   componentDidMount() {
//     RTCSetting.setAudioOutput('speaker');
//     RTCSetting.setKeepScreenOn(true);
//     RTCSetting.setProximityScreenOff(true);
//     this.getLocalStream();
//   }
//   _press(event) {
//     let { liveCamera, updateCameraState } = this.props;
//     // this.refs.roomID.blur();
//     updateCameraState('status', 'connect');
//     updateCameraState('info', 'Connecting');
//     console.log(liveCamera, this.joinRoom);
//     this.joinRoom.call(this,liveCamera.roomID);
//   }
//   getLocalStream() {
//     let { liveCamera, updateCameraState } = this.props;
//     console.log('getLocalStream', liveCamera.selfViewSrc);
//     if(liveCamera.selfViewSrc === null) {
//       navigator.getUserMedia({ "audio": true, "video": true }, function (stream) {
//         updateCameraState('localStream', stream);
//         updateCameraState('selfViewSrc', stream.toURL());
//         updateCameraState('status', 'ready');
//         // updateCameraState('info', 'Please enter or create room ID');
//       }, (err) => console.log(err));
//     } else {
//       updateCameraState('status', 'ready');
//     }
//   }
//   joinRoom(roomID) {
//     let { updateCameraState } = this.props;
//     console.log('about to joing room', roomID);
//     socket.emit('join', roomID, (socketIds) => {
//       console.log('join', socketIds);
//       if(socketIds.length === 0) {
//         updateCameraState('streamMaster', true);
//       }
//       for (var i in socketIds) {
//         var socketId = socketIds[i];
//         console.log(this);
//         this.createPC(socketId, true);
//       }
//     });
//   }
//   createPC(socketId, isOffer) {
//     let { liveCamera, updateCameraState } = this.props;
//     var pc = new RTCPeerConnection(configuration);
//     let tempPcPeers = liveCamera.pcPeers;
//     tempPcPeers[socketId] = pc;
//     updateCameraState('pcPeers', tempPcPeers);

//     pc.onicecandidate = function (event) {
//       console.log('onicecandidate', event.candidate);
//       if (event.candidate) {
//         socket.emit('exchange', {'to': socketId, 'candidate': event.candidate });
//       }
//     };

//     function createOffer() {
//       pc.createOffer(function(desc) {
//         console.log('createOffer', desc);
//         pc.setLocalDescription(desc, function () {
//           console.log('setLocalDescription', pc.localDescription);
//           socket.emit('exchange', {'to': socketId, 'sdp': pc.localDescription });
//         }, logError);
//       }, logError);
//     }

//     pc.onnegotiationneeded = function () {
//       console.log('onnegotiationneeded');
//       if (isOffer) {
//         createOffer();
//       }
//     }

//     pc.oniceconnectionstatechange = function(event) {
//       console.log('oniceconnectionstatechange', event.target.iceConnectionState);
//     };
//     pc.onsignalingstatechange = function(event) {
//       console.log('onsignalingstatechange', event.target.signalingState);
//     };

//     pc.onaddstream = function (event) {
//       console.log('onaddstream', event.stream);
//       updateCameraState('info', 'One peer join!');
//       peerConnected();

//       var remoteList = liveCamera.remoteList;
//       remoteList[socketId] = event.stream.toURL();
//       updateCameraState('remoteList', remoteList);
//     };
//     pc.addStream(liveCamera.localStream);
//     return pc;
//   }
//   exchange(data) {
//     let { liveCamera, updateCameraState } = this.props;
//     var fromId = data.from;
//     var pc;
//     if (fromId in liveCamera.pcPeers) {
//       pc = liveCamera.pcPeers[fromId];
//     } else {
//       pc = this.createPC(fromId, false);
//     }

//     if (data.sdp) {
//       console.log('exchange sdp', data);
//       pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
//         if (pc.remoteDescription.type == "offer")
//           pc.createAnswer(function(desc) {
//             console.log('createAnswer', desc);
//             pc.setLocalDescription(desc, function () {
//               console.log('setLocalDescription', pc.localDescription);
//               socket.emit('exchange', {'to': fromId, 'sdp': pc.localDescription });
//             }, logError);
//           }, logError);
//       }, logError);
//     } else {
//       console.log('exchange candidate', data);
//       pc.addIceCandidate(new RTCIceCandidate(data.candidate));
//     }
//   }
//   leave(socketId) {
//     let { liveCamera, updateCameraState } = this.props;
//     console.log('leave', socketId);
//     var pc = liveCamera.pcPeers[socketId];
//     console.log('leave data: ', liveCamera.pcPeers.length, Object.keys(liveCamera.pcPeers));
//     // var viewIndex = pc.viewIndex;
//     pc.close();
//     var tempPcPeers = liveCamera.pcPeers;
//     delete tempPcPeers[socketId];
//     updateCameraState('pcPeers', tempPcPeers );


//     var remoteList = liveCamera.remoteList;
//     delete remoteList[socketId]
//     updateCameraState('remoteList', remoteList );
//     updateCameraState('info', 'One peer leave!');
//   }
//   back() {
//     socket.disconnect();
//     this.props.navigator.pop();
//   }
//   renderCameras() {
//     let { liveCamera } = this.props;
//     let streamURL = liveCamera.selfViewSrc;
//     console.log('rendering the camera section', liveCamera.streamMaster, liveCamera.remoteList, liveCamera.selfViewSrc);
//     if(!liveCamera.streamMaster) {
//       let masterKey = Object.keys(liveCamera.remoteList).reduce((accum, key) => {
//         console.log('this is the value', liveCamera.remoteList[key]);
//         return liveCamera.remoteList[key] === 1 ? key : accum;
//       }, undefined);
//       console.log('masterkey ', masterKey, liveCamera.remoteList[masterKey]);
//       //streamURL = masterKey === undefined ? streamURL : liveCamera.remoteList[masterKey];
//       return (
//         <RTCView streamURL={liveCamera.remoteList[masterKey]} style={styles.selfView}/>
//       );
//     } else {
//       console.log(streamURL);
//       return (
//         <RTCView streamURL={liveCamera.selfViewSrc} style={styles.selfView}/>
//       );
//     }
//   }
//   render() {
//     let { liveCamera, updateCameraState } = this.props;
//     return (
//       <View style={styles.container}>
//         <View style = {styles.headerContainer}>
//           <TouchableHighlight
//             style = {styles.backButton}
//             onPress = {this.back.bind(this)}
//           >
//             <Text style = {styles.backText}> {'<'} </Text>
//           </TouchableHighlight>
//           <Text style={styles.headerStatus}>
//             {liveCamera.info}
//           </Text>
//           <View style={styles.spacer}/>
//         </View>
//         {this.renderCameras()}
//         <TouchableHighlight
//           style={styles.engageButton}
//           onPress={this._press.bind(this)}>
//           <Text>Engage!</Text>
//         </TouchableHighlight>
//       </View>
//     );
//   }
// };

// var styles = StyleSheet.create({
//   headerContainer: {
//     alignSelf: 'stretch',
//     flexDirection: 'row',
//     flex: 1
//   },
//   selfView: {
//     flex: 10,
//     alignSelf: 'stretch',
//   },
//   remoteView: {
//     width: 100,
//     height: 100,
//   },
//   headerStatus: {
//     flex: 1,
//   },
//   spacer: {
//     flex: 1,
//     backgroundColor: 'red'
//   },
//   backButton: {
//     // flexDirection: 'row',
//     // alignSelf: 'stretch',
//     justifyContent: 'flex-start',
//     flex: 1,
//     backgroundColor: 'black'
//   },
//   backText: {
//     fontSize: 30,
//     color: 'white',
//     alignSelf: 'flex-start',
//     marginLeft: 5
//   },
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     flexDirection: 'column',
//     marginTop: 20
//   },
//   engageButton: {
//     // alignSelf: 'stretch',
//     // flexDirection: 'row',
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'green',
//   },
// });

// export default LiveCamera;