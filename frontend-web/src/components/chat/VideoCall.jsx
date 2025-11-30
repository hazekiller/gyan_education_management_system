import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, X } from "lucide-react";
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

  const [stream, setStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(isAudioOnly);
  const [callDuration, setCallDuration] = useState(0);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const ringtoneRef = useRef();
  const callTimerRef = useRef();

  useEffect(() => {
    if (!isOpen) return;

    // Play ringing sound for incoming calls
    if (isIncomingCall && !callAccepted) {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const playRingtone = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 440; // A4 note
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.5
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      };

      const ringtoneInterval = setInterval(playRingtone, 2000);
      playRingtone(); // Play immediately

      ringtoneRef.current = ringtoneInterval;
    }

    // Get media stream
    navigator.mediaDevices
      .getUserMedia({
        video: !isAudioOnly,
        audio: true,
      })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      })
      .catch((err) => {
        console.error("Failed to get media stream:", err);
        toast.error("Could not access camera or microphone");
        onClose();
      });

    // Handle call ended from other side
    socketService.onCallEnded(() => {
      setCallEnded(true);
      leaveCall(false); // Don't notify the other user as they ended it
      toast.success("Call ended");
    });

    return () => {
      // Cleanup
      socketService.removeListener("call_accepted");
      socketService.removeListener("call_ended");
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (ringtoneRef.current) {
        clearInterval(ringtoneRef.current);
      }
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [isOpen]);

  // Initiate call if we are the caller
  useEffect(() => {
    if (isOpen && !isIncomingCall && stream && userToCall) {
      const peer = new Peer({ initiator: true, trickle: false, stream });

      peer.on("signal", (data) => {
        socketService.callUser({
          userToCall: userToCall.user_id || userToCall.id,
          signalData: data,
          from: currentUser.id,
          name:
            currentUser.name ||
            `${currentUser.first_name} ${currentUser.last_name}`,
        });
      });

      peer.on("stream", (currentStream) => {
        if (userVideo.current) {
          userVideo.current.srcObject = currentStream;
        }
      });

      socketService.onCallAccepted((signal) => {
        setCallAccepted(true);
        peer.signal(signal);
      });

      connectionRef.current = peer;
    }
  }, [isOpen, isIncomingCall, stream, userToCall]);

  // Start call timer when call is accepted
  useEffect(() => {
    if (callAccepted && !callTimerRef.current) {
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
  }, [callAccepted]);

  const answerCall = () => {
    setCallAccepted(true);

    // Stop ringtone
    if (ringtoneRef.current) {
      clearInterval(ringtoneRef.current);
    }

    // Start call timer
    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (data) => {
      socketService.answerCall({ signal: data, to: callerData.from });
    });

    peer.on("stream", (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    peer.signal(callerData.signal);

    connectionRef.current = peer;
  };

  const leaveCall = (notifyOtherUser = true) => {
    setCallEnded(true);

    if (connectionRef.current) {
      connectionRef.current.destroy();
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    // Notify other user
    if (callAccepted && !callEnded && notifyOtherUser) {
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
    if (stream) {
      stream.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div className="relative w-full max-w-4xl h-full max-h-[90vh] flex flex-col p-4">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <div className="text-white">
            <h2 className="text-xl font-semibold">
              {isAudioOnly
                ? isIncomingCall
                  ? callAccepted
                    ? `Audio call with ${callerData?.name || "Unknown"}`
                    : `Incoming audio call from ${
                        callerData?.name || "Unknown"
                      }...`
                  : callAccepted
                  ? `Audio call with ${userToCall?.name || "Unknown"}`
                  : `Audio calling ${userToCall?.name || "Unknown"}...`
                : isIncomingCall
                ? callAccepted
                  ? callerData?.name || "Unknown"
                  : `Incoming call from ${callerData?.name || "Unknown"}...`
                : callAccepted
                ? userToCall?.name || "Unknown"
                : `Calling ${userToCall?.name || "Unknown"}...`}
            </h2>
            {callAccepted && (
              <p className="text-sm text-gray-300 mt-1">
                {formatDuration(callDuration)}
              </p>
            )}
          </div>
          <button
            onClick={leaveCall}
            className="p-2 bg-red-600 rounded-full hover:bg-red-700"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Video Grid */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 items-center justify-center relative">
          {/* My Video (Small overlay or side-by-side) */}
          <div
            className={`relative ${
              callAccepted
                ? "w-32 h-48 absolute bottom-20 right-4 md:static md:w-1/2 md:h-full"
                : "w-full h-full"
            } bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300`}
          >
            {stream && (
              <video
                playsInline
                muted
                ref={myVideo}
                autoPlay
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            )}
            <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
              You {isMuted && "(Muted)"}
            </div>
          </div>

          {/* User Video */}
          {callAccepted && !callEnded && (
            <div className="relative w-full h-full md:w-1/2 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <video
                playsInline
                ref={userVideo}
                autoPlay
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                {isIncomingCall ? callerData.name : userToCall?.name}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-4 flex justify-center space-x-6">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full ${
              isMuted ? "bg-red-500" : "bg-gray-700 hover:bg-gray-600"
            } text-white transition-colors`}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </button>

          {!isAudioOnly && (
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full ${
                isVideoOff ? "bg-red-500" : "bg-gray-700 hover:bg-gray-600"
              } text-white transition-colors`}
            >
              {isVideoOff ? (
                <VideoOff className="w-6 h-6" />
              ) : (
                <Video className="w-6 h-6" />
              )}
            </button>
          )}

          {isIncomingCall && !callAccepted && (
            <button
              onClick={answerCall}
              className="p-4 rounded-full bg-green-500 hover:bg-green-600 text-white animate-pulse"
            >
              <Phone className="w-6 h-6" />
            </button>
          )}

          <button
            onClick={leaveCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
