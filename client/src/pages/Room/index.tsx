import { FormEvent, useCallback, useEffect, useState } from "react";
import { FaClipboard, FaShareAlt } from "react-icons/fa";
import { useNavigate, useParams } from "react-router";
import { io } from "socket.io-client";

import {
  Button,
  Modal,
  OverlayTrigger,
  Spinner,
  Tooltip,
} from "react-bootstrap";
import styles from "./styles.module.css";

type RoomParams = {
  room: string;
};

type Message = {
  _id: string;
  socket_id: string;
  room: string;
  name: string;
  text: string;
  created_at: Date;
};

type PendingRequest = {
  socket_id: string;
  room: string;
  name: string;
};

type UserConnectInRoomResponse = {
  messages: Message[];
  pendingRequests: PendingRequest[];
};

const socket = io("http://localhost:5000", {});

export function Room() {
  const [modalJoinRoom, setModalJoinRoom] = useState(true);
  const [modalShareLink, setModalShareLink] = useState(false);
  const [waitingForModal, setWaitingForModal] = useState(true);
  const [isGuest, setIsGuest] = useState(true);
  const [userName, setUserName] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [room, setRoom] = useState("");
  const [isJoinRoomLoading, setIsJoinRoomLoading] = useState(false);
  const [modalGuestAccessRequest, setModalGuestAccessRequest] = useState(false);
  const [guestAccessRequestName, setGuestAccessRequestName] = useState("");
  const [guestAccessRequestSID, setGuestAccessRequestSID] = useState("");

  const { room: paramRoom } = useParams<RoomParams>();
  const navigate = useNavigate();

  const listenSockets = useCallback(() => {
    socket.on("newMessageToClient", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on("guestAccessRequest", (data) => {
      setGuestAccessRequestName(data.userName);
      setGuestAccessRequestSID(data.socketId);
      setModalGuestAccessRequest(true);
    });

    socket.on("pendingRequestsToClient", (data) => {
      if (data.length === 0) return;

      setGuestAccessRequestName(data[0].name);
      setGuestAccessRequestSID(data[0].socket_id);
      setModalGuestAccessRequest(true);
    });
  }, []);

  useEffect(() => {
    if (!window.location.pathname.includes("guest")) {
      setIsGuest(false);
      if (paramRoom) setRoom(paramRoom);
    } else {
      if (paramRoom) setRoom(paramRoom.substring(paramRoom.indexOf("@")));
    }
  }, [paramRoom, isGuest]);

  useEffect(() => {
    let isMounted = true;

    if (waitingForModal) return;

    socket.connect();

    listenSockets();

    socket.emit(
      "userConnectInRoom",
      {
        room,
        name: userName,
        isHost: isGuest ? false : true,
      },
      (response: UserConnectInRoomResponse) => {
        if (isMounted) {
          setMessages(response.messages);
        }

        if (!isGuest) {
          response.pendingRequests.forEach((req) => {
            setGuestAccessRequestName(req.name);
            setGuestAccessRequestSID(req.socket_id);
            setModalGuestAccessRequest(true);
          });
        }
      }
    );

    return () => {
      socket.disconnect();
      socket.close();
      isMounted = false;
    };
  }, [room, waitingForModal, userName, isGuest, listenSockets]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!messageInput.trim()) return;

    socket.emit("newMessageToServer", {
      text: messageInput.trim(),
      room,
      name: userName,
    });

    setMessageInput("");
  }

  function handleJoinRoom() {
    if (!userName.trim()) return;

    setIsJoinRoomLoading(true);

    if (isGuest) {
      socket.emit("guestAccessRequestToServer", {
        room,
        userName,
        socketId: socket.id,
      });
      socket.on("hostAccessResponseToClient", (data) => {
        if (data.response === "accept") {
          setModalJoinRoom(false);
          setWaitingForModal(false);
          setIsJoinRoomLoading(false);
          return;
        }
        if (data.response === "reject") {
          return navigate("/");
        }
      });
    } else {
      setModalJoinRoom(false);
      setWaitingForModal(false);
    }
  }

  function handleCloseJoinRoomModal() {
    navigate("/");
  }

  function handleOpenShareLinkModal() {
    const { origin, pathname } = window.location;

    setShareLink(
      `${origin}/room/guest${pathname.substr(pathname.indexOf("@"))}`
    );
    setModalShareLink(true);
  }

  function handleAcceptGuestAccessRequest() {
    socket.emit("hostAccessResponseToServer", {
      response: "accept",
      guestSocketId: guestAccessRequestSID,
      room,
    });

    setModalGuestAccessRequest(false);

    socket.emit("pendingRequestsToServer", {
      room,
    });
  }

  function handleCloseGuestAccessRequest() {
    socket.emit("hostAccessResponseToServer", {
      response: "reject",
      guestSocketId: guestAccessRequestSID,
      room,
    });

    setModalGuestAccessRequest(false);

    socket.emit("pendingRequestsToServer", {
      room,
    });
  }

  async function handleClipboard() {
    await navigator.clipboard.writeText(shareLink);
  }

  return (
    <>
      <Modal show={modalJoinRoom} onHide={handleCloseJoinRoomModal}>
        <Modal.Header closeButton>
          <Modal.Title>Insira um nome para entrar</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ display: "flex", justifyContent: "center" }}>
          <input
            placeholder="Nome de usuário"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleJoinRoom();
              }
            }}
            style={{
              border: "1px solid #474545",
              padding: "5px",
              borderRadius: "4px",
            }}
          />
        </Modal.Body>
        <Modal.Footer>
          {isJoinRoomLoading ? (
            <Button variant="warning" disabled>
              Carregando...
            </Button>
          ) : (
            <Button variant="primary" onClick={handleJoinRoom}>
              Entrar
            </Button>
          )}
        </Modal.Footer>
      </Modal>
      <Modal show={modalShareLink} onHide={() => setModalShareLink(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Mande este link para outras pessoas!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input style={{ width: "100%" }} value={shareLink} disabled />
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" onClick={handleClipboard}>
            <FaClipboard />
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={modalGuestAccessRequest}
        onHide={handleCloseGuestAccessRequest}
      >
        <Modal.Header closeButton>
          <Modal.Title>Alguém quer participar da sala!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Deseja permitir <strong>{guestAccessRequestName}</strong> de entrar na
          sala?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleAcceptGuestAccessRequest}>
            Permitir
          </Button>
          <Button variant="secondary" onClick={handleCloseGuestAccessRequest}>
            Recusar
          </Button>
        </Modal.Footer>
      </Modal>
      {waitingForModal ? (
        <div className={styles.container}>
          <Spinner
            animation="grow"
            variant="warning"
            style={{ width: "100px", height: "100px" }}
          />
        </div>
      ) : (
        <div className={styles.container}>
          <h3>{userName}</h3>
          <h1>Sala: {paramRoom}</h1>
          <div className={styles.content}>
            <ul>
              {messages.map((message) => (
                <div key={message._id}>
                  <div className={styles.separator} />
                  <li>{message.text}</li>
                </div>
              ))}
            </ul>
          </div>
          <form onSubmit={handleSubmit}>
            {!isGuest && (
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Convidar pessoas</Tooltip>}
              >
                <button
                  style={{ background: "#37dee4", marginRight: "10px" }}
                  onClick={handleOpenShareLinkModal}
                  type="button"
                >
                  <FaShareAlt size={20} />
                </button>
              </OverlayTrigger>
            )}
            <input
              type="text"
              placeholder="digite uma mensagem"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <button type="submit">Enviar</button>
          </form>
        </div>
      )}
    </>
  );
}
