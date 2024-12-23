import styles from "./styles.module.css";

import { Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import { generateRoomName } from "../../utils/generateRoomName";

export function Home() {
  const navigate = useNavigate();

  function handleCreateRoom() {
    const roomName = generateRoomName();
    navigate(`/room/${roomName}`);
  }

  return (
    <div className={styles.container}>
      <h1>Bem-vindo, crie sua sala agora!</h1>
      <div className={styles.content}>
        <Button onClick={handleCreateRoom} variant="primary">
          Criar sala
        </Button>
      </div>
    </div>
  );
}
