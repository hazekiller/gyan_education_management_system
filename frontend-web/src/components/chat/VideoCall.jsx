import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  X,
  User,
  Wifi,
  WifiOff,
} from "lucide-react";
import socketService from "../../services/socket";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../store/slices/authSlice";
import toast from "react-hot-toast";

const VideoCall = ({
  isOpen,
  onClose,
  callerData,
  isIncomingCall,
  userToCall,
  onCallEnded,
  isAudioOnly = false,
}) => {
  const currentUser = useSelector(selectCurrentUser);

  // Separate local and remote streams
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [callState, setCallState] = useState("idle"); // idle, connecting, ringing, connected, ended
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(isAudioOnly);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState("good"); // good, fair, poor

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const ringtoneRef = useRef();
  const callTimerRef = useRef();

  // Get media stream on mount
  useEffect(() => {
    if (!isOpen) return;

    setCallState(isIncomingCall ? "ringing" : "connecting");

    // Play ringtone for incoming calls
    if (isIncomingCall && !callAccepted) {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const playRingtone = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 440;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.5
        );
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      };
      const ringtoneInterval = setInterval(playRingtone, 2000);
      playRingtone();
      ringtoneRef.current = ringtoneInterval;
    }

    // Get user media
    const mediaConstraints = {
      video: isAudioOnly
        ? false
        : {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    };

    console.log("🎥 Requesting media with constraints:", mediaConstraints);

    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("❌ getUserMedia not supported");
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;

      let errorMessage = "Camera/microphone access not available.";

      if (
        protocol === "http:" &&
        hostname !== "localhost" &&
        hostname !== "127.0.0.1"
      ) {
        errorMessage =
          "🔒 Video/audio calls require HTTPS! Please use:\n" +
          "• localhost (http://localhost:5173)\n" +
          "• HTTPS connection\n" +
          "• or enable camera permissions in browser settings";
      }

      toast.error(errorMessage);
      onClose();
      return;
    }

    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then((stream) => {
        console.log("✅ Got local stream:", {
          id: stream.id,
          audioTracks: stream.getAudioTracks().length,
          videoTracks: stream.getVideoTracks().length,
        });

        setLocalStream(stream);

        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("❌ Failed to get media stream:", err);
        toast.error(
          isAudioOnly
            ? "Could not access microphone"
            : "Could not access camera or microphone"
        );
        onClose();
      });

    // Handle call ended from other side
    socketService.onCallEnded(() => {
      setCallEnded(true);
      setCallState("ended");
      leaveCall(false);
      toast.success("Call ended");
    });

    return () => {
      // Cleanup
      socketService.removeListener("call_accepted");
      socketService.removeListener("call_ended");
      socketService.removeListener("ice_candidate");

      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (ringtoneRef.current) {
        clearInterval(ringtoneRef.current);
      }
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      if (connectionRef.current && !connectionRef.current.destroyed) {
        connectionRef.current.destroy();
      }
    };
  }, [isOpen]);

  // Initiate call if we are the caller
  useEffect(() => {
    if (isOpen && !isIncomingCall && localStream && userToCall) {
      console.log("📞 Initiating call as caller");
      setCallState("connecting");

      const peer = new Peer({
        initiator: true,
        trickle: true,
        stream: localStream,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            {
              urls: "turn:openrelay.metered.ca:80",
              username: "openrelayproject",
              credential: "openrelayproject",
            },
            {
              urls: "turn:a.relay.metered.ca:443",
              username: "87c4d050e52ff083f0c8694e",
              credential: "sBUFLFd7optT7W8q",
            },
          ],
        },
      });

      peer.on("signal", (data) => {
        if (data.type === "offer") {
          const myName =
            currentUser?.first_name && currentUser?.last_name
              ? `${currentUser.first_name} ${currentUser.last_name}`
              : currentUser?.email?.split("@")[0] || "Unknown";

          console.log(
            "📤 Sending call offer to:",
            userToCall.user_id || userToCall.id
          );
          socketService.callUser({
            userToCall: userToCall.user_id || userToCall.id,
            signalData: data,
            from: currentUser.id,
            name: myName,
            isAudioOnly,
          });
        } else if (data.candidate) {
          socketService.sendIceCandidate({
            to: userToCall.user_id || userToCall.id,
            candidate: data,
          });
        }
      });

      peer.on("stream", (incomingStream) => {
        console.log("✅ Received REMOTE stream (caller side):", {
          id: incomingStream.id,
          audioTracks: incomingStream.getAudioTracks().length,
          videoTracks: incomingStream.getVideoTracks().length,
        });

        // CRITICAL FIX: Set remote stream state
        setRemoteStream(incomingStream);

        if (userVideo.current) {
          userVideo.current.srcObject = incomingStream;
          userVideo.current
            .play()
            .catch((err) => console.error("Error playing remote video:", err));
        }
      });

      peer.on("connect", () => {
        console.log("🎉 Peer connected (caller)");
        setCallState("connected");
        setConnectionQuality("good");
      });

      peer.on("error", (err) => {
        console.error("❌ Peer error (caller):", err);
        toast.error("Connection error: " + err.message);
        setConnectionQuality("poor");
      });

      if (peer._pc) {
        peer._pc.oniceconnectionstatechange = () => {
          console.log("🧊 ICE state (caller):", peer._pc.iceConnectionState);

          switch (peer._pc.iceConnectionState) {
            case "connected":
            case "completed":
              setConnectionQuality("good");
              break;
            case "checking":
              setConnectionQuality("fair");
              break;
            case "failed":
            case "disconnected":
              setConnectionQuality("poor");
              toast.error("Connection failed");
              break;
          }
        };
      }

      socketService.onCallAccepted((signal) => {
        console.log("✅ Call accepted, signaling answer");
        setCallAccepted(true);
        setCallState("connected");
        peer.signal(signal);
      });

      socketService.onIceCandidate((data) => {
        if (
          data.candidate &&
          connectionRef.current &&
          !connectionRef.current.destroyed
        ) {
          connectionRef.current.signal(data.candidate);
        }
      });

      connectionRef.current = peer;
    }

    return () => {
      socketService.removeListener("ice_candidate");
    };
  }, [isOpen, isIncomingCall, localStream, userToCall]);

  // Start call timer when connected
  useEffect(() => {
    if (callState === "connected" && !callTimerRef.current) {
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
  }, [callState]);

  const answerCall = () => {
    console.log("📞 Answering call");
    setCallAccepted(true);
    setCallState("connecting");

    if (ringtoneRef.current) {
      clearInterval(ringtoneRef.current);
    }

    if (!localStream) {
      console.error("❌ No local stream when answering");
      toast.error("Could not access microphone");
      return;
    }

    const peer = new Peer({
      initiator: false,
      trickle: true,
      stream: localStream,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          {
            urls: "turn:a.relay.metered.ca:443",
            username: "87c4d050e52ff083f0c8694e",
            credential: "sBUFLFd7optT7W8q",
          },
        ],
      },
    });

    peer.on("signal", (data) => {
      if (data.type === "answer") {
        socketService.answerCall({ signal: data, to: callerData.from });
      } else if (data.candidate) {
        socketService.sendIceCandidate({
          to: callerData.from,
          candidate: data,
        });
      }
    });

    peer.on("stream", (incomingStream) => {
      console.log("✅ Received REMOTE stream (answerer side):", {
        id: incomingStream.id,
        audioTracks: incomingStream.getAudioTracks().length,
        videoTracks: incomingStream.getVideoTracks().length,
      });

      // CRITICAL FIX: Set remote stream state
      setRemoteStream(incomingStream);

      if (userVideo.current) {
        userVideo.current.srcObject = incomingStream;
        userVideo.current
          .play()
          .catch((err) => console.error("Error playing remote video:", err));
      }
    });

    peer.on("connect", () => {
      console.log("🎉 Peer connected (answerer)");
      setCallState("connected");
      setConnectionQuality("good");
    });

    peer.on("error", (err) => {
      console.error("❌ Peer error (answerer):", err);
      toast.error("Connection error: " + err.message);
    });

    if (peer._pc) {
      peer._pc.oniceconnectionstatechange = () => {
        console.log("🧊 ICE state (answerer):", peer._pc.iceConnectionState);

        switch (peer._pc.iceConnectionState) {
          case "connected":
          case "completed":
            setConnectionQuality("good");
            setCallState("connected");
            break;
          case "checking":
            setConnectionQuality("fair");
            break;
          case "failed":
          case "disconnected":
            setConnectionQuality("poor");
            toast.error("Connection failed");
            break;
        }
      };
    }

    socketService.onIceCandidate((data) => {
      if (
        data.candidate &&
        connectionRef.current &&
        !connectionRef.current.destroyed
      ) {
        connectionRef.current.signal(data.candidate);
      }
    });

    peer.signal(callerData.signal);
    connectionRef.current = peer;
  };

  const leaveCall = (notifyOtherUser = true) => {
    setCallEnded(true);
    setCallState("ended");

    if (connectionRef.current) {
      connectionRef.current.destroy();
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    if (ringtoneRef.current) {
      clearInterval(ringtoneRef.current);
    }
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }

    if (notifyOtherUser) {
      const otherUserId = isIncomingCall
        ? callerData.from
        : userToCall?.user_id || userToCall?.id;
      if (otherUserId) {
        socketService.endCall({ to: otherUserId });
      }
    }

    onCallEnded();
    onClose();
  };

  const toggleMute = () => {
    if (localStream && localStream.getAudioTracks().length > 0) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (localStream && localStream.getVideoTracks().length > 0) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getCallTitle = () => {
    const name = isIncomingCall ? callerData?.name : userToCall?.name;

    if (callState === "ringing" && isIncomingCall) {
      return `Incoming ${isAudioOnly ? "audio" : "video"} call from ${name}...`;
    }
    if (callState === "connecting") {
      return `Connecting to ${name}...`;
    }
    if (callState === "connected") {
      return `${isAudioOnly ? "Audio" : "Video"} call with ${name}`;
    }
    return `Call with ${name}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4 z-10">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <h2 className="text-lg font-semibold">{getCallTitle()}</h2>
            <div className="flex items-center gap-3 mt-1">
              {callState === "connected" && (
                <span className="text-sm text-gray-300">
                  {formatDuration(callDuration)}
                </span>
              )}
              {callState === "connected" && (
                <div className="flex items-center gap-1">
                  {connectionQuality === "good" ? (
                    <Wifi className="w-4 h-4 text-green-400" />
                  ) : connectionQuality === "fair" ? (
                    <Wifi className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-xs text-gray-400 capitalize">
                    {connectionQuality}
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => leaveCall(true)}
            className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {isAudioOnly ? (
          /* Audio Call View */
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="w-16 h-16 text-white" />
              </div>
              {callState === "connected" && (
                <div className="absolute -inset-4 rounded-full border-4 border-blue-400/30 animate-pulse"></div>
              )}
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-white">
                {isIncomingCall ? callerData?.name : userToCall?.name}
              </h3>
              <p className="text-gray-400 mt-2">
                {callState === "ringing" &&
                  isIncomingCall &&
                  "Incoming audio call..."}
                {callState === "connecting" && "Connecting..."}
                {callState === "connected" && "Audio call"}
              </p>
            </div>
            {/* Hidden audio element for remote stream */}
            {remoteStream && (
              <audio ref={userVideo} autoPlay playsInline className="hidden" />
            )}
          </div>
        ) : (
          /* Video Call View */
          <>
            {/* Remote Video (Main) */}
            <div className="relative w-full h-full bg-gray-800">
              {remoteStream && callState === "connected" ? (
                <video
                  ref={userVideo}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-white text-lg">
                    {callState === "ringing" &&
                      isIncomingCall &&
                      "Incoming call..."}
                    {callState === "connecting" && "Connecting..."}
                    {callState === "connected" && "Waiting for video..."}
                  </p>
                </div>
              )}

              {/* Remote user label */}
              {remoteStream && (
                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <span className="text-white text sm font-medium">
                    {isIncomingCall ? callerData?.name : userToCall?.name}
                  </span>
                </div>
              )}
            </div>

            {/* Local Video (Picture-in-Picture) */}
            {localStream && (
              <div className="absolute top-20 right-4 w-40 h-56 bg-gray-800 rounded-lg overflow-hidden shadow-2xl border-2 border-white/20">
                {isVideoOff ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <VideoOff className="w-8 h-8 text-gray-400" />
                  </div>
                ) : (
                  <video
                    ref={myVideo}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform scale-x-[-1]"
                  />
                )}
                <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                  <span className="text-white text-xs">You</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 z-10">
        <div className="flex items-center justify-center gap-4">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all ${
              isMuted
                ? "bg-red-500 hover:bg-red-600"
                : "bg-white/10 hover:bg-white/20 backdrop-blur-sm"
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Video Toggle (only if not audio-only call) */}
          {!isAudioOnly && (
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-all ${
                isVideoOff
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-white/10 hover:bg-white/20 backdrop-blur-sm"
              }`}
              title={isVideoOff ? "Turn on camera" : "Turn off camera"}
            >
              {isVideoOff ? (
                <VideoOff className="w-6 h-6 text-white" />
              ) : (
                <Video className="w-6 h-6 text-white" />
              )}
            </button>
          )}

          {/* End Call Button */}
          <button
            onClick={() => leaveCall(true)}
            className="p-4 bg-red-500 hover:bg-red-600 rounded-full transition-all shadow-lg"
            title="End call"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>

          {/* Answer Button (only for incoming calls) */}
          {isIncomingCall && !callAccepted && (
            <button
              onClick={answerCall}
              className="p-4 bg-green-500 hover:bg-green-600 rounded-full transition-all shadow-lg animate-pulse"
              title="Answer call"
            >
              <Phone className="w-6 h-6 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
